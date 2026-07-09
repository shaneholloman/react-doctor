import { TRIVIAL_CONSTRUCTOR_NAMES } from "../constants/react.js";
import type { EsTreeNode } from "./es-tree-node.js";
import { isNodeOfType } from "./is-node-of-type.js";

// Zero-argument construction of a trivial built-in (`new Map()`,
// `new Set()`, `new AbortController()`, …) costs about as much as the
// exempt coercion helpers, so the lazy-init rules skip it. Anything
// that can do real work per render stays flagged: runtime arguments
// (`new Map(entries)` iterates, `new RegExp(pattern)` compiles),
// member-expression callees (`new ns.Map()` is not the global), and
// user-defined constructors. Type-only arguments
// (`new Map<string, number>()`) don't count as runtime arguments.
// The check is name-based on purpose — a shadowing binding like
// immutable's `Map` import is just as cheap to construct empty, and
// treating it as expensive would be the noisier mistake.
export const isTrivialBuiltInConstruction = (expression: EsTreeNode): boolean =>
  isNodeOfType(expression, "NewExpression") &&
  isNodeOfType(expression.callee, "Identifier") &&
  TRIVIAL_CONSTRUCTOR_NAMES.has(expression.callee.name) &&
  (expression.arguments ?? []).length === 0;
