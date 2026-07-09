import { describe, expect, it } from "vite-plus/test";
import { runRule } from "../../../test-utils/run-rule.js";
import { noRenderReturnValue } from "./no-render-return-value.js";

describe("react-builtins/no-render-return-value — regressions", () => {
  it("still flags when the `ReactDOM` receiver is wrapped in `as any`", () => {
    const result = runRule(
      noRenderReturnValue,
      `const instance = (ReactDOM as any).render(<App />, root);`,
    );
    expect(result.parseErrors).toEqual([]);
    expect(result.diagnostics).toHaveLength(1);
  });
});
