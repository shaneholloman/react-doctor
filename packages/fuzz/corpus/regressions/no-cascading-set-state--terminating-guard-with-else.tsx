// rule: no-cascading-set-state
// weakness: control-flow
// source: fuzz session 2026-07-08 — a terminating `if` branch that has an
//         `else` was still summed with the setters after the statement, but
//         the branch returns and never co-runs with them (max path is 2)
import { useEffect, useState } from "react";

export const SyncPanel = ({ mode }: { mode: string | null }) => {
  const [isPrimary, setIsPrimary] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [fallbackLabel, setFallbackLabel] = useState("");
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    if (mode === "primary") {
      setIsPrimary(true);
      setIsLocked(true);
      return;
    } else {
      setFallbackLabel("secondary");
    }
    setIsReady(true);
  }, [mode]);
  return (
    <div>
      {String(isPrimary)}
      {String(isLocked)}
      {fallbackLabel}
      {String(isReady)}
    </div>
  );
};
