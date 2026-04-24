import { router, publicProcedure } from "./trpc";
import { z } from "zod";
import { apiKeyStore } from "./api-keys-storage";

/**
 * API Keys Endpoint - Backend for API key management
 * Handles validation, storage, and retrieval of LLM provider API keys
 */

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
      const keyId = apiKeyStore.addKey(
        input.provider,
        input.apiKey,
        input.modelId,
        input.priority
      );

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
    return apiKeyStore.getAllKeys().map((key) => ({
      id: key.id,
      provider: key.provider,
      modelId: key.modelId,
      isActive: key.isActive,
      priority: key.priority,
      masked: `${key.apiKey.substring(0, 8)}...${key.apiKey.substring(key.apiKey.length - 4)}`,
      lastValidated: key.lastValidated.toISOString(),
    }));
  }),

  /**
   * Delete API key
   */
  deleteKey: publicProcedure
    .input(z.object({ keyId: z.string() }))
    .mutation(({ input }) => {
      const deleted = apiKeyStore.deleteKey(input.keyId);
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
      const updated = apiKeyStore.updateKeyStatus(input.keyId, input.isActive);
      return {
        success: updated,
        message: updated ? "Status updated" : "Key not found",
      };
    }),

  /**
   * Update API key priority
   */
  updateKeyPriority: publicProcedure
    .input(z.object({ keyId: z.string(), priority: z.number() }))
    .mutation(({ input }) => {
      const updated = apiKeyStore.updateKeyPriority(input.keyId, input.priority);
      return {
        success: updated,
        message: updated ? "Priority updated" : "Key not found",
      };
    }),

  /**
   * Get active keys for LLM execution
   */
  getActiveKeys: publicProcedure.query(() => {
    return apiKeyStore.getActiveKeys().map((key) => ({
      provider: key.provider,
      apiKey: key.apiKey,
      modelId: key.modelId,
      priority: key.priority,
    }));
  }),

  /**
   * Get system status
   */
  getStatus: publicProcedure.query(() => {
    const total = apiKeyStore.getKeyCount();
    const active = apiKeyStore.getActiveKeyCount();
    const providers = apiKeyStore.getProviders();

    return {
      totalKeys: total,
      activeKeys: active,
      providers,
      ready: active > 0,
      message: active > 0 ? "System ready for autonomous execution" : "No active API keys",
    };
  }),
});
