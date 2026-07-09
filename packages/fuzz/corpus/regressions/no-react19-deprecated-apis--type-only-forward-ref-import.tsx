// rule: no-react19-deprecated-apis
// weakness: other
// source: fuzz edge-case wave — type-only imports emit no runtime code, so a
//         `forwardRef` type import has nothing to migrate at runtime
import type { forwardRef } from "react";
import { type ComponentProps, useState } from "react";

type ForwardRefFn = typeof forwardRef;
type ButtonProps = ComponentProps<"button">;

export const TypedButton = (props: ButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  return (
    <button {...props} onClick={() => setIsPressed(!isPressed)}>
      {String(isPressed satisfies boolean)}
    </button>
  );
};

export type { ForwardRefFn };
