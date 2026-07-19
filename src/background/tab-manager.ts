import { COUNCIL_TAB_GROUP_TITLE, PROVIDER_DETAILS } from "../shared/constants";
import { PROVIDER_IDS, type ProviderConnection, type ProviderId } from "../shared/types";

function matchesProvider(tab: chrome.tabs.Tab, providerId: ProviderId): boolean {
  const providerOrigin = new URL(PROVIDER_DETAILS[providerId].origin).hostname;
  if (!tab.url) return false;
  const tabHostname = new URL(tab.url).hostname;
  return providerId === "kimi" ? tabHostname === "kimi.com" || tabHostname === "www.kimi.com" : tabHostname === providerOrigin;
}
export async function findProviderTab(providerId: ProviderId): Promise<chrome.tabs.Tab | undefined> {
  const tabs = await chrome.tabs.query({});
  return tabs.find((tab) => matchesProvider(tab, providerId));
}
async function groupProviderTabs(tabIds: number[]): Promise<void> {
  if (tabIds.length === 0) return;
  const [firstTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentWindowId = firstTab?.windowId;
  const existingGroups = currentWindowId ? await chrome.tabGroups.query({ windowId: currentWindowId, title: COUNCIL_TAB_GROUP_TITLE }) : [];
  const groupId = await chrome.tabs.group(existingGroups[0] ? { groupId: existingGroups[0].id, tabIds } : { tabIds });
  await chrome.tabGroups.update(groupId, { title: COUNCIL_TAB_GROUP_TITLE, color: "grey", collapsed: false });
}
export async function openProviderTab(providerId: ProviderId): Promise<chrome.tabs.Tab> {
  const existingTab = await findProviderTab(providerId);
  if (existingTab?.id) { await chrome.tabs.update(existingTab.id, { active: true, autoDiscardable: false }); return existingTab; }
  const createdTab = await chrome.tabs.create({ url: PROVIDER_DETAILS[providerId].origin, active: false });
  if (createdTab.id) await groupProviderTabs([createdTab.id]);
  return createdTab;
}
export async function checkProviderConnections(): Promise<ProviderConnection[]> {
  return Promise.all(PROVIDER_IDS.map(async (providerId): Promise<ProviderConnection> => {
    const providerTab = await findProviderTab(providerId);
    if (!providerTab?.id) return { providerId, status: "not_open" };
    if (providerTab.discarded) {
      await chrome.tabs.reload(providerTab.id);
      return { providerId, status: "loading", tabId: providerTab.id, recoveryAction: "Wait for the reactivated tab to finish loading, then check again." };
    }
    try {
      const response = await chrome.tabs.sendMessage(providerTab.id, { type: "PROVIDER_CHECK_STATUS", providerId });
      return { providerId, status: response?.status ?? "error", tabId: providerTab.id, diagnostics: response?.diagnostics };
    } catch (initialError) {
      try {
        await chrome.scripting.executeScript({ target: { tabId: providerTab.id }, files: ["assets/contentScript.js"] });
        const response = await chrome.tabs.sendMessage(providerTab.id, { type: "PROVIDER_CHECK_STATUS", providerId });
        return { providerId, status: response?.status ?? "error", tabId: providerTab.id, diagnostics: { ...response?.diagnostics, contentScriptState: "injected" } };
      } catch (injectionError) {
        const errorMessage = injectionError instanceof Error ? injectionError.message : String(injectionError);
        return {
          providerId, status: providerTab.status === "loading" ? "loading" : "error", tabId: providerTab.id,
          error: `Council could not connect to this tab: ${errorMessage}`,
          recoveryAction: "Reload this provider tab, then select Check connections.",
          diagnostics: { currentUrl: providerTab.url ?? "Unavailable", checkedAt: Date.now(), contentScriptState: "unavailable" }
        };
      }
    }
  }));
}
