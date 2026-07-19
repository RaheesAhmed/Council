import type { CouncilMode, ProviderResponse, ProviderRevision, ProviderReview } from "../shared/types";

export function buildIndependentPrompt(task: string, mode: CouncilMode): string {
  const modeFocus = mode === "code" ? "Pay particular attention to architecture, security, edge cases, and testing." : "";
  return `You are participating in an independent expert council.\n\nSolve the user's task without seeing or assuming what other experts may say.\n\nTask:\n${task}\n\nRequirements:\n- reason carefully;\n- identify assumptions;\n- provide a practical answer;\n- mention uncertainty;\n- do not refer to yourself as part of a multi-model system;\n- do not wait for other agents;\n- return a complete standalone proposal.\n${modeFocus}`.trim();
}
export function buildSynthesisPrompt(task: string, responses: ProviderResponse[], revisions: ProviderRevision[], reviews: ProviderReview[]): string {
  const proposals = (revisions.length ? revisions : responses).map((entry, index) => `Proposal ${String.fromCharCode(65 + index)}:\n${entry.text}`).join("\n\n");
  const reviewText = reviews.map((review, index) => `Review ${index + 1}:\n${review.text}`).join("\n\n") || "No peer reviews were requested.";
  return `You are the final decision-maker for an expert council.\n\nCreate the strongest possible final response. Evaluate correctness, practicality, security, maintainability, and the user's constraints.\n\nOriginal task:\n${task}\n\nProposals:\n${proposals}\n\nImportant reviews:\n${reviewText}\n\nProduce one coherent answer with assumptions, unresolved uncertainty, rejected approaches when relevant, and practical next steps. Do not mention provider brands or internal orchestration.`;
}
