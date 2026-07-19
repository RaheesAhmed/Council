import { create } from "zustand";
import { buildIndependentPrompt } from "../council/prompts";
import type { CouncilMode, CouncilRun, ProviderId } from "../shared/types";
import { saveCouncilRun } from "../storage/runs";

interface RunStoreState {
  activeRun?: CouncilRun;
  startRun(task: string, mode: CouncilMode, selectedProviders: ProviderId[]): Promise<void>;
  stopRun(): Promise<void>;
}
export const useRunStore = create<RunStoreState>((set, get) => ({
  startRun: async (task, mode, selectedProviders) => {
    const timestamp = Date.now();
    const activeRun: CouncilRun = {
      id: crypto.randomUUID(), task, mode, status: "running", selectedProviders,
      stages: ["understanding", "independent", "review", "revision", "synthesis"].map((id, index) => ({ id: id as CouncilRun["stages"][number]["id"], status: index === 1 ? "active" : index === 0 ? "completed" : "pending" })),
      responses: selectedProviders.map((providerId) => ({ providerId, text: "", status: "pending", startedAt: timestamp })),
      reviews: [], revisions: [], createdAt: timestamp, updatedAt: timestamp
    };
    set({ activeRun }); await chrome.storage.session.set({ activeRun }); await saveCouncilRun(activeRun);
    const prompt = buildIndependentPrompt(task, mode);
    await Promise.allSettled(selectedProviders.map((providerId) => chrome.runtime.sendMessage({ type: "PROVIDER_RUN_PROMPT", runId: activeRun.id, providerId, prompt })));
  },
  stopRun: async () => {
    const activeRun = get().activeRun; if (!activeRun) return;
    const stoppedRun = { ...activeRun, status: "stopped" as const, updatedAt: Date.now() };
    set({ activeRun: stoppedRun }); await chrome.storage.session.set({ activeRun: stoppedRun }); await saveCouncilRun(stoppedRun);
  }
}));

chrome.runtime?.onMessage.addListener((candidateMessage) => {
  if (!["PROVIDER_RESPONSE_UPDATE", "PROVIDER_RESPONSE_COMPLETE", "PROVIDER_ERROR"].includes(candidateMessage.type)) return;
  const activeRun = useRunStore.getState().activeRun;
  if (!activeRun || activeRun.id !== candidateMessage.runId) return;
  const responses = activeRun.responses.map((response) => response.providerId !== candidateMessage.providerId ? response : {
    ...response,
    text: candidateMessage.text ?? response.text,
    status: candidateMessage.type === "PROVIDER_RESPONSE_COMPLETE" ? "completed" as const : candidateMessage.type === "PROVIDER_ERROR" ? "failed" as const : "streaming" as const,
    error: candidateMessage.error,
    completedAt: candidateMessage.type === "PROVIDER_RESPONSE_COMPLETE" ? Date.now() : undefined
  });
  const updatedRun = { ...activeRun, responses, updatedAt: Date.now() };
  useRunStore.setState({ activeRun: updatedRun });
  void chrome.storage.session.set({ activeRun: updatedRun }); void saveCouncilRun(updatedRun);
});
