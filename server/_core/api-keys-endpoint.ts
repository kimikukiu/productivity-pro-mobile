import { router, publicProcedure } from "./trpc";
import { z } from "zod";

/**
 * API Keys Endpoint - Backend for API key management
 * Handles validation, storage, and retrieval of LLM provider API keys
 */

// In-memory storage (in production, use database)
const apiKeyStore = new Map<string, {
  provider: string;
  apiKey: string;
  modelId?: string;
  isActive: boolean;
  priority: number;
  lastValidated: Date;
}>();

export const apiKeysEndpointRouter = router({
  /**
   * Add API key
   */
  addKey: publicProcedure
    .input(
      z.object({
        apiKey: z.string(),
        provider: z.string(),
        modelId: z.string().optional(),
        priority: z.number().default(5),
      })
    )
    .mutation(({ input }) => {
      const keyId = `${input.provider}-${Date.now()}`;
      apiKeyStore.set(keyId, {
        provider: input.provider,
        apiKey: input.apiKey,
        modelId: input.modelId,
        isActive: true,
        priority: input.priority,
        lastValidated: new Date(),
      });

      return {
        success: true,
        keyId,
        message: `API key for ${input.provider} added`,
      };
    }),

  /**
   * Get all API keys (masked)
   */
  getKeys: publicProcedure.query(() => {
    const keys: any[] = [];
    apiKeyStore.forEach((value, key) => {
      keys.push({
        id: key,
        provider: value.provider,
        modelId: value.modelId,
        isActive: value.isActive,
        priority: value.priority,
        masked: `${value.apiKey.substring(0, 8)}...${value.apiKey.substring(value.apiKey.length - 4)}`,
        lastValidated: value.lastValidated.toISOString(),
      });
    });
    return keys;
  }),

  /**
   * Delete API key
   */
  deleteKey: publicProcedure
    .input(z.object({ keyId: z.string() }))
    .mutation(({ input }) => {
      const deleted = apiKeyStore.delete(input.keyId);
      return {
        success: deleted,
        message: deleted ? "API key deleted" : "Key not found",
      };
    }),

  /**
   * Update API key status
   */
  updateKeyStatus: publicProcedure
    .input(z.object({ keyId: z.string(), isActive: z.boolean() }))
    .mutation(({ input }) => {
      const key = apiKeyStore.get(input.keyId);
      if (!key) return { success: false, message: "Key not found" };

      key.isActive = input.isActive;
      apiKeyStore.set(input.keyId, key);
      return { success: true, message: "Status updated" };
    }),

  /**
   * Update API key priority
   */
  updateKeyPriority: publicProcedure
    .input(z.object({ keyId: z.string(), priority: z.number() }))
    .mutation(({ input }) => {
      const key = apiKeyStore.get(input.keyId);
      if (!key) return { success: false, message: "Key not found" };

      key.priority = input.priority;
      apiKeyStore.set(input.keyId, key);
      return { success: true, message: "Priority updated" };
    }),

  /**
   * Get active keys for LLM execution
   */
  getActiveKeys: publicProcedure.query(() => {
    const active: any[] = [];
    apiKeyStore.forEach((value) => {
      if (value.isActive) {
        active.push({
          provider: value.provider,
          apiKey: value.apiKey,
          modelId: value.modelId,
          priority: value.priority,
        });
      }
    });
    return active.sort((a, b) => b.priority - a.priority);
  }),

  /**
   * Get system status
   */
  getStatus: publicProcedure.query(() => {
    const total = apiKeyStore.size;
    const active = Array.from(apiKeyStore.values()).filter((k) => k.isActive).length;
    const providers = new Set(Array.from(apiKeyStore.values()).map((k) => k.provider));

    return {
      totalKeys: total,
      activeKeys: active,
      providers: Array.from(providers),
      ready: active > 0,
      message: active > 0 ? "System ready for autonomous execution" : "No active API keys",
    };
  }),
});
