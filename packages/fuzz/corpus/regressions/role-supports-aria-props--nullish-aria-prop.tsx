// rule: role-supports-aria-props
// weakness: other
// source: fuzz session 2026-07-08 (aria prop cleared with undefined/null renders no attribute)
export const Toolbar = () => (
  <div role="toolbar" aria-label="Formatting" aria-multiselectable={undefined} />
);

export const PlainItem = () => <li aria-checked={null}>item</li>;
