// rule: anchor-is-valid
// weakness: alias-guard
// source: fuzz session 2026-07-08 (destructuring defaults resolved as const values)
declare const config: { href?: string };

const { href = "#" } = config;

export const QuickLink = ({ onActivate }: { onActivate: () => void }) => (
  <a href={href} onClick={onActivate}>
    open
  </a>
);
