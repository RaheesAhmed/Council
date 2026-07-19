import { z } from "zod";
import { PROVIDER_IDS } from "./types";

const providerIdSchema = z.enum(PROVIDER_IDS);
export const extensionMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("PROVIDERS_CHECK_STATUS") }),
  z.object({ type: z.literal("PROVIDERS_STATUS"), connections: z.array(z.object({ providerId: providerIdSchema, status: z.string(), tabId: z.number().optional(), error: z.string().optional() })) }),
  z.object({ type: z.literal("PROVIDER_OPEN"), providerId: providerIdSchema }),
  z.object({ type: z.literal("PROVIDER_CHECK_STATUS"), providerId: providerIdSchema }),
  z.object({ type: z.literal("PROVIDER_RUN_PROMPT"), runId: z.string().min(1), providerId: providerIdSchema, prompt: z.string().min(1) }),
  z.object({ type: z.literal("PROVIDER_RESPONSE_UPDATE"), runId: z.string(), providerId: providerIdSchema, text: z.string() }),
  z.object({ type: z.literal("PROVIDER_RESPONSE_COMPLETE"), runId: z.string(), providerId: providerIdSchema, text: z.string() }),
  z.object({ type: z.literal("PROVIDER_ERROR"), runId: z.string(), providerId: providerIdSchema, error: z.string() }),
  z.object({ type: z.enum(["RUN_PAUSE", "RUN_RESUME", "RUN_STOP"]), runId: z.string() }),
  z.object({ type: z.literal("WORKSPACE_OPEN") })
]);
export type ExtensionMessage = z.infer<typeof extensionMessageSchema>;
export function parseExtensionMessage(candidate: unknown): ExtensionMessage { return extensionMessageSchema.parse(candidate); }
