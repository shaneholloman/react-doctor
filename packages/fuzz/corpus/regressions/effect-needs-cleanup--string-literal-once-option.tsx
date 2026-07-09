// rule: effect-needs-cleanup
// weakness: paren-shape
// source: fuzz session 2026-07-08 — `{ "once": true }` uses a string-literal
//         property key, which the Identifier-only option check missed, so a
//         self-releasing one-shot listener in a retained handler was flagged.
export const OneShot = () => {
  const armListener = () => {
    window.addEventListener("pointerup", () => {}, { once: true });
  };
  return <button onPointerDown={armListener}>press</button>;
};
