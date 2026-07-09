// rule: no-aria-hidden-on-focusable
// weakness: other
// source: fuzz session 2026-07-08 (React drops controls={false}/disabled, so the element is unfocusable)
export const DecorativeHero = () => (
  <video controls={false} aria-hidden="true" autoPlay muted loop src="/hero.mp4" />
);

export const GhostAction = () => (
  <button disabled aria-hidden="true" type="button">
    placeholder
  </button>
);
