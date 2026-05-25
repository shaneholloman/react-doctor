import type { Diagnostic, RuleSeverityOverride } from "./types/index.js";

export const SEVERITY_FOR_OVERRIDE: Record<
  Exclude<RuleSeverityOverride, "off">,
  Diagnostic["severity"]
> = {
  error: "error",
  warn: "warning",
};

export const restampSeverity = (
  diagnostic: Diagnostic,
  override: Exclude<RuleSeverityOverride, "off">,
): Diagnostic => {
  const targetSeverity = SEVERITY_FOR_OVERRIDE[override];
  if (diagnostic.severity === targetSeverity) return diagnostic;
  return { ...diagnostic, severity: targetSeverity };
};
