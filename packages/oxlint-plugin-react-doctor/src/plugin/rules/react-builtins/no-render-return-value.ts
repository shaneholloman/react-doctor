import { defineRule } from "../../utils/define-rule.js";
import type { EsTreeNode } from "../../utils/es-tree-node.js";
import type { EsTreeNodeOfType } from "../../utils/es-tree-node-of-type.js";
import { isGlobalMethodCall } from "../../utils/is-global-method-call.js";
import { isNodeOfType } from "../../utils/is-node-of-type.js";

const MESSAGE = "Your app breaks in React 19 because `ReactDOM.render` returns nothing there.";

const isReactDomRenderCall = (node: EsTreeNodeOfType<"CallExpression">): boolean =>
  isGlobalMethodCall(node, "ReactDOM", "render");

const isUsedAsReturnValue = (parent: EsTreeNode | null | undefined): boolean => {
  if (!parent) return false;
  if (
    isNodeOfType(parent, "VariableDeclarator") ||
    isNodeOfType(parent, "Property") ||
    isNodeOfType(parent, "ReturnStatement") ||
    isNodeOfType(parent, "AssignmentExpression")
  ) {
    return true;
  }
  // Expression-bodied arrow function: `() => ReactDOM.render(...)`
  if (
    isNodeOfType(parent, "ArrowFunctionExpression") &&
    parent.body &&
    !isNodeOfType(parent.body, "BlockStatement")
  ) {
    return true;
  }
  return false;
};

// Port of `oxc_linter::rules::react::no_render_return_value`. Reports when
// the return value of `ReactDOM.render(...)` is captured into a variable,
// returned from a function, assigned, used as an object-property value,
// or implicitly returned from an expression-bodied arrow.
export const noRenderReturnValue = defineRule({
  id: "no-render-return-value",
  title: "Using ReactDOM.render return value",
  severity: "warn",
  recommendation:
    "Don't use `ReactDOM.render`'s return value. It's legacy and was removed in React 19.",
  create: (context) => ({
    CallExpression(node: EsTreeNodeOfType<"CallExpression">) {
      if (!isReactDomRenderCall(node)) return;
      if (!isUsedAsReturnValue(node.parent)) return;
      context.report({ node: node.callee, message: MESSAGE });
    },
  }),
});
