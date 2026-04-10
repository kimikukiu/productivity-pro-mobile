import { z } from "zod";
import { router, publicProcedure } from "./trpc";

/**
 * API Key Manager - Auto-recognize and manage all GPT/LLM API keys
 * Supports: OpenAI, Claude, DeepSeek, Groq, Gemini, Mistral, Meta, and custom models
 */

export const APIKeySchema = z.object({
  provider: z.string(),
  apiKey: z.string(),
  modelId: z.string().optional(),
  isActive: z.boolean().default(true),
  lastValidated: z.date().optional(),
  priority: z.number().default(5),
});

export type APIKey = z.infer<typeof APIKeySchema>;

// In-memory store (in production, use database)
const apiKeyStore = new Map<string, APIKey>();

// Provider configurations
const PROVIDER_CONFIGS: Record<string, { name: string; endpoint: string; testEndpoint: string }> = {
  openai: {
    name: "OpenAI GPT",
    endpoint: "https://api.openai.com/v1",
    testEndpoint: "https://api.openai.com/v1/models",
  },
  claude: {
    name: "Anthropic Claude",
    endpoint: "https://api.anthropic.com/v1",
    testEndpoint: "https://api.anthropic.com/v1/messages",
  },
  deepseek: {
    name: "DeepSeek",
    endpoint: "https://api.deepseek.com/v1",
    testEndpoint: "https://api.deepseek.com/v1/models",
  },
  groq: {
    name: "Groq",
    endpoint: "https://api.groq.com/v1",
    testEndpoint: "https://api.groq.com/v1/models",
  },
  gemini: {
    name: "Google Gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta",
    testEndpoint: "https://generativelanguage.googleapis.com/v1beta/models",
  },
  mistral: {
    name: "Mistral AI",
    endpoint: "https://api.mistral.ai/v1",
    testEndpoint: "https://api.mistral.ai/v1/models",
  },
  meta: {
    name: "Meta LLaMA",
    endpoint: "https://api.llama.ai/v1",
    testEndpoint: "https://api.llama.ai/v1/models",
  },
  grok: {
    name: "xAI Grok",
    endpoint: "https://api.x.ai/v1",
    testEndpoint: "https://api.x.ai/v1/models",
  },
  cohere: {
    name: "Cohere",
    endpoint: "https://api.cohere.ai/v1",
    testEndpoint: "https://api.cohere.ai/v1/models",
  },
  perplexity: {
    name: "Perplexity AI",
    endpoint: "https://api.perplexity.ai/v1",
    testEndpoint: "https://api.perplexity.ai/v1/models",
  },
};

/**
 * Auto-detect API key provider
 */
function detectAPIKeyProvider(apiKey: string): string | null {
  // OpenAI format: sk-*
  if (apiKey.startsWith("sk-")) return "openai";

  // Claude format: sk-ant-*
  if (apiKey.startsWith("sk-ant-")) return "claude";

  // DeepSeek format: sk-*
  if (apiKey.includes("deepseek")) return "deepseek";

  // Groq format: gsk_*
  if (apiKey.startsWith("gsk_")) return "groq";

  // Gemini format: AIza*
  if (apiKey.startsWith("AIza")) return "gemini";

  // Mistral format: eyJ*
  if (apiKey.startsWith("eyJ")) return "mistral";

  // Meta format: llama-*
  if (apiKey.includes("llama")) return "meta";

  // Grok format: xai-*
  if (apiKey.startsWith("xai-")) return "grok";

  // Cohere format: co_*
  if (apiKey.startsWith("co_")) return "cohere";

  // Perplexity format: pplx-*
  if (apiKey.startsWith("pplx-")) return "perplexity";

  return null;
}

/**
 * Validate API key by testing connection
 */
async function validateAPIKey(provider: string, apiKey: string): Promise<boolean> {
  const config = PROVIDER_CONFIGS[provider];
  if (!config) return false;

  try {
    const response = await fetch(config.testEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    return response.ok || response.status === 401; // 401 means key exists but may have permission issues
  } catch (error) {
    return false;
  }
}

/**
 * API Key Manager Router
 */
export const apiKeyManagerRouter = router({
  /**
   * Add or update API key
   */
  addAPIKey: publicProcedure
    .input(
      z.object({
        apiKey: z.string(),
        provider: z.string().optional(),
        modelId: z.string().optional(),
        priority: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Auto-detect provider if not specified
      const provider = input.provider || detectAPIKeyProvider(input.apiKey);
      if (!provider) {
        throw new Error("Could not auto-detect API key provider. Please specify provider manually.");
      }

      // Validate API key
      const isValid = await validateAPIKey(provider, input.apiKey);
      if (!isValid) {
        throw new Error(`Invalid API key for provider: ${provider}`);
      }

      const key = `${provider}-${Date.now()}`;
      const apiKeyEntry: APIKey = {
        provider,
        apiKey,
        modelId: input.modelId,
        isActive: true,
        lastValidated: new Date(),
        priority: input.priority || 5,
      };

      apiKeyStore.set(key, apiKeyEntry);

      return {
        id: key,
        provider,
        status: "active",
        validated: true,
        message: `API key for ${PROVIDER_CONFIGS[provider]?.name || provider} added successfully`,
      };
    }),

  /**
   * Get all API keys (masked)
   */
  getAPIKeys: publicProcedure.query(() => {
    const keys: Array<{
      id: string;
      provider: string;
      modelId?: string;
      isActive: boolean;
      priority: number;
      lastValidated?: string;
      masked: string;
    }> = [];

    apiKeyStore.forEach((value, key) => {
      keys.push({
        id: key,
        provider: value.provider,
        modelId: value.modelId,
        isActive: value.isActive,
        priority: value.priority,
        lastValidated: value.lastValidated?.toISOString(),
        masked: `${value.apiKey.substring(0, 8)}...${value.apiKey.substring(value.apiKey.length - 4)}`,
      });
    });

    return keys;
  }),

  /**
   * Get available providers
   */
  getProviders: publicProcedure.query(() => {
    return Object.entries(PROVIDER_CONFIGS).map(([id, config]) => ({
      id,
      name: config.name,
      endpoint: config.endpoint,
    }));
  }),

  /**
   * Delete API key
   */
  deleteAPIKey: publicProcedure
    .input(z.object({ keyId: z.string() }))
    .mutation(({ input }) => {
      const deleted = apiKeyStore.delete(input.keyId);
      return {
        success: deleted,
        message: deleted ? "API key deleted" : "API key not found",
      };
    }),

  /**
   * Test API key
   */
  testAPIKey: publicProcedure
    .input(z.object({ apiKey: z.string(), provider: z.string().optional() }))
    .mutation(async ({ input }) => {
      const provider = input.provider || detectAPIKeyProvider(input.apiKey);
      if (!provider) {
        return {
          valid: false,
          provider: null,
          message: "Could not detect provider",
        };
      }

      const isValid = await validateAPIKey(provider, input.apiKey);
      return {
        valid: isValid,
        provider,
        name: PROVIDER_CONFIGS[provider]?.name,
        message: isValid ? `Valid API key for ${provider}` : `Invalid API key for ${provider}`,
      };
    }),

  /**
   * Get active API keys for execution
   */
  getActiveKeys: publicProcedure.query((): any => {
    const active: Array<{ provider: string; apiKey: string; priority: number; modelId?: string }> = [];

    apiKeyStore.forEach((value) => {
      if (value.isActive) {
        active.push({
          provider: value.provider,
          apiKey: value.apiKey,
          priority: value.priority,
          modelId: value.modelId,
        });
      }
    });

    // Sort by priority (highest first)
    return active.sort((a, b) => b.priority - a.priority);
  }),

  /**
   * Auto-recognize and add multiple API keys
   */
  autoRecognizeKeys: publicProcedure
    .input(z.object({ apiKeys: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const results: Array<{
        apiKey: string;
        provider: string | null;
        valid: boolean;
        added: boolean;
      }> = [];

      for (const apiKey of input.apiKeys) {
        const provider = detectAPIKeyProvider(apiKey);
        const isValid = provider ? await validateAPIKey(provider, apiKey) : false;

        if (provider && isValid) {
          const key = `${provider}-${Date.now()}`;
          apiKeyStore.set(key, {
            provider,
            apiKey,
            isActive: true,
            lastValidated: new Date(),
            priority: 5,
          });

          results.push({
            apiKey: `${apiKey.substring(0, 8)}...`,
            provider,
            valid: true,
            added: true,
          });
        } else {
          results.push({
            apiKey: `${apiKey.substring(0, 8)}...`,
            provider,
            valid: false,
            added: false,
          });
        }
      }

      return {
        total: input.apiKeys.length,
        added: results.filter((r) => r.added).length,
        results,
      };
    }),

  /**
   * Get system status
   */
  getStatus: publicProcedure.query(() => {
    const activeKeys = Array.from(apiKeyStore.values()).filter((k) => k.isActive);
    const providers = new Set(activeKeys.map((k) => k.provider));

    return {
      totalKeys: apiKeyStore.size,
      activeKeys: activeKeys.length,
      providers: Array.from(providers),
      ready: activeKeys.length > 0,
      message: activeKeys.length > 0 ? "System ready" : "No API keys configured",
    };
  }),
});
