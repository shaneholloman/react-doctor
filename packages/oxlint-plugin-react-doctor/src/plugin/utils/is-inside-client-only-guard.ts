import type { EsTreeNode } from "./es-tree-node.js";
import { isNodeOfType } from "./is-node-of-type.js";
import { referencesClientOnlyFlag } from "./references-client-only-flag.js";

// True when `node` sits in a branch that only renders after a mounted /
// client-only flag flips true — such a branch is absent from the server
// HTML and the first client render alike, so it cannot hydration-mismatch.
export const isInsideClientOnlyGuard = (node: EsTreeNode): boolean => {
  let cursor: EsTreeNode = node;
  let parent: EsTreeNode | null | undefined = node.parent;
  while (parent) {
    if (
      isNodeOfType(parent, "LogicalExpression") &&
      parent.operator === "&&" &&
      parent.right === cursor &&
      referencesClientOnlyFlag(parent.left)
    ) {
      return true;
    }
    if (
      isNodeOfType(parent, "ConditionalExpression") &&
      (parent.consequent === cursor || parent.alternate === cursor) &&
      referencesClientOnlyFlag(parent.test)
    ) {
      return true;
    }
    if (
      isNodeOfType(parent, "IfStatement") &&
      parent.consequent === cursor &&
      referencesClientOnlyFlag(parent.test)
    ) {
      return true;
    }
    cursor = parent;
    parent = parent.parent ?? null;
  }
  return false;
};
