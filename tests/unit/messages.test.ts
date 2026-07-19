import { describe, expect, it } from "vitest";
import { parseExtensionMessage } from "../../src/shared/messages";

describe("extension message validation", () => {
  it("accepts typed provider prompt messages", () => {
    const message = parseExtensionMessage({ type: "PROVIDER_RUN_PROMPT", runId: "run-1", providerId: "claude", prompt: "Review this" });
    expect(message.type).toBe("PROVIDER_RUN_PROMPT");
    if (message.type === "PROVIDER_RUN_PROMPT") expect(message.providerId).toBe("claude");
  });
  it("rejects unsupported providers", () => { expect(() => parseExtensionMessage({ type: "PROVIDER_OPEN", providerId: "unknown" })).toThrow(); });
});
