import type { EsTreeNode } from "./es-tree-node.js";
import { isNodeOfType } from "./is-node-of-type.js";
import { walkAst } from "./walk-ast.js";

const LOCALE_ENVIRONMENT_METHOD_NAMES = new Set([
  "toLocaleString",
  "toLocaleDateString",
  "toLocaleTimeString",
  "getTimezoneOffset",
]);

// True when the expression reads locale/timezone environment state —
// `toLocale*()` / `getTimezoneOffset()` calls, anything reached through
// `Intl.*`, or `navigator.language(s)`. Such values CANNOT be computed
// during render on an SSR page (the server's environment differs from the
// user's), so a post-mount `useEffect(() => setX(<locale read>), [])` is
// the deliberate SSR-safe adoption pattern — not a flicker bug and not a
// `useSyncExternalStore` candidate (no-locale-format-in-render is the rule
// that owns the render-phase direction of this pattern).
export const containsLocaleEnvironmentRead = (expression: EsTreeNode): boolean => {
  let readsLocaleEnvironment = false;
  walkAst(expression, (child: EsTreeNode) => {
    if (readsLocaleEnvironment) return false;
    if (isNodeOfType(child, "MemberExpression") && isNodeOfType(child.object, "Identifier")) {
      if (child.object.name === "Intl") {
        readsLocaleEnvironment = true;
        return false;
      }
      if (
        child.object.name === "navigator" &&
        isNodeOfType(child.property, "Identifier") &&
        (child.property.name === "language" || child.property.name === "languages")
      ) {
        readsLocaleEnvironment = true;
        return false;
      }
    }
    if (
      isNodeOfType(child, "CallExpression") &&
      isNodeOfType(child.callee, "MemberExpression") &&
      !child.callee.computed &&
      isNodeOfType(child.callee.property, "Identifier") &&
      LOCALE_ENVIRONMENT_METHOD_NAMES.has(child.callee.property.name)
    ) {
      readsLocaleEnvironment = true;
      return false;
    }
  });
  return readsLocaleEnvironment;
};
