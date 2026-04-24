/**
 * API Settings Router
 * Manages z-ai-web-dev-sdk and HuggingFace API key storage and provider selection
 */

import { z } from "zod";
import { publicProcedure, router } from "./trpc";

// In-memory storage (in production, use database)
const apiSettings: Record<string, any> = {
  zai: {
    apiKey: process.env.ZAI_WEB_DEV_SDK_TOKEN || "",
    model: "GLM-5.1-Turbo",
    isActive: !!process.env.ZAI_WEB_DEV_SDK_TOKEN,
  },
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY || "",
    model: "meta-llama/Llama-2-70b",
    isActive: !!process.env.HUGGINGFACE_API_KEY,
  },
  selectedProvider: "zai",
};

export const apiSettingsRouter = router({
  /**
   * Get current API settings
   */
  getApiSettings: publicProcedure.query(() => {
    return {
      zai: {
        name: "z-ai-web-dev-sdk",
        key: apiSettings.zai.apiKey ? "••••••••" : "",
        models: ["GLM-5.1-Turbo", "GPT-4-Turbo", "Claude-3-Opus"],
        selectedModel: apiSettings.zai.model,
        isActive: apiSettings.zai.isActive,
      },
      huggingface: {
        name: "HuggingFace",
        key: apiSettings.huggingface.apiKey ? "••••••••" : "",
        models: [
          "meta-llama/Llama-2-70b",
          "mistralai/Mistral-7B",
          "NousResearch/Hermes-2-Theta",
        ],
        selectedModel: apiSettings.huggingface.model,
        isActive: apiSettings.huggingface.isActive,
      },
      selectedProvider: apiSettings.selectedProvider,
    };
  }),

  /**
   * Save API key for a provider
   */
  saveApiKey: publicProcedure
    .input(
      z.object({
        provider: z.enum(["zai", "huggingface"]),
        apiKey: z.string().min(1),
        model: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log(`[API Settings] Saving ${input.provider} API key`);

        // Validate API key by testing it
        const testResult = await validateApiKey(input.provider, input.apiKey);

        if (!testResult.success) {
          return {
            success: false,
            error: testResult.error,
          };
        }

        // Save to settings
        apiSettings[input.provider] = {
          apiKey: input.apiKey,
          model: input.model,
          isActive: true,
        };

        // In production, also save to database
        console.log(`[API Settings] ✓ ${input.provider} API key saved and validated`);

        return {
          success: true,
          message: `${input.provider} API key saved successfully`,
          provider: input.provider,
          model: input.model,
        };
      } catch (error) {
        console.error(`[API Settings] Error saving API key:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Set selected provider
   */
  setSelectedProvider: publicProcedure
    .input(z.enum(["zai", "huggingface"]))
    .mutation(async ({ input }) => {
      apiSettings.selectedProvider = input;
      console.log(`[API Settings] Selected provider: ${input}`);
      return { success: true, provider: input };
    }),

  /**
   * Get available models for a provider
   */
  getModels: publicProcedure
    .input(z.enum(["zai", "huggingface"]))
    .query(({ input }) => {
      const models: Record<string, string[]> = {
        zai: ["GLM-5.1-Turbo", "GPT-4-Turbo", "Claude-3-Opus", "Llama-2-70b"],
        huggingface: [
          "meta-llama/Llama-2-70b",
          "mistralai/Mistral-7B",
          "NousResearch/Hermes-2-Theta",
          "meta-llama/Llama-2-13b",
        ],
      };

      return {
        provider: input,
        models: models[input] || [],
      };
    }),

  /**
   * Test API connection
   */
  testConnection: publicProcedure
    .input(z.enum(["zai", "huggingface"]))
    .mutation(async ({ input }) => {
      try {
        const apiKey = apiSettings[input].apiKey;

        if (!apiKey) {
          return {
            success: false,
            error: "API key not configured",
          };
        }

        const result = await validateApiKey(input, apiKey);
        return result;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Connection test failed",
        };
      }
    }),

  /**
   * Get current provider configuration
   */
  getCurrentProvider: publicProcedure.query(() => {
    const provider = apiSettings.selectedProvider;
    const config = apiSettings[provider];

    return {
      provider,
      model: config.model,
      isActive: config.isActive,
      hasApiKey: !!config.apiKey,
    };
  }),
});

/**
 * Validate API key by making a test request
 */
async function validateApiKey(
  provider: "zai" | "huggingface",
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (provider === "zai") {
      const response = await fetch("https://api.z-ai.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "GLM-5.1-Turbo",
          messages: [
            {
              role: "user",
              content: "Test connection",
            },
          ],
          max_tokens: 10,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        return { success: true };
      } else if (response.status === 401) {
        return { success: false, error: "Invalid API key" };
      } else {
        return { success: false, error: `API error: ${response.status}` };
      }
    } else if (provider === "huggingface") {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: "Test",
            parameters: {
              max_length: 10,
            },
          }),
          signal: AbortSignal.timeout(10000),
        }
      );

      if (response.ok) {
        return { success: true };
      } else if (response.status === 401) {
        return { success: false, error: "Invalid API key" };
      } else {
        return { success: false, error: `API error: ${response.status}` };
      }
    }

    return { success: false, error: "Unknown provider" };
  } catch (error) {
    console.error(`[API Settings] Validation error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Validation failed",
    };
  }
}
