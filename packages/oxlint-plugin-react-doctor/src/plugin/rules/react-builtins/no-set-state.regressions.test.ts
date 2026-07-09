import { describe, expect, it } from "vite-plus/test";
import { runRule } from "../../../test-utils/run-rule.js";
import { noSetState } from "./no-set-state.js";

describe("react-builtins/no-set-state — regressions", () => {
  it("still flags setState when the `this` receiver is wrapped in `as any`", () => {
    const result = runRule(
      noSetState,
      `class Hello extends React.Component {
        onClick() {
          (this as any).setState({ name: "next" });
        }
        render() {
          return <div>{this.state.name}</div>;
        }
      }`,
    );
    expect(result.parseErrors).toEqual([]);
    expect(result.diagnostics).toHaveLength(1);
  });
});
