import { isNodeOfType } from "./is-node-of-type.js";
import { stripParenExpression } from "./strip-paren-expression.js";
import type { EsTreeNode } from "./es-tree-node.js";

// Matches `Object.method(...)` for a global namespace (`Date.now()`,
// `Math.random()`, …) through transparent wrappers, so `(Date as any).now()`
// and `(Date!).now()` match the same as the bare form.
export const isGlobalMethodCall = (
  node: EsTreeNode,
  objectName: string,
  methodName: string,
): boolean => {
  if (!isNodeOfType(node, "CallExpression")) return false;
  const callee = stripParenExpression(node.callee);
  if (!isNodeOfType(callee, "MemberExpression") || callee.computed) return false;
  const receiver = stripParenExpression(callee.object);
  return (
    isNodeOfType(receiver, "Identifier") &&
    receiver.name === objectName &&
    isNodeOfType(callee.property, "Identifier") &&
    callee.property.name === methodName
  );
};
