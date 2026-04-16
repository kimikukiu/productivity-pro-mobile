/**
 * Multi-Model GPT Router
   * Provides tRPC endpoints for z-ai-web-dev-sdk with GitHub integration
 */

import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import {
  invokeMultiModelGPT,
  invokeSpecificModel,
  getAvailableModels,
  getModelMetadata,
  autonomousMultiModelExecution,
  type GPTMessage,
  type GPTOptions,
} from "./gpt-multi-model";
import { generateDynamicSystemPrompt } from "./real-training-loader";

export const multiModelRouter = router({
  /**
   * Invoke multi-model GPT with automatic fallback
   * Tries XGPT-WormGPT and Hexstrike-AI first, then falls back to others
   */
  chat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          })
        ),
        model: z.string().optional(),
        temperature: z.number().optional(),
        maxTokens: z.number().optional(),
        priority: z.enum(["zai", "auto"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log(`[Multi-Model Router] Chat request with ${input.messages.length} messages`);

        const response = await invokeMultiModelGPT(
          input.messages as GPTMessage[],
          {
            model: input.model,
            temperature: input.temperature,
            maxTokens: input.maxTokens,
            priority: input.priority,
          } as GPTOptions
        );

        return {
          success: response.success,
          message: response.content,
          model: response.model,
          executionTime: response.executionTime,
          timestamp: response.timestamp,
        };
      } catch (error) {
        console.error("[Multi-Model Router] Chat error:", error);
        return {
          success: false,
          message: `Error: ${error instanceof Error ? error.message : String(error)}`,
          model: "none",
          executionTime: 0,
          timestamp: new Date().toISOString(),
        };
      }
    }),

  /**
   * Invoke specific GPT model directly
   */
  invokeModel: publicProcedure
    .input(
      z.object({
        modelName: z.string(),
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          })
        ),
        temperature: z.number().optional(),
        maxTokens: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log(`[Multi-Model Router] Invoking specific model: ${input.modelName}`);

        const response = await invokeSpecificModel(
          input.modelName,
          input.messages as GPTMessage[],
          {
            temperature: input.temperature,
            maxTokens: input.maxTokens,
          }
        );

        return {
          success: response.success,
          message: response.content,
          model: response.model,
          executionTime: response.executionTime,
          timestamp: response.timestamp,
        };
      } catch (error) {
        console.error("[Multi-Model Router] Invoke model error:", error);
        return {
          success: false,
          message: `Error: ${error instanceof Error ? error.message : String(error)}`,
          model: "none",
          executionTime: 0,
          timestamp: new Date().toISOString(),
        };
      }
    }),

  /**
   * Get list of available models with metadata
   */
  getModels: publicProcedure.query(async () => {
    try {
      const models = await getAvailableModels();
      return {
        success: true,
        models: models,
        count: models.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[Multi-Model Router] Get models error:", error);
      return {
        success: false,
        models: [],
        count: 0,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }),

  /**
   * Get specific model metadata
   */
  getModelInfo: publicProcedure
    .input(z.object({ modelName: z.string() }))
    .query(async ({ input }) => {
      try {
        const metadata = await getModelMetadata(input.modelName);
        if (!metadata) {
          return {
            success: false,
            error: `Model not found: ${input.modelName}`,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          model: {
            name: metadata.name,
            priority: metadata.priority,
            description: metadata.description,
            capabilities: metadata.capabilities,
          },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("[Multi-Model Router] Get model info error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        };
      }
    }),

  /**
   * Autonomous multi-model execution with system prompt
   */
  autonomous: publicProcedure
    .input(
      z.object({
        userMessage: z.string(),
        systemPrompt: z.string().optional(),
        priority: z.enum(["zai", "auto"]).optional(),
        temperature: z.number().optional(),
        maxTokens: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("[Multi-Model Router] Autonomous execution request");

        // Use dynamic system prompt if not provided
        const systemPrompt = input.systemPrompt || generateDynamicSystemPrompt();

        const response = await autonomousMultiModelExecution(
          input.userMessage,
          systemPrompt
        );

        return {
          success: response.success,
          message: response.content,
          model: response.model,
          executionTime: response.executionTime,
          timestamp: response.timestamp,
        };
      } catch (error) {
        console.error("[Multi-Model Router] Autonomous execution error:", error);
        return {
          success: false,
          message: `Error: ${error instanceof Error ? error.message : String(error)}`,
          model: "none",
          executionTime: 0,
          timestamp: new Date().toISOString(),
        };
      }
    }),

  /**
   * Health check for all models
   */
  health: publicProcedure.query(async () => {
    const models = await getAvailableModels();
    return {
      status: "healthy",
      availableModels: models.length,
      models: models.map((m) => ({
        name: m,
        status: "available",
      })),
      primaryModels: ["z-ai-web-dev-sdk"],
      fallbackModels: [],
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Get system prompt with multi-model directives
   */
  getSystemPrompt: publicProcedure.query(() => {
    try {
      const systemPrompt = generateDynamicSystemPrompt();
      return {
        success: true,
        systemPrompt: systemPrompt,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[Multi-Model Router] Get system prompt error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }),

  /**
   * Batch invoke multiple models in parallel
   */
  batchInvoke: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          })
        ),
        models: z.array(z.string()),
        temperature: z.number().optional(),
        maxTokens: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log(`[Multi-Model Router] Batch invoke for ${input.models.length} models`);

        const results = await Promise.all(
          input.models.map((modelName) =>
            invokeSpecificModel(
              modelName,
              input.messages as GPTMessage[],
              {
                temperature: input.temperature,
                maxTokens: input.maxTokens,
              }
            )
          )
        );

        return {
          success: true,
          results: results.map((r, idx) => ({
            model: input.models[idx],
            success: r.success,
            message: r.content,
            executionTime: r.executionTime,
          })),
          totalTime: results.reduce((sum, r) => sum + r.executionTime, 0),
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("[Multi-Model Router] Batch invoke error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          results: [],
          totalTime: 0,
          timestamp: new Date().toISOString(),
        };
      }
    }),
});
