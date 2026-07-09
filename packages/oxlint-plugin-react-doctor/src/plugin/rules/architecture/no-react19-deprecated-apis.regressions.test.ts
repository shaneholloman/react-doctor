import { describe, expect, it } from "vite-plus/test";
import { runRule } from "../../../test-utils/run-rule.js";
import { noReact19DeprecatedApis } from "./no-react19-deprecated-apis.js";

const run = (code: string, filename = "src/features/profile/ProfileCard.tsx") =>
  runRule(noReact19DeprecatedApis, code, { filename });

const SHADCN_STYLE_SOURCE = `import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

const AlertDialogOverlay = React.forwardRef((props, ref) => (
  <AlertDialogPrimitive.Overlay {...props} ref={ref} />
));
const AlertDialogContent = React.forwardRef((props, ref) => (
  <AlertDialogPrimitive.Content {...props} ref={ref} />
));
const AlertDialogTitle = React.forwardRef((props, ref) => (
  <AlertDialogPrimitive.Title {...props} ref={ref} />
));
`;

describe("architecture/no-react19-deprecated-apis — regressions", () => {
  // prod-fp review: 10 of 40 corpus samples were vendored shadcn/ui files
  // (walterlow__freecut src/components/ui/{accordion,alert-dialog}.tsx,
  // pedropalau__react-bnb-gallery components/ui/sidebar.tsx) — generated
  // code the user should regenerate, not hand-edit.
  it("does not flag vendored shadcn files under components/ui/", () => {
    const result = run(SHADCN_STYLE_SOURCE, "src/components/ui/alert-dialog.tsx");
    expect(result.diagnostics).toEqual([]);
  });

  it("does not flag components/ui/ at the project root", () => {
    const result = run(SHADCN_STYLE_SOURCE, "components/ui/sidebar.tsx");
    expect(result.diagnostics).toEqual([]);
  });

  // prod-fp review: the corpus sampler drew 5 diagnostics from ONE file
  // (alert-dialog.tsx) — per-occurrence reporting of the same API in the
  // same file is density, not signal.
  it("reports each deprecated API at most once per file", () => {
    const result = run(SHADCN_STYLE_SOURCE);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]?.message).toContain("forwardRef");
  });

  // useContext is NOT deprecated in React 19 — `use()` is additive. Flagging
  // it was reward-deciding misinformation (RD-FP-010).
  it("does not flag useContext (not deprecated; use() is additive)", () => {
    const result = run(
      `import { forwardRef, useContext } from "react";
const Ctx = {};
const A = forwardRef((props, ref) => <div ref={ref} />);
const B = forwardRef((props, ref) => <span ref={ref} />);
const useTheme = () => useContext(Ctx);
const useLocale = () => useContext(Ctx);
`,
    );
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]?.message).toContain("forwardRef");
  });

  it("still flags a named forwardRef import outside components/ui/", () => {
    const result = run(
      `import { forwardRef } from "react";
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);
`,
    );
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]?.message).toContain("forwardRef");
  });

  it("does not flag React.useContext on a namespace import", () => {
    const result = run(
      `import * as React from "react";
const Ctx = {};
const useTheme = () => React.useContext(Ctx);
`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("still flags directories that merely resemble components/ui/", () => {
    const result = run(
      `import { forwardRef } from "react";
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);
`,
      "src/components/uikit/input.tsx",
    );
    expect(result.diagnostics).toHaveLength(1);
  });

  // fuzz edge-case wave: the lookup keys on the IMPORTED (canonical) name,
  // so a rename can't hide the deprecated API.
  it("still flags a renamed forwardRef import (forwardRef as fr)", () => {
    const result = run(
      `import { forwardRef as fr } from "react";
const Input = fr((props, ref) => <input ref={ref} {...props} />);
`,
    );
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]?.message).toContain("forwardRef");
  });

  // Type-only imports emit no runtime code — nothing to migrate at runtime.
  it("does not flag a type-only forwardRef import", () => {
    const result = run(
      `import type { forwardRef } from "react";
type ForwardRefFn = typeof forwardRef;
`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("does not flag an inline type specifier (import { type forwardRef })", () => {
    const result = run(
      `import { type forwardRef } from "react";
type ForwardRefFn = typeof forwardRef;
`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("does not flag forwardRef imported from preact/compat", () => {
    const result = run(
      `import { forwardRef } from "preact/compat";
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);
`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("does not flag P.forwardRef on a preact/compat namespace import", () => {
    const result = run(
      `import * as P from "preact/compat";
const Input = P.forwardRef((props, ref) => <input ref={ref} {...props} />);
`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  // Computed member access is intentionally out of scope for the
  // name-based member check — staying silent beats guessing.
  it('does not flag computed member access React["forwardRef"]', () => {
    const result = run(
      `import * as React from "react";
const Input = React["forwardRef"]((props, ref) => <input ref={ref} {...props} />);
`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("does not flag React.forwardRef on a local object with no react import", () => {
    const result = run(
      `const React = { forwardRef: (render) => render };
const Input = React.forwardRef((props, ref) => <input ref={ref} {...props} />);
`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("flags (React as any).forwardRef — the cast wrapper does not change the call", () => {
    const result = run(
      `import * as React from "react";
const Input = (React as any).forwardRef((props, ref) => <input ref={ref} {...props} />);
`,
    );
    expect(result.diagnostics).toHaveLength(1);
  });

  it("flags (React!).forwardRef through a non-null assertion", () => {
    const result = run(
      `import * as React from "react";
const Input = (React!).forwardRef((props, ref) => <input ref={ref} {...props} />);
`,
    );
    expect(result.diagnostics).toHaveLength(1);
  });
});
