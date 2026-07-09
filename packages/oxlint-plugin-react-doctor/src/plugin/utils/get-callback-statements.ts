import type { EsTreeNode } from "./es-tree-node.js";
import { isNodeOfType } from "./is-node-of-type.js";
import { isNoOpStatement } from "./is-no-op-statement.js";

// No-op statements (`void 0;`, bare literals/directives, `;`) are dropped:
// every consumer is an effect-body analysis whose contract is about the
// statements that DO something, and a stray no-op must not flip a
// "body contains only setState" / "sole statement" check.
export const getCallbackStatements = (callback: EsTreeNode): EsTreeNode[] => {
  if (
    !isNodeOfType(callback, "ArrowFunctionExpression") &&
    !isNodeOfType(callback, "FunctionExpression") &&
    !isNodeOfType(callback, "FunctionDeclaration")
  ) {
    return [];
  }
  const statements = isNodeOfType(callback.body, "BlockStatement")
    ? (callback.body.body ?? [])
    : callback.body
      ? [callback.body]
      : [];
  return statements.filter((statement: EsTreeNode) => !isNoOpStatement(statement));
};
