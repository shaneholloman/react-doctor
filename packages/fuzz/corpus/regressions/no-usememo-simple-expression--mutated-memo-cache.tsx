// rule: no-usememo-simple-expression
// weakness: control-flow
// source: fuzz edge-case sweep 2026-07 — mutation through the memoized
//         binding (`memo.push(x)`, `memo.count = 1`) means the container's
//         cross-render persistence is load-bearing; inlining the literal
//         would reset it every render, so the rule must not fire.
import { useMemo, useReducer } from "react";

export function SelectionLog({ items, initialId }: { items: string[]; initialId: string }) {
  const [, forceUpdate] = useReducer((tick: number) => tick + 1, 0);
  const selectedIds = useMemo(() => [initialId], [initialId]);
  const counters = useMemo(() => ({ clicks: 0 }), []);

  const handleSelect = (id: string) => {
    selectedIds.push(id);
    counters.clicks = counters.clicks + 1;
    forceUpdate();
  };

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>
          <button type="button" onClick={() => handleSelect(item)}>
            {item} ({selectedIds.length} picked, {counters.clicks} clicks)
          </button>
        </li>
      ))}
    </ul>
  );
}
