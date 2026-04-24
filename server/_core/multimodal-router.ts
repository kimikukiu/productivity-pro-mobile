/**
 * Multimodal & Hermes Router
 * tRPC endpoints for multimodal processing with Hermes AI
 */

import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import {
  processMultimodal,
  analyzeImage,
  transcribeAudio,
  processVideo,
  processMixedMedia,
  getHermesCapabilities,
  hybridMultimodalProcessing,
  type MultimodalInput,
  type HermesRequest,
} from "./multimodal-hermes";

export const multimodalRouter = router({
  /**
   * Analyze image with Hermes
   */
  analyzeImage: publicProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        prompt: z.string(),
        systemPrompt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("[Multimodal Router] Analyzing image");

        const response = await analyzeImage(
          input.imageUrl,
          input.prompt,
          input.systemPrompt
        );

        return {
          success: response.success,
          content: response.content,
          model: response.model,
          mediaType: response.mediaType,
          executionTime: response.executionTime,
          timestamp: response.timestamp,
        };
      } catch (error) {
        console.error("[Multimodal Router] Image analysis error:", error);
        return {
          success: false,
          content: `Error: ${error instanceof Error ? error.message : String(error)}`,
          model: "hermes-multimodal",
          mediaType: "error",
          executionTime: 0,
          timestamp: new Date().toISOString(),
        };
      }
    }),

  /**
   * Transcribe audio with Hermes
   */
  transcribeAudio: publicProcedure
    .input(
      z.object({
        audioUrl: z.string().url(),
        language: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("[Multimodal Router] Transcribing audio");

        const response = await transcribeAudio(input.audioUrl, input.language);

        return {
          success: response.success,
          content: response.content,
          model: response.model,
          mediaType: response.mediaType,
          executionTime: response.executionTime,
          timestamp: response.timestamp,
        };
      } catch (error) {
        console.error("[Multimodal Router] Audio transcription error:", error);
        return {
          success: false,
          content: `Error: ${error instanceof Error ? error.message : String(error)}`,
          model: "hermes-multimodal",
          mediaType: "error",
          executionTime: 0,
          timestamp: new Date().toISOString(),
        };
      }
    }),

  /**
   * Process video with Hermes
   */
  processVideo: publicProcedure
    .input(
      z.object({
        videoUrl: z.string().url(),
        prompt: z.string(),
        systemPrompt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("[Multimodal Router] Processing video");

        const response = await processVideo(
          input.videoUrl,
          input.prompt,
          input.systemPrompt
        );

        return {
          success: response.success,
          content: response.content,
          model: response.model,
          mediaType: response.mediaType,
          executionTime: response.executionTime,
          timestamp: response.timestamp,
        };
      } catch (error) {
        console.error("[Multimodal Router] Video processing error:", error);
        return {
          success: false,
          content: `Error: ${error instanceof Error ? error.message : String(error)}`,
          model: "hermes-multimodal",
          mediaType: "error",
          executionTime: 0,
          timestamp: new Date().toISOString(),
        };
      }
    }),

  /**
   * Process mixed media (text + image/video/audio)
   */
  processMixed: publicProcedure
    .input(
      z.object({
        inputs: z.array(
          z.object({
            type: z.enum(["text", "image", "video", "audio", "mixed"]),
            content: z.string(),
            mimeType: z.string().optional(),
            description: z.string().optional(),
          })
        ),
        task: z.string(),
        systemPrompt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("[Multimodal Router] Processing mixed media");

        const response = await processMixedMedia(
          input.inputs as MultimodalInput[],
          input.task,
          input.systemPrompt
        );

        return {
          success: response.success,
          content: response.content,
          model: response.model,
          mediaType: response.mediaType,
          executionTime: response.executionTime,
          timestamp: response.timestamp,
        };
      } catch (error) {
        console.error("[Multimodal Router] Mixed media processing error:", error);
        return {
          success: false,
          content: `Error: ${error instanceof Error ? error.message : String(error)}`,
          model: "hermes-multimodal",
          mediaType: "error",
          executionTime: 0,
          timestamp: new Date().toISOString(),
        };
      }
    }),

  /**
   * Hybrid processing (Hermes + z-ai-web-dev-sdk)
   */
  hybrid: publicProcedure
    .input(
      z.object({
        inputs: z.array(
          z.object({
            type: z.enum(["text", "image", "video", "audio", "mixed"]),
            content: z.string(),
            mimeType: z.string().optional(),
            description: z.string().optional(),
          })
        ),
        task: z.string(),
        useHermes: z.boolean().optional(),
        useZAI: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("[Multimodal Router] Hybrid processing");

        const result = await hybridMultimodalProcessing(
          input.inputs as MultimodalInput[],
          input.task,
          input.useHermes !== false,
          input.useZAI !== false
        );

        return {
          success: result.hermes?.success || false,
          content: result.combined,
          hermes: result.hermes,
          model: "hermes-multimodal + z-ai-web-dev-sdk",
          mediaType: result.hermes?.mediaType || "text",
          executionTime: result.hermes?.executionTime || 0,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("[Multimodal Router] Hybrid processing error:", error);
        return {
          success: false,
          content: `Error: ${error instanceof Error ? error.message : String(error)}`,
          model: "hermes-multimodal + z-ai-web-dev-sdk",
          mediaType: "error",
          executionTime: 0,
          timestamp: new Date().toISOString(),
        };
      }
    }),

  /**
   * Get Hermes capabilities
   */
  capabilities: publicProcedure.query(() => {
    return getHermesCapabilities();
  }),

  /**
   * Health check for multimodal system
   */
  health: publicProcedure.query(() => {
    return {
      status: "healthy",
      system: "hermes-multimodal",
      capabilities: getHermesCapabilities().capabilities,
      supportedMediaTypes: getHermesCapabilities().supportedMediaTypes,
      timestamp: new Date().toISOString(),
    };
  }),
});
