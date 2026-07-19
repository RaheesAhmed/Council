import { DEFAULT_RESPONSE_TIMEOUT_MS, RESPONSE_UPDATE_DEBOUNCE_MS } from "../../shared/constants";
import type { ProviderAdapter, ProviderStatus } from "../../shared/types";
import { dispatchInputEvents, findFirstVisible, findFirstVisibleMatch, setNativeInputValue, submitComposerWithEnter, waitForElement, waitForEnabledButton } from "../shared/dom";
import type { ProviderDomConfig } from "./provider-config";

export class DomProviderAdapter implements ProviderAdapter {
  readonly id;
  constructor(private readonly config: ProviderDomConfig) { this.id = config.id; }
  async detectStatus(): Promise<ProviderStatus> {
    if (findFirstVisible(this.config.selectors.loginIndicator)) return "logged_out";
    return findFirstVisible(this.config.selectors.composer) ? "ready" : document.readyState === "complete" ? "error" : "loading";
  }
  getDiagnostics(contentScriptState: "connected" | "injected" = "connected") {
    const composerMatch = findFirstVisibleMatch(this.config.selectors.composer);
    const loginMatch = findFirstVisibleMatch(this.config.selectors.loginIndicator);
    return { currentUrl: location.href, matchedSelector: composerMatch?.selector ?? loginMatch?.selector, documentState: document.readyState, checkedAt: Date.now(), contentScriptState } as const;
  }
  async createNewConversation(): Promise<void> { findFirstVisible(this.config.selectors.newChatButton)?.click(); }
  async fillPrompt(prompt: string): Promise<void> {
    const composer = await waitForElement(this.config.selectors.composer, DEFAULT_RESPONSE_TIMEOUT_MS);
    composer.focus(); setNativeInputValue(composer, prompt); dispatchInputEvents(composer);
  }
  async submitPrompt(): Promise<void> {
    try {
      const sendButton = await waitForEnabledButton(this.config.selectors.sendButton, 4_000);
      sendButton.click();
    } catch {
      const composer = await waitForElement(this.config.selectors.composer, 2_000);
      const containingForm = composer.closest("form");
      const formSubmitButton = containingForm?.querySelector<HTMLButtonElement>("button[type='submit']:not(:disabled), button:not([disabled])");
      if (formSubmitButton && formSubmitButton.getAttribute("aria-disabled") !== "true") {
        formSubmitButton.click();
        return;
      }
      submitComposerWithEnter(composer);
    }
  }
  async getLatestAssistantResponse(): Promise<string> {
    const messages = this.config.selectors.assistantMessages.flatMap((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector)));
    return messages.at(-1)?.innerText.trim() ?? "";
  }
  async isGenerating(): Promise<boolean> { return findFirstVisible(this.config.selectors.stopButton) !== null; }
  async stopGeneration(): Promise<void> { findFirstVisible(this.config.selectors.stopButton)?.click(); }
  observeResponse(callbacks: Parameters<ProviderAdapter["observeResponse"]>[0]): () => void {
    let lastText = ""; let debounceId: number | undefined; callbacks.onStart();
    const emitSnapshot = async (): Promise<void> => {
      try { const text = await this.getLatestAssistantResponse(); if (text && text !== lastText) { lastText = text; callbacks.onUpdate(text); } if (text && !(await this.isGenerating())) { callbacks.onComplete(text); observer.disconnect(); } }
      catch (error) { callbacks.onError(error instanceof Error ? error : new Error("Response observation failed")); }
    };
    const observer = new MutationObserver(() => { window.clearTimeout(debounceId); debounceId = window.setTimeout(() => void emitSnapshot(), RESPONSE_UPDATE_DEBOUNCE_MS); });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
    return () => { window.clearTimeout(debounceId); observer.disconnect(); };
  }
}
