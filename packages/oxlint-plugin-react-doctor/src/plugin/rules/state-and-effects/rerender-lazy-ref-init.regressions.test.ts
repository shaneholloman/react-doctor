import { describe, expect, it } from "vite-plus/test";
import { runRule } from "../../../test-utils/run-rule.js";
import { rerenderLazyRefInit } from "./rerender-lazy-ref-init.js";

// Fuzz sweep over the trivial-constructor exemption: only zero-argument,
// identifier-callee constructions of the built-in names are exempt.
describe("rerender-lazy-ref-init — regressions", () => {
  it("flags a trivial-name construction with runtime arguments", () => {
    const result = runRule(
      rerenderLazyRefInit,
      `function C() {
        const byKey = useRef(new Map([["a", 1]]));
        return null;
      }`,
    );
    expect(result.parseErrors).toEqual([]);
    expect(result.diagnostics).toHaveLength(1);
  });

  it("flags a trivial-name construction with a spread argument", () => {
    const result = runRule(
      rerenderLazyRefInit,
      `function C({ iterables }) {
        const byKey = useRef(new Map(...iterables));
        return null;
      }`,
    );
    expect(result.parseErrors).toEqual([]);
    expect(result.diagnostics).toHaveLength(1);
  });

  it("flags `new Date(timestamp)` but not `new Date()`", () => {
    const withArgument = runRule(
      rerenderLazyRefInit,
      `function C({ timestamp }) {
        const startedAt = useRef(new Date(timestamp));
        return null;
      }`,
    );
    const zeroArgument = runRule(
      rerenderLazyRefInit,
      `function C() {
        const startedAt = useRef(new Date());
        return null;
      }`,
    );
    expect(withArgument.diagnostics).toHaveLength(1);
    expect(zeroArgument.diagnostics).toEqual([]);
  });

  it("flags a member-expression callee even when the property matches a trivial name", () => {
    const result = runRule(
      rerenderLazyRefInit,
      `function C() {
        const byKey = useRef(new ns.Map());
        return null;
      }`,
    );
    expect(result.parseErrors).toEqual([]);
    expect(result.diagnostics).toHaveLength(1);
  });

  it("stays silent when only TYPE arguments are passed", () => {
    const result = runRule(
      rerenderLazyRefInit,
      `function C() {
        const byKey = useRef(new Map<string, number>());
        return null;
      }`,
    );
    expect(result.parseErrors).toEqual([]);
    expect(result.diagnostics).toEqual([]);
  });

  it("stays silent on a TS-wrapped trivial construction", () => {
    const result = runRule(
      rerenderLazyRefInit,
      `function C() {
        const seen = useRef(new Set() as Set<string>);
        return null;
      }`,
    );
    expect(result.parseErrors).toEqual([]);
    expect(result.diagnostics).toEqual([]);
  });

  it("flags a TS-wrapped expensive construction (wrapper transparency)", () => {
    const result = runRule(
      rerenderLazyRefInit,
      `function C({ config }) {
        const model = useRef(new HeavyModel(config) as Model);
        return null;
      }`,
    );
    expect(result.parseErrors).toEqual([]);
    expect(result.diagnostics).toHaveLength(1);
  });

  // The rule deliberately does NOT follow identifier bindings — an aliased
  // built-in (`const M = Map`) still fires; the exemption stays name-based
  // so a shadowing import (e.g. immutable's `Map`) stays exempt when
  // constructed with zero arguments.
  it("still flags an aliased constructor binding", () => {
    const result = runRule(
      rerenderLazyRefInit,
      `function C() {
        const M = Map;
        const byKey = useRef(new M());
        return null;
      }`,
    );
    expect(result.parseErrors).toEqual([]);
    expect(result.diagnostics).toHaveLength(1);
  });

  it("keeps the zero-argument exemption for a shadowing binding of a trivial name", () => {
    const result = runRule(
      rerenderLazyRefInit,
      `import { Map } from "immutable";
      function C() {
        const byKey = useRef(new Map());
        return null;
      }`,
    );
    expect(result.parseErrors).toEqual([]);
    expect(result.diagnostics).toEqual([]);
  });
});
