import { parseExtensionMessage } from "../shared/messages";
import { checkProviderConnections, findProviderTab, openProviderTab } from "./tab-manager";

export function registerMessageRouter(): void {
  chrome.runtime.onMessage.addListener((candidateMessage, _sender, sendResponse) => {
    void (async () => {
      try {
        const message = parseExtensionMessage(candidateMessage);
        if (message.type === "PROVIDERS_CHECK_STATUS") sendResponse({ connections: await checkProviderConnections() });
        else if (message.type === "PROVIDER_OPEN") sendResponse({ tab: await openProviderTab(message.providerId) });
        else if (message.type === "WORKSPACE_OPEN") sendResponse({ tab: await chrome.tabs.create({ url: chrome.runtime.getURL("workspace.html") }) });
        else if (message.type === "PROVIDER_RUN_PROMPT" || message.type === "PROVIDER_CHECK_STATUS") {
          const providerTab = await findProviderTab(message.providerId);
          if (!providerTab?.id) throw new Error("Provider tab is not open");
          sendResponse(await chrome.tabs.sendMessage(providerTab.id, message));
        }
      } catch (error) { sendResponse({ error: error instanceof Error ? error.message : "Message routing failed" }); }
    })();
    return true;
  });
}
