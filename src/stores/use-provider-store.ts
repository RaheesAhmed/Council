import { create } from "zustand";
import type { ProviderConnection, ProviderId } from "../shared/types";

interface ProviderStoreState {
  connections: ProviderConnection[]; isChecking: boolean;
  checkConnections(): Promise<void>; openProvider(providerId: ProviderId): Promise<void>;
}
export const useProviderStore = create<ProviderStoreState>((set) => ({
  connections: [], isChecking: false,
  checkConnections: async () => {
    set({ isChecking: true });
    try { const response = await chrome.runtime.sendMessage({ type: "PROVIDERS_CHECK_STATUS" }); set({ connections: response.connections ?? [] }); }
    finally { set({ isChecking: false }); }
  },
  openProvider: async (providerId) => { await chrome.runtime.sendMessage({ type: "PROVIDER_OPEN", providerId }); }
}));
