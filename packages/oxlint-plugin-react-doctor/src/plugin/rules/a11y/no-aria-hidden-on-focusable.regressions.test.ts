import { describe, expect, it } from "vite-plus/test";
import { runRule } from "../../../test-utils/run-rule.js";
import { noAriaHiddenOnFocusable } from "./no-aria-hidden-on-focusable.js";

describe("a11y/no-aria-hidden-on-focusable regressions", () => {
  it("does not flag a dynamic aria-hidden expression on a focusable element", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const A = ({ interactive }) => (
        <button aria-hidden={!interactive || undefined} type="button">x</button>
      );`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("still flags a literal aria-hidden on a focusable element", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const A = () => <button aria-hidden={true} type="button">x</button>;`,
    );
    expect(result.diagnostics).toHaveLength(1);
  });

  it("does not flag aria-hidden on a canvas with no tabIndex", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const Roll = () => (
        <div>
          <canvas aria-hidden="true" />
          <p className="sr-only">Piano-roll visualization.</p>
        </div>
      );`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("does not flag aria-hidden on table skeleton rows", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const Skeleton = () => (
        <tbody>
          <tr aria-hidden="true">
            <td colSpan={3} style={{ height: 20, padding: 0 }} />
          </tr>
        </tbody>
      );`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("does not flag aria-hidden on a display:none input", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const Trigger = () => (
        <input type="checkbox" style={{ display: 'none' }} aria-hidden="true" readOnly />
      );`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("does not flag aria-hidden on a visibility:hidden textarea", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const Measure = () => (
        <textarea style={{ visibility: 'hidden' }} aria-hidden readOnly />
      );`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("does not flag aria-hidden on a file input hidden via className", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const FileButton = () => <input type="file" className="hidden" aria-hidden />;`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("does not flag aria-hidden when a template className carries a -hidden token", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      "export const AutoSize = ({ classPrefix }) => (\n" +
        "  <textarea className={`${classPrefix}-element ${classPrefix}-element-hidden`} aria-hidden readOnly />\n" +
        ");",
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("does not flag aria-hidden on an element with the hidden attribute", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const A = () => <input hidden aria-hidden="true" />;`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("still flags aria-hidden on a visible input", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const A = () => <input aria-hidden="true" />;`,
    );
    expect(result.diagnostics).toHaveLength(1);
  });

  it("still flags aria-hidden on an anchor with href", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const A = () => <a href="/" aria-hidden="true">x</a>;`,
    );
    expect(result.diagnostics).toHaveLength(1);
  });

  it("still flags aria-hidden on an explicitly tabbable element", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const A = () => <div tabIndex={0} aria-hidden="true">x</div>;`,
    );
    expect(result.diagnostics).toHaveLength(1);
  });

  it("still flags aria-hidden on a canvas made tabbable via tabIndex", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const A = () => <canvas tabIndex={0} aria-hidden="true" />;`,
    );
    expect(result.diagnostics).toHaveLength(1);
  });

  it("does not flag aria-hidden on a decorative background video without controls", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const Hero = ({ onError }) => (
        <video aria-hidden="true" autoPlay muted loop playsInline onError={onError}>
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      );`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("does not flag aria-hidden on an autoplaying audio element without controls", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const Ambience = () => <audio aria-hidden="true" autoPlay loop src="/wind.mp3" />;`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("still flags aria-hidden on a video with controls", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const Player = () => <video controls aria-hidden="true" src="/clip.mp4" />;`,
    );
    expect(result.diagnostics).toHaveLength(1);
  });

  it("still flags aria-hidden on a video made tabbable via tabIndex", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const Player = () => <video tabIndex={0} aria-hidden="true" src="/clip.mp4" />;`,
    );
    expect(result.diagnostics).toHaveLength(1);
  });

  // React drops `controls={false}` entirely, so the media element is as
  // unfocusable as one with no controls attribute at all.
  it("does not flag aria-hidden on a video with controls={false}", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const Hero = () => <video controls={false} aria-hidden="true" src="/a.mp4" />;`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("does not flag aria-hidden on an audio element with controls={false}", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const Ambience = () => <audio controls={false} aria-hidden="true" src="/a.mp3" />;`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("still flags aria-hidden on a video with a dynamic controls value", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const Player = ({ showControls }) => (
        <video controls={showControls} aria-hidden="true" src="/a.mp4" />
      );`,
    );
    expect(result.diagnostics).toHaveLength(1);
  });

  // A disabled form control is removed from the tab order (oxc
  // `is_focusable` parity), so hiding it from AT is coherent.
  it("does not flag aria-hidden on a disabled button", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const Ghost = () => <button disabled aria-hidden="true">x</button>;`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("does not flag aria-hidden on a disabled input", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const Ghost = () => <input disabled aria-hidden="true" />;`,
    );
    expect(result.diagnostics).toEqual([]);
  });

  it("still flags aria-hidden on a button with disabled={false}", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const A = () => <button disabled={false} aria-hidden="true">x</button>;`,
    );
    expect(result.diagnostics).toHaveLength(1);
  });

  it("still flags bare aria-hidden on an embed (always focusable)", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const A = () => <embed aria-hidden src="/a.svg" />;`,
    );
    expect(result.diagnostics).toHaveLength(1);
  });

  // A spread could carry `controls`/`tabIndex`, but reporting on a maybe
  // would be a false positive whenever it doesn't — only provable focus
  // reports (wrapper-transparency doctrine).
  it("does not flag aria-hidden on a video whose props arrive via a spread", () => {
    const result = runRule(
      noAriaHiddenOnFocusable,
      `export const Hero = (props) => <video {...props} aria-hidden="true" src="/a.mp4" />;`,
    );
    expect(result.diagnostics).toEqual([]);
  });
});
