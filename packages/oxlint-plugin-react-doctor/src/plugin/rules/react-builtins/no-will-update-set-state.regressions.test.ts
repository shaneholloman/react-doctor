import { describe, expect, it } from "vite-plus/test";
import { runRule } from "../../../test-utils/run-rule.js";
import { noWillUpdateSetState } from "./no-will-update-set-state.js";

describe("react-builtins/no-will-update-set-state — regressions", () => {
  it("still flags setState when the `this` receiver is wrapped in `as any`", () => {
    const result = runRule(
      noWillUpdateSetState,
      `class Hello extends React.Component {
        componentWillUpdate() {
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
