import { describe, expect, it } from "vitest";
import { buildIndependentPrompt, buildSynthesisPrompt } from "../../src/council/prompts";

describe("council prompts", () => {
  it("preserves the original task", () => { expect(buildIndependentPrompt("Design a queue", "code")).toContain("Design a queue"); });
  it("anonymizes synthesis proposals", () => {
    const prompt = buildSynthesisPrompt("Choose a cache", [{ providerId: "chatgpt", text: "Use Redis", status: "completed", startedAt: 1 }], [], []);
    expect(prompt).toContain("Proposal A"); expect(prompt).not.toContain("chatgpt");
  });
});
