import { parseExtensionMessage } from "../shared/messages";
import { DomProviderAdapter } from "./providers/dom-provider-adapter";
import { getCurrentProviderConfig } from "./providers/provider-config";

const CONTENT_SCRIPT_MARKER = "__councilContentScriptRegistered";
const contentScriptWindow = window as Window & { [CONTENT_SCRIPT_MARKER]?: boolean };
const providerConfig = getCurrentProviderConfig();
if (providerConfig && !contentScriptWindow[CONTENT_SCRIPT_MARKER]) {
  contentScriptWindow[CONTENT_SCRIPT_MARKER] = true;
  const providerAdapter = new DomProviderAdapter(providerConfig);
  chrome.runtime.onMessage.addListener((candidateMessage, _sender, sendResponse) => {
    void (async () => {
      try {
        const message = parseExtensionMessage(candidateMessage);
        if (message.type === "PROVIDER_CHECK_STATUS") sendResponse({ status: await providerAdapter.detectStatus(), diagnostics: providerAdapter.getDiagnostics() });
        if (message.type === "PROVIDER_RUN_PROMPT") {
          await providerAdapter.fillPrompt(message.prompt); await providerAdapter.submitPrompt();
          providerAdapter.observeResponse({
            onStart: () => undefined,
            onUpdate: (text) => void chrome.runtime.sendMessage({ type: "PROVIDER_RESPONSE_UPDATE", runId: message.runId, providerId: providerAdapter.id, text }),
            onComplete: (text) => void chrome.runtime.sendMessage({ type: "PROVIDER_RESPONSE_COMPLETE", runId: message.runId, providerId: providerAdapter.id, text }),
            onError: (error) => void chrome.runtime.sendMessage({ type: "PROVIDER_ERROR", runId: message.runId, providerId: providerAdapter.id, error: error.message })
          });
          sendResponse({ accepted: true });
        }
      } catch (error) { sendResponse({ error: error instanceof Error ? error.message : "Invalid message" }); }
    })();
    return true;
  });
}
