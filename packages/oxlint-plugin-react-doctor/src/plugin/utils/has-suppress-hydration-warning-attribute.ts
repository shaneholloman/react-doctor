import type { EsTreeNode } from "./es-tree-node.js";
import { isNodeOfType } from "./is-node-of-type.js";

export const hasSuppressHydrationWarningAttribute = (
  openingElement: EsTreeNode | null,
): boolean => {
  if (!openingElement || !isNodeOfType(openingElement, "JSXOpeningElement")) return false;
  for (const attr of openingElement.attributes ?? []) {
    if (
      isNodeOfType(attr, "JSXAttribute") &&
      isNodeOfType(attr.name, "JSXIdentifier") &&
      attr.name.name === "suppressHydrationWarning"
    ) {
      return true;
    }
  }
  return false;
};
