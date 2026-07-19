import { beforeEach, describe, expect, it } from "vitest";
import { findFirstVisible, setNativeInputValue } from "../../src/content/shared/dom";

describe("provider DOM helpers", () => {
  beforeEach(() => { document.body.innerHTML = ""; });
  it("uses selector fallbacks in order", () => {
    document.body.innerHTML = '<textarea aria-label="Prompt"></textarea>';
    const textarea = document.querySelector("textarea")!;
    Object.defineProperty(textarea, "getBoundingClientRect", { value: () => ({ width: 100, height: 40 }) });
    expect(findFirstVisible(["#missing", "textarea"])).toBe(textarea);
  });
  it("sets textarea values through the native setter", () => {
    const textarea = document.createElement("textarea"); document.body.append(textarea);
    setNativeInputValue(textarea, "Council task"); expect(textarea.value).toBe("Council task");
  });
});
