// rule: effect-needs-cleanup
// weakness: control-flow
// source: fuzz session 2026-07-08 — a concise-body interval factory hands the
//         timer id to its caller (who stores and clears it), but the implicit
//         return was treated as a discarded id and flagged as an unclearable
//         leak.
import { useCallback, useRef } from "react";

export const Poller = () => {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const schedule = useCallback(() => setInterval(() => {}, 1000), []);
  const start = () => {
    timerRef.current = schedule();
  };
  const stop = () => {
    if (timerRef.current !== null) clearInterval(timerRef.current);
  };
  return (
    <div>
      <button onClick={start}>start</button>
      <button onClick={stop}>stop</button>
    </div>
  );
};
