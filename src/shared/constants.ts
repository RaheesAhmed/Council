import type { CouncilMode, ProviderId } from "./types";

export const PROVIDER_DETAILS: Record<ProviderId, { name: string; origin: string }> = {
  chatgpt: { name: "ChatGPT", origin: "https://chatgpt.com/" },
  claude: { name: "Claude", origin: "https://claude.ai/new" },
  gemini: { name: "Gemini", origin: "https://gemini.google.com/app" },
  grok: { name: "Grok", origin: "https://grok.com/" },
  kimi: { name: "Kimi", origin: "https://www.kimi.com/" }
};
export const COUNCIL_MODES: Record<CouncilMode, { name: string; description: string }> = {
  quick: { name: "Quick Council", description: "Independent answers and synthesis" },
  deep_debate: { name: "Deep Debate", description: "Review, revise, and synthesize" },
  adversarial: { name: "Adversarial", description: "Stress-test disputed claims" },
  code: { name: "Code Council", description: "Architecture, security, and testing" }
};
export const COUNCIL_TAB_GROUP_TITLE = "Council Providers";
export const DEFAULT_RESPONSE_TIMEOUT_MS = 120_000;
export const RESPONSE_UPDATE_DEBOUNCE_MS = 250;
