import { describe, expect, it } from "vite-plus/test";
import { runRule } from "../../../test-utils/run-rule.js";
import { hookUseState } from "./hook-use-state.js";

describe("react-builtins/hook-use-state — regressions", () => {
  it("still flags a non-destructured useState when the `React` receiver is wrapped in `as any`", () => {
    const result = runRule(hookUseState, `const state = (React as any).useState(0);`);
    expect(result.parseErrors).toEqual([]);
    expect(result.diagnostics).toHaveLength(1);
  });
});
