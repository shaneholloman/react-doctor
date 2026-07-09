import type { EsTreeNode } from "./es-tree-node.js";
import { isNodeOfType } from "./is-node-of-type.js";
import { stripParenExpression } from "./strip-paren-expression.js";

// Mounted-flag hooks (`const isClient = useClient()`, `useIsMounted()`,
// `useHydrated()`, …) are false on the server AND on the client's first
// (hydration) render, flipping true only in an effect — so JSX gated by
// such a flag renders identically on both sides and cannot mismatch.
const CLIENT_ONLY_FLAG_NAME_PATTERN =
  /^(?:is|has|did)?_?(?:client|mounted|hydrated|browser)(?:_?(?:side|ready|only))?$/i;

export const referencesClientOnlyFlag = (expression: EsTreeNode): boolean => {
  const unwrapped = stripParenExpression(expression);
  if (isNodeOfType(unwrapped, "Identifier")) {
    return CLIENT_ONLY_FLAG_NAME_PATTERN.test(unwrapped.name);
  }
  if (isNodeOfType(unwrapped, "MemberExpression")) {
    const property = unwrapped.property;
    return (
      isNodeOfType(property, "Identifier") && CLIENT_ONLY_FLAG_NAME_PATTERN.test(property.name)
    );
  }
  if (isNodeOfType(unwrapped, "UnaryExpression") && unwrapped.operator === "!") {
    return referencesClientOnlyFlag(unwrapped.argument);
  }
  if (isNodeOfType(unwrapped, "LogicalExpression")) {
    return referencesClientOnlyFlag(unwrapped.left) || referencesClientOnlyFlag(unwrapped.right);
  }
  return false;
};
