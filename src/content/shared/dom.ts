export interface SelectorSet { composer: string[]; sendButton: string[]; stopButton: string[]; assistantMessages: string[]; newChatButton: string[]; loginIndicator: string[] }

export function isElementVisible(element: Element): boolean {
  const bounds = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return bounds.width > 0 && bounds.height > 0 && style.visibility !== "hidden" && style.display !== "none";
}
export function findFirstVisible(selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    const match = Array.from(document.querySelectorAll<HTMLElement>(selector)).find(isElementVisible);
    if (match) return match;
  }
  return null;
}
export function findFirstEnabledButton(selectors: string[]): HTMLButtonElement | null {
  for (const selector of selectors) {
    const button = Array.from(document.querySelectorAll<HTMLButtonElement>(selector)).find((candidate) => isElementVisible(candidate) && !candidate.disabled && candidate.getAttribute("aria-disabled") !== "true");
    if (button) return button;
  }
  return null;
}
export function findFirstVisibleMatch(selectors: string[]): { element: HTMLElement; selector: string } | null {
  for (const selector of selectors) {
    const element = Array.from(document.querySelectorAll<HTMLElement>(selector)).find(isElementVisible);
    if (element) return { element, selector };
  }
  return null;
}
export function waitForElement(selectors: string[], timeoutMs: number): Promise<HTMLElement> {
  const immediateMatch = findFirstVisible(selectors);
  if (immediateMatch) return Promise.resolve(immediateMatch);
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => { observer.disconnect(); reject(new Error(`Element not found within ${timeoutMs}ms`)); }, timeoutMs);
    const observer = new MutationObserver(() => {
      const match = findFirstVisible(selectors);
      if (!match) return;
      window.clearTimeout(timeoutId); observer.disconnect(); resolve(match);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
  });
}
export function waitForEnabledButton(selectors: string[], timeoutMs: number): Promise<HTMLButtonElement> {
  const immediateButton = findFirstEnabledButton(selectors);
  if (immediateButton) return Promise.resolve(immediateButton);
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => { observer.disconnect(); reject(new Error(`Enabled button not found within ${timeoutMs}ms`)); }, timeoutMs);
    const observer = new MutationObserver(() => {
      const enabledButton = findFirstEnabledButton(selectors);
      if (!enabledButton) return;
      window.clearTimeout(timeoutId); observer.disconnect(); resolve(enabledButton);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "aria-disabled", "class"] });
  });
}
export function setNativeInputValue(element: HTMLElement, value: string): void {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), "value");
    descriptor?.set?.call(element, value);
  } else {
    element.focus();
    const selection = window.getSelection();
    const editorRange = document.createRange();
    editorRange.selectNodeContents(element);
    selection?.removeAllRanges(); selection?.addRange(editorRange);
    const wasInsertedByBrowser = document.execCommand("insertText", false, value);
    if (!wasInsertedByBrowser) {
      element.replaceChildren(document.createTextNode(value));
      editorRange.selectNodeContents(element); editorRange.collapse(false);
      selection?.removeAllRanges(); selection?.addRange(editorRange);
    }
  }
}
export function dispatchInputEvents(element: HTMLElement): void {
  element.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
  element.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: element.textContent }));
  element.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}
export function submitComposerWithEnter(composer: HTMLElement): void {
  composer.focus();
  const keyboardEventOptions: KeyboardEventInit = { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true };
  composer.dispatchEvent(new KeyboardEvent("keydown", keyboardEventOptions));
  composer.dispatchEvent(new KeyboardEvent("keypress", keyboardEventOptions));
  composer.dispatchEvent(new KeyboardEvent("keyup", keyboardEventOptions));
}
