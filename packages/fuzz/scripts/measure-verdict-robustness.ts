import { livenessFixtures } from "../../oxlint-plugin-react-doctor/src/plugin/liveness/liveness-fixtures.js";
import { reactDoctorRules } from "../../oxlint-plugin-react-doctor/src/plugin/rule-registry.js";
import { runRule } from "../../oxlint-plugin-react-doctor/src/test-utils/run-rule.js";
import { buildVerdictPreservingVariants } from "../src/verdict-preserving-variants.js";

// Registry-wide verdict-robustness census: for every AST rule with a
// liveness fixture, apply each verdict-preserving rewrite to the canonical
// bad example and report where the diagnostic disappears. Advisory (never
// fails) — the enforced slice lives in tests/verdict-robustness.test.ts.
//
//   bun scripts/measure-verdict-robustness.ts
//   VERDICT_ADVISORY=1 bun scripts/measure-verdict-robustness.ts   # include optional-chain tier

const includeAdvisoryTier = process.env.VERDICT_ADVISORY === "1";

interface VerdictDrop {
  ruleId: string;
  variantLabel: string;
  mustPreserveVerdict: boolean;
}

const drops: VerdictDrop[] = [];
let checkedRuleCount = 0;
let variantRunCount = 0;

for (const entry of reactDoctorRules) {
  if (typeof entry.rule.scan === "function") continue;
  const fixture = livenessFixtures[entry.id];
  if (!fixture) continue;
  const filename = fixture.filePath ?? "fixture.tsx";
  const runOptions = { filename, settings: fixture.settings, forceJsx: true };

  let baseCount = 0;
  try {
    baseCount = runRule(entry.rule, fixture.code, runOptions).diagnostics.length;
  } catch {
    continue;
  }
  if (baseCount === 0) continue;
  checkedRuleCount += 1;

  for (const variant of buildVerdictPreservingVariants(fixture.code, filename)) {
    if (!variant.mustPreserveVerdict && !includeAdvisoryTier) continue;
    variantRunCount += 1;
    try {
      const mutated = runRule(entry.rule, variant.code, runOptions);
      if (mutated.parseErrors.length > 0) continue;
      if (mutated.diagnostics.length === 0) {
        drops.push({
          ruleId: entry.id,
          variantLabel: variant.label,
          mustPreserveVerdict: variant.mustPreserveVerdict,
        });
      }
    } catch {
      drops.push({
        ruleId: entry.id,
        variantLabel: `${variant.label} (CRASH)`,
        mustPreserveVerdict: variant.mustPreserveVerdict,
      });
    }
  }
}

console.log(`rules checked: ${checkedRuleCount} (variant runs: ${variantRunCount})`);
console.log(`\n=== VERDICT DROPS (rule fired on fixture, silent on rewrite): ${drops.length}`);
const byVariant = new Map<string, VerdictDrop[]>();
for (const drop of drops) {
  byVariant.set(drop.variantLabel, [...(byVariant.get(drop.variantLabel) ?? []), drop]);
}
for (const [label, labelDrops] of [...byVariant.entries()].sort(
  (a, b) => b[1].length - a[1].length,
)) {
  console.log(`\n  ${label} (${labelDrops.length})`);
  for (const drop of labelDrops) {
    console.log(`    ${drop.mustPreserveVerdict ? "MUST" : "advisory"}  ${drop.ruleId}`);
  }
}
