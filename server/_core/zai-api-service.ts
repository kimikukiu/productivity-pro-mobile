/**
 * z.ai API Service
 * Real integration with z.ai backend for model training and invocation
 */

import { z } from "zod";
import { publicProcedure, router } from "./trpc";

const ZAI_BASE_URL = "https://api.z-ai.dev/v1";
const ZAI_API_KEY = process.env.ZAI_API_KEY || "";
const ZAI_CLIENT_ID = process.env.ZAI_CLIENT_ID || "";
const ZAI_CLIENT_SECRET = process.env.ZAI_CLIENT_SECRET || "";

interface ZAiConfig {
  apiKey: string;
  clientId: string;
  clientSecret: string;
  isAuthenticated: boolean;
  models: string[];
  lastSyncedAt: string | null;
}

// In-memory config (use database in production)
let zaiConfig: ZAiConfig = {
  apiKey: ZAI_API_KEY,
  clientId: ZAI_CLIENT_ID,
  clientSecret: ZAI_CLIENT_SECRET,
  isAuthenticated: !!ZAI_API_KEY,
  models: [],
  lastSyncedAt: null,
};

export const zaiApiRouter = router({
  /**
   * Set z.ai API key
   */
  setApiKey: publicProcedure
    .input(z.object({ apiKey: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Validate API key by making a test request
        const testResponse = await fetch(`${ZAI_BASE_URL}/models`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${input.apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!testResponse.ok) {
          return {
            success: false,
            error: "Invalid API key - authentication failed",
          };
        }

        // Store the API key
        zaiConfig = {
          ...zaiConfig,
          apiKey: input.apiKey,
          isAuthenticated: true,
        };

        console.log("[z.ai API] ✓ API key validated and stored");

        return {
          success: true,
          message: "z.ai API key set successfully",
          isAuthenticated: true,
        };
      } catch (error) {
        console.error("[z.ai API] Error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to set API key",
        };
      }
    }),

  /**
   * Get available models from z.ai
   */
  getModels: publicProcedure.query(async () => {
    try {
      if (!zaiConfig.apiKey) {
        return {
          success: false,
          models: [],
          error: "z.ai API key not configured",
        };
      }

      const response = await fetch(`${ZAI_BASE_URL}/models`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${zaiConfig.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch models from z.ai");
      }

      const data = await response.json();

      // Cache models
      zaiConfig = {
        ...zaiConfig,
        models: data.models || [],
        lastSyncedAt: new Date().toISOString(),
      };

      console.log(`[z.ai API] ✓ Fetched ${data.models?.length || 0} models`);

      return {
        success: true,
        models: data.models || [],
        count: data.models?.length || 0,
      };
    } catch (error) {
      console.error("[z.ai API] Error fetching models:", error);
      return {
        success: false,
        models: [],
        error: error instanceof Error ? error.message : "Failed to fetch models",
      };
    }
  }),

  /**
   * Invoke z.ai model with prompt
   */
  invokeModel: publicProcedure
    .input(
      z.object({
        model: z.string(),
        prompt: z.string(),
        maxTokens: z.number().optional(),
        temperature: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!zaiConfig.apiKey) {
          return {
            success: false,
            error: "z.ai API key not configured",
          };
        }

        const response = await fetch(`${ZAI_BASE_URL}/completions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${zaiConfig.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: input.model,
            prompt: input.prompt,
            max_tokens: input.maxTokens || 2000,
            temperature: input.temperature || 0.7,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Model invocation failed");
        }

        const data = await response.json();

        console.log(`[z.ai API] ✓ Model invoked: ${input.model}`);

        return {
          success: true,
          content: data.choices?.[0]?.text || "",
          model: input.model,
          usage: {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0,
          },
        };
      } catch (error) {
        console.error("[z.ai API] Error invoking model:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Model invocation failed",
        };
      }
    }),

  /**
   * Train project on z.ai models
   */
  trainProject: publicProcedure
    .input(
      z.object({
        projectName: z.string(),
        models: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!zaiConfig.apiKey) {
          return {
            success: false,
            error: "z.ai API key not configured",
          };
        }

        const response = await fetch(`${ZAI_BASE_URL}/training/create`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${zaiConfig.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_name: input.projectName,
            models: input.models || [
              "gpt-4-turbo",
              "gpt-3.5-turbo",
              "claude-3-opus",
              "llama-2-70b",
              "mistral-7b",
            ],
            scope: "full-project",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Training failed");
        }

        const data = await response.json();

        console.log(`[z.ai API] ✓ Training started: ${data.training_id}`);

        return {
          success: true,
          trainingId: data.training_id,
          status: data.status,
          message: "Project training started on z.ai",
        };
      } catch (error) {
        console.error("[z.ai API] Error training project:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Training failed",
        };
      }
    }),

  /**
   * Get training status
   */
  getTrainingStatus: publicProcedure
    .input(z.object({ trainingId: z.string() }))
    .query(async ({ input }) => {
      try {
        if (!zaiConfig.apiKey) {
          return {
            success: false,
            error: "z.ai API key not configured",
          };
        }

        const response = await fetch(`${ZAI_BASE_URL}/training/${input.trainingId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${zaiConfig.apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch training status");
        }

        const data = await response.json();

        return {
          success: true,
          status: data.status,
          progress: data.progress,
          completedAt: data.completed_at,
        };
      } catch (error) {
        console.error("[z.ai API] Error fetching training status:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch status",
        };
      }
    }),

  /**
   * Get current configuration status
   */
  getStatus: publicProcedure.query(() => {
    return {
      isAuthenticated: zaiConfig.isAuthenticated,
      hasApiKey: !!zaiConfig.apiKey,
      modelsCount: zaiConfig.models.length,
      lastSyncedAt: zaiConfig.lastSyncedAt,
      baseUrl: ZAI_BASE_URL,
    };
  }),

  /**
   * Disconnect z.ai
   */
  disconnect: publicProcedure.mutation(() => {
    zaiConfig = {
      ...zaiConfig,
      apiKey: "",
      isAuthenticated: false,
    };

    console.log("[z.ai API] Disconnected");

    return {
      success: true,
      message: "Disconnected from z.ai",
    };
  }),
});
