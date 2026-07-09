import type { EsTreeNode } from "./es-tree-node.js";
import { findDeclaratorForBinding } from "./find-declarator-for-binding.js";
import { findVariableInitializer } from "./find-variable-initializer.js";
import { flattenLogicalAndChain } from "./flatten-logical-and-chain.js";
import { isHookCall } from "./is-hook-call.js";
import { isNodeOfType } from "./is-node-of-type.js";
import { stripParenExpression } from "./strip-paren-expression.js";

// State from `useState(falsyLiteral)` is identical on the server and on the
// client's first (hydration) render — it only flips after a post-hydration
// state update. JSX gated behind such a flag (interaction-opened editors,
// transient toasts) is absent from both sides of the hydration comparison.
const isFalsyLiteral = (node: EsTreeNode | null | undefined): boolean => {
  if (!node) return true;
  if (isNodeOfType(node, "Literal")) return !node.value;
  return isNodeOfType(node, "Identifier") && node.name === "undefined";
};

const isFalsyInitialStateBinding = (identifier: EsTreeNode): boolean => {
  if (!isNodeOfType(identifier, "Identifier")) return false;
  const binding = findVariableInitializer(identifier, identifier.name);
  if (!binding) return false;
  const declarator = findDeclaratorForBinding(binding.bindingIdentifier);
  if (!declarator?.init) return false;
  const init = stripParenExpression(declarator.init);
  if (!isHookCall(init, "useState") || !isNodeOfType(init, "CallExpression")) return false;
  if (!isNodeOfType(declarator.id, "ArrayPattern")) return false;
  if (declarator.id.elements?.[0] !== binding.bindingIdentifier) return false;
  return isFalsyLiteral(init.arguments?.[0]);
};

export const referencesFalsyInitialState = (expression: EsTreeNode): boolean =>
  flattenLogicalAndChain(stripParenExpression(expression)).some((operand) =>
    isFalsyInitialStateBinding(stripParenExpression(operand)),
  );
