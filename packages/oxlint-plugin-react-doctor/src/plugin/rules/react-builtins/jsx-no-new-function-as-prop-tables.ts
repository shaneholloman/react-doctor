// Allow-listed handler / render-prop / safe-receiver names consumed by
// the `jsx-no-new-function-as-prop` rule's analysis. Kept beside the
// rule (same bucket directory) so the rule file stays focused on the
// detection logic instead of carrying ~250 lines of curated naming
// conventions. Behaviour-neutral extraction.

/**
 * Handler / render-prop names that conventionally fire at most once
 * per component lifecycle (mount / unmount / ready / error / load /
 * destroy / completion / open / close) OR are render-prop slots
 * called per-render but only when the slot is mounted (one-shot
 * fallbacks, render-as-function patterns, custom UI hooks).
 *
 * For these, a new function reference per render has zero measurable
 * perf impact — the handler isn't called in a hot interaction path,
 * and even if the surrounding component is memoized and re-renders,
 * the handler still fires the same number of times.
 */
export const ONE_SHOT_LIFECYCLE_HANDLER_NAMES: ReadonlySet<string> = new Set([
  "onMount",
  "onUnmount",
  "onReady",
  "onInit",
  "onLoad",
  "onDestroy",
  "onBeforeMount",
  "onAfterMount",
  "onBeforeUnmount",
  "onAfterUnmount",
  "onError",
  "onComplete",
  "onCompleted",
  "onFinish",
  "onFinished",
  "onSuccess",
  "onAbort",
  "onOpen",
  "onClose",
  "onDismiss",
  "onCancel",
  "onConfirm",
  // Save / submit / commit / remove / delete — intent-class callbacks
  // that fire at most once per user action (not per render or per
  // pointer-move). New function reference per render has no measurable
  // perf impact: the handler doesn't run in any hot path.
  "onSave",
  "onSubmit",
  "onCommit",
  "onApply",
  "onRemove",
  "onDelete",
  "onDuplicate",
  "onReset",
  "onRetry",
  "onRefresh",
  "onAdd",
  "onCreate",
  "onUpdate",
  // Compound action-button conventions (`onConfirmClick`, `onAcceptClick`)
  "onConfirmClick",
  "onAcceptClick",
  "onCancelClick",
  "onSaveClick",
  // Outside-click / press-enter / escape / context-menu — sparse user
  // intent, not per-render or per-pointer-move events.
  "onClickOutside",
  "onPressEnter",
  "onEnter",
  "onEscape",
  "onLeave",
  // Drag / drop — fires on action completion, not per-frame; consumers
  // don't memo on these refs.
  "onDragStart",
  "onDragEnd",
  "onDrop",
  "onSort",
  // Render-prop / customization slots — accept a function that's
  // either called once (fallback) or used by the parent to render
  // subviews. Real perf hits flow through the children, not the
  // identity of these slot functions.
  "fallback",
  "fallbackRender",
  "render",
  "renderItem",
  "renderRow",
  "renderCell",
  "renderEmpty",
  "renderError",
  "renderLoading",
  "renderHeader",
  "renderFooter",
  "renderName",
  "renderContent",
  "renderTrigger",
  "renderOption",
  "renderItemActions",
  "children",
  "useCustom",
  // PascalCase render-slot props (`Icon={() => <X/>}`, `Trigger={…}`,
  // etc.) — by convention these receive a render function whose output
  // is inserted directly into the tree. Identity doesn't matter.
  "Icon",
  "Trigger",
  "Header",
  "Footer",
  "Label",
  "Content",
  "Adornment",
  "Indicator",
  "Tooltip",
  "Badge",
  "Panel",
  "Overlay",
  "Section",
  "Button",
  "Action",
  // Radix / Headless UI controlled-state callbacks — fire on user
  // interaction, not per render, and library consumers don't memoize
  // by their identity.
  "onValueChange",
  "onCheckedChange",
  "onOpenChange",
  "onSelectionChange",
  "onPressedChange",
  "onToggleChange",
  "onSearch",
  "onSearchChange",
  "onClear",
  "onCopy",
  "onPaste",
  "onPick",
  "onActiveChange",
  "onExpandedChange",
  "onSortChange",
  "onFilterChange",
  "onSelectChange",
  // Common selection / toggle / navigation intent callbacks — fire on
  // discrete user actions, not per render.
  "onSelect",
  "onToggle",
  "onTab",
  "onShiftTab",
  "onBack",
  "onForward",
  "onPrev",
  "onNext",
  "onSkip",
  "onContinue",
  "onPressCmdEnter",
  "onPressCmdK",
  "onCloseRequest",
  "onCloseRequested",
  "onRowClick",
  "onCellClick",
  "onHeaderClick",
  "onToggleExpand",
  "onToggleCollapse",
  "onVisibilityChange",
  "onVariableSelect",
  "onSelectColor",
  // Generic intent / action callbacks (per-action, not per-render)
  "action",
  "onEdit",
  "onView",
  "onApprove",
  "onReject",
  "onArchive",
  "onUnarchive",
  "onPin",
  "onUnpin",
  "onShare",
  "onDownload",
  "onUpload",
  "onPrint",
  "onExport",
  "onImport",
  "onMove",
  "onRename",
  // Table-row callbacks (antd / data-table style) — per-row, not per-render
  "rowKey",
  "onRow",
  "onCell",
  "onHeader",
  "onHeaderRow",
  "onHeaderCell",
  "onPageChange",
  "onTabChange",
  // Form field common per-action callbacks
  "onNameChange",
  "onDescriptionChange",
  "onInputChange",
  "onLabelChange",
  "onValueCommit",
]);

/**
 * Render-prop / slot / customization suffix conventions — `render*`,
 * `*Render`, `*Renderer`, `*Slot`, `*Component`, `*Element`, plus
 * PascalCase-suffix slot props (`actionButton`, `closeIcon`, etc.).
 */
export const ONE_SHOT_HANDLER_SUFFIXES: ReadonlyArray<string> = [
  "Render",
  "Renderer",
  "Slot",
  "Component",
  "Element",
  "Icon",
  "Trigger",
  "Header",
  "Footer",
  "Label",
  "Content",
  "Adornment",
  "Indicator",
  "Tooltip",
  "Badge",
  "Panel",
  "Overlay",
  "Section",
  "Button",
  "Action",
  "Override",
  "Fallback",
];

/**
 * `get*`, `format*`, `parse*`, `validate*`, `is*`, `should*`,
 * `match*`, `select*`, `to*` — pure-ish accessor / predicate /
 * formatter function props called on demand, not on every render.
 * New identity is OK.
 */
export const ACCESSOR_PREDICATE_PREFIXES: ReadonlyArray<string> = [
  "get",
  "format",
  "parse",
  "validate",
  "is",
  "should",
  "match",
  "select",
  "filter",
  "compare",
];

/**
 * Receivers whose method calls don't typically pass derived state —
 * navigation, routing, telemetry, dialog management. Used as a "fully
 * stable" gate: any args to these calls are accepted as stable even
 * if they're themselves call expressions, because the outer wrapper
 * is doing a fire-and-forget side effect.
 */
export const SAFE_RECEIVER_NAMES: ReadonlySet<string> = new Set([
  "router",
  "navigate",
  "navigation",
  "history",
  "console",
  "window",
  "document",
  "location",
  "localStorage",
  "sessionStorage",
  "analytics",
  "telemetry",
  "logger",
  "log",
  "posthog",
  "Sentry",
  // Pure-function namespaces — outputs are determined by inputs,
  // call args (even when themselves call expressions) compose
  // cleanly with the wrapper.
  "Math",
  "Number",
  "String",
  "Boolean",
  "Array",
  "Object",
  "JSON",
  "Date",
  "Promise",
  "Map",
  "Set",
  "Symbol",
]);
