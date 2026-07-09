import type { EsTreeNode } from "./es-tree-node.js";
import { isNodeOfType } from "./is-node-of-type.js";
import { referencesFalsyInitialState } from "./references-falsy-initial-state.js";

// True when `node` only renders once a `useState(falsyLiteral)` flag has
// flipped truthy — that flip can only happen after hydration, so the gated
// branch cannot appear in the server-vs-first-client-render comparison.
export const isGatedByFalsyInitialState = (node: EsTreeNode): boolean => {
  let cursor: EsTreeNode = node;
  let parent: EsTreeNode | null | undefined = node.parent;
  while (parent) {
    if (
      isNodeOfType(parent, "LogicalExpression") &&
      parent.operator === "&&" &&
      parent.right === cursor &&
      referencesFalsyInitialState(parent.left)
    ) {
      return true;
    }
    if (
      isNodeOfType(parent, "ConditionalExpression") &&
      parent.consequent === cursor &&
      referencesFalsyInitialState(parent.test)
    ) {
      return true;
    }
    if (
      isNodeOfType(parent, "IfStatement") &&
      parent.consequent === cursor &&
      referencesFalsyInitialState(parent.test)
    ) {
      return true;
    }
    cursor = parent;
    parent = parent.parent ?? null;
  }
  return false;
};
