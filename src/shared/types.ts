export const PROVIDER_IDS = ["chatgpt", "claude", "gemini", "grok", "kimi"] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];
export type ProviderStatus = "not_open" | "loading" | "logged_out" | "ready" | "generating" | "rate_limited" | "verification_required" | "error";
export type CouncilMode = "quick" | "deep_debate" | "adversarial" | "code";
export type CouncilRunStatus = "pending" | "running" | "paused" | "completed" | "stopped" | "failed";
export type CouncilStageId = "understanding" | "independent" | "review" | "revision" | "synthesis";
export type StageStatus = "pending" | "active" | "completed" | "failed" | "skipped";

export interface ProviderDiagnostics { currentUrl: string; matchedSelector?: string; documentState?: string; checkedAt: number; contentScriptState: "connected" | "injected" | "unavailable" }
export interface ProviderConnection { providerId: ProviderId; status: ProviderStatus; tabId?: number; error?: string; recoveryAction?: string; diagnostics?: ProviderDiagnostics }
export interface CouncilStage { id: CouncilStageId; status: StageStatus; startedAt?: number; completedAt?: number }
export interface ProviderResponse { providerId: ProviderId; text: string; status: "pending" | "streaming" | "completed" | "failed"; startedAt: number; completedAt?: number; error?: string }
export interface ProviderReview { reviewerId: ProviderId; text: string; createdAt: number }
export interface ProviderRevision { providerId: ProviderId; text: string; createdAt: number }
export interface FinalAnswer { providerId: ProviderId; text: string; createdAt: number }
export interface CouncilRun {
  id: string; task: string; mode: CouncilMode; status: CouncilRunStatus; selectedProviders: ProviderId[];
  stages: CouncilStage[]; responses: ProviderResponse[]; reviews: ProviderReview[]; revisions: ProviderRevision[];
  finalAnswer?: FinalAnswer; createdAt: number; updatedAt: number;
}
export interface CouncilRunConfig { task: string; mode: CouncilMode; selectedProviders: ProviderId[]; synthesizerId?: ProviderId }
export interface ProviderAdapter {
  id: ProviderId;
  detectStatus(): Promise<ProviderStatus>;
  createNewConversation(): Promise<void>;
  fillPrompt(prompt: string): Promise<void>;
  submitPrompt(): Promise<void>;
  getLatestAssistantResponse(): Promise<string>;
  isGenerating(): Promise<boolean>;
  stopGeneration(): Promise<void>;
  observeResponse(callbacks: { onStart(): void; onUpdate(text: string): void; onComplete(text: string): void; onError(error: Error): void }): () => void;
}
