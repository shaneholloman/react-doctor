/**
 * Shared raw-line scanners that detect whether a diagnostic site is
 * enclosed by a configured `textComponents` entry or a
 * `rawTextWrapperComponents` entry. Both checks are used by the
 * diagnostic-pipeline's `rn-no-raw-text` suppression step.
 *
 * Heuristic — operates on raw lines without an AST — but good enough
 * to (a) detect a string-only wrapper child and (b) verify the opener
 * actually encloses a given diagnostic position.
 */

const OPENING_TAG_PATTERN = /<([A-Z][\w.]*)/;
const JSX_CHILD_OPEN_PATTERN = /<[A-Za-z]/;

const escapeRegExpSpecials = (rawText: string): string =>
  rawText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

interface JsxOpener {
  fullName: string;
  leafName: string;
  lineIndex: number;
}

interface ResolvedJsxRange {
  closerLineIndex: number;
  closerColumn: number;
  bodyText: string;
}

const findOpenerAtOrAbove = (lines: string[], upperBoundLineIndex: number): JsxOpener | null => {
  for (let lineIndex = upperBoundLineIndex; lineIndex >= 0; lineIndex--) {
    const match = lines[lineIndex].match(OPENING_TAG_PATTERN);
    if (!match) continue;
    const fullName = match[1];
    const leafName = fullName.includes(".") ? (fullName.split(".").at(-1) ?? fullName) : fullName;
    return { fullName, leafName, lineIndex };
  }
  return null;
};

// Resolves the inner-body text of a JSX element starting at `opener`,
// plus the position of its matching closing tag. Returns `null` when
// we couldn't confidently locate the element's closing tag or body
// (no matching `</Tag>`, opening `>` missing, self-closing tag, etc.).
const resolveJsxRange = (lines: string[], opener: JsxOpener): ResolvedJsxRange | null => {
  const closingPattern = new RegExp(
    `</(?:${escapeRegExpSpecials(opener.fullName)}|${escapeRegExpSpecials(opener.leafName)})\\s*>`,
  );

  let closerLineIndex = -1;
  let closerColumn = -1;
  for (let lineIndex = opener.lineIndex; lineIndex < lines.length; lineIndex++) {
    const match = closingPattern.exec(lines[lineIndex]);
    if (!match) continue;
    closerLineIndex = lineIndex;
    closerColumn = match.index;
    break;
  }
  if (closerLineIndex < 0) return null;

  const openerLine = lines[opener.lineIndex];
  const tagStartIndex = openerLine.indexOf(`<${opener.fullName}`);
  if (tagStartIndex < 0) return null;
  const openerEndIndex = openerLine.indexOf(">", tagStartIndex);

  let bodyText: string;
  if (opener.lineIndex === closerLineIndex) {
    if (openerEndIndex < 0 || openerEndIndex >= closerColumn) return null;
    bodyText = openerLine.slice(openerEndIndex + 1, closerColumn);
  } else {
    const segments: string[] = [];
    if (openerEndIndex >= 0) segments.push(openerLine.slice(openerEndIndex + 1));
    for (let lineIndex = opener.lineIndex + 1; lineIndex < closerLineIndex; lineIndex++) {
      segments.push(lines[lineIndex]);
    }
    segments.push(lines[closerLineIndex].slice(0, closerColumn));
    bodyText = segments.join("\n");
  }

  return { closerLineIndex, closerColumn, bodyText };
};

/**
 * Returns true when the JSX element opened at or above `diagnosticLine`
 * is named in `textComponentNames`, matching either by full dotted name
 * (`NativeTabs.Trigger.Label`) or by the leaf name (`Label`).
 */
export const isInsideTextComponent = (
  lines: string[],
  diagnosticLine: number,
  textComponentNames: ReadonlySet<string>,
): boolean => {
  for (let lineIndex = diagnosticLine - 1; lineIndex >= 0; lineIndex--) {
    const match = lines[lineIndex].match(OPENING_TAG_PATTERN);
    if (!match) continue;
    const fullTagName = match[1];
    const leafTagName = fullTagName.includes(".")
      ? (fullTagName.split(".").at(-1) ?? fullTagName)
      : fullTagName;
    return textComponentNames.has(fullTagName) || textComponentNames.has(leafTagName);
  }
  return false;
};

/**
 * Returns true when the diagnostic position is enclosed by the nearest
 * actually-enclosing opener AND that opener is in `wrapperNames` AND
 * its body has no JSX child elements (i.e. the wrapper holds only
 * stringifiable children). Closed siblings above the diagnostic are
 * skipped — `findOpenerAtOrAbove` keeps walking outward.
 *
 * Diagnostic line and column are 1-indexed; column may be 0 when oxlint
 * omits the span (we treat that as "earliest position on the line",
 * which is conservative for enclosure checks).
 */
export const isInsideStringOnlyWrapper = (
  lines: string[],
  diagnosticLine: number,
  diagnosticColumn: number,
  wrapperNames: ReadonlySet<string>,
): boolean => {
  const diagnosticLineIndex = diagnosticLine - 1;
  const diagnosticColumnIndex = Math.max(0, diagnosticColumn - 1);
  let upperBoundLineIndex = diagnosticLineIndex;

  while (upperBoundLineIndex >= 0) {
    const opener = findOpenerAtOrAbove(lines, upperBoundLineIndex);
    if (!opener) return false;

    const range = resolveJsxRange(lines, opener);
    if (range === null) {
      upperBoundLineIndex = opener.lineIndex - 1;
      continue;
    }

    const isClosedBeforeDiagnostic =
      range.closerLineIndex < diagnosticLineIndex ||
      (range.closerLineIndex === diagnosticLineIndex &&
        range.closerColumn <= diagnosticColumnIndex);
    if (isClosedBeforeDiagnostic) {
      upperBoundLineIndex = opener.lineIndex - 1;
      continue;
    }

    if (!wrapperNames.has(opener.fullName) && !wrapperNames.has(opener.leafName)) return false;
    return !JSX_CHILD_OPEN_PATTERN.test(range.bodyText);
  }

  return false;
};
