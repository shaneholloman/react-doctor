// rule: effect-needs-cleanup
// weakness: control-flow
// source: fuzz session 2026-07-08 — statement-level release after the
//         registration in the same effect body was not connected to the
//         usage, so one-shot connect/measure-then-release effects were
//         flagged despite nothing outliving the effect run.
import { useEffect } from "react";

export const PingOnce = ({ url }: { url: string }) => {
  useEffect(() => {
    const socket = new WebSocket(url);
    socket.send("ping");
    socket.close();
  }, [url]);
  return null;
};

export const MeasureOnce = ({ el }: { el: Element }) => {
  useEffect(() => {
    const observer = new ResizeObserver(() => {});
    observer.observe(el);
    observer.disconnect();
  }, [el]);
  return null;
};
