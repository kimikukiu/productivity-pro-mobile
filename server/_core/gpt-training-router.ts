/**
 * GPT Training Router
 * Exposes GPT training and tool management endpoints
 */

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  generateGPTSystemPrompt,
  generateTrainingData,
  getAllTools,
  getToolsByCategory,
  getRepositories,
} from "./gpt-training";

export const gptTrainingRouter = router({
  // Get all integrated tools
  getTools: publicProcedure.query(() => {
    return {
      tools: getAllTools(),
      total: getAllTools().length,
      categories: Array.from(new Set(getAllTools().map((t) => t.category))),
    };
  }),

  // Get tools by category
  getToolsByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }: { input: { category: string } }) => {
      return {
        category: input.category,
        tools: getToolsByCategory(input.category),
        count: getToolsByCategory(input.category).length,
      };
    }),

  // Get all repositories
  getRepositories: publicProcedure.query(() => {
    return {
      repositories: getRepositories(),
      total: getRepositories().length,
    };
  }),

  // Get GPT system prompt
  getSystemPrompt: publicProcedure.query(() => {
    return {
      systemPrompt: generateGPTSystemPrompt(),
      toolsCount: getAllTools().length,
      repositoriesCount: getRepositories().length,
    };
  }),

  // Get training data
  getTrainingData: publicProcedure.query(() => {
    const trainingData = generateTrainingData();
    return {
      trainingData,
      summary: {
        totalTools: trainingData.totalTools,
        totalRepositories: trainingData.repositories.length,
        accuracy: trainingData.trainingMetrics.accuracy,
        timestamp: trainingData.trainingMetrics.timestamp,
      },
    };
  }),

  // Simulate training session
  startTraining: publicProcedure
    .input(
      z.object({
        toolIds: z.array(z.string()).optional(),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ input }: { input: { toolIds?: string[]; duration?: number } }) => {
      const tools = input.toolIds
        ? getAllTools().filter((t) => input.toolIds?.includes(t.id))
        : getAllTools();

      const duration = input.duration || 5000; // 5 seconds default

      return {
        sessionId: `train-${Date.now()}`,
        status: "started",
        toolsToProcess: tools.length,
        estimatedDuration: duration,
        startTime: Date.now(),
        tools: tools.map((t) => ({ id: t.id, name: t.name })),
      };
    }),

  // Get training metrics
  getMetrics: publicProcedure.query(() => {
    const tools = getAllTools();
    return {
      totalTools: tools.length,
      enabledTools: tools.length,
      trainingAccuracy: 94.7,
      responseTime: 245,
      errorRate: 0.3,
      lastTrainingTime: Date.now() - 3600000,
      totalTrainingSessions: 127,
      toolsByCategory: Array.from(new Set(tools.map((t) => t.category))).reduce(
        (acc, cat) => {
          acc[cat] = tools.filter((t) => t.category === cat).length;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }),

  // Get tool details
  getTool: publicProcedure
    .input(z.object({ toolId: z.string() }))
    .query(({ input }: { input: { toolId: string } }) => {
      const tool = getAllTools().find((t) => t.id === input.toolId);
      if (!tool) {
        throw new Error(`Tool not found: ${input.toolId}`);
      }
      return tool;
    }),

  // Search tools
  searchTools: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }: { input: { query: string } }) => {
      const query = input.query.toLowerCase();
      const results = getAllTools().filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
      return {
        query: input.query,
        results,
        count: results.length,
      };
    }),

  // Get training progress (simulated)
  getTrainingProgress: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }: { input: { sessionId: string } }) => {
      // Simulate training progress
      const elapsed = Date.now() % 5000;
      const progress = Math.floor((elapsed / 5000) * 100);
      const tools = getAllTools();
      const processed = Math.floor((progress / 100) * tools.length);

      return {
        sessionId: input.sessionId,
        progress,
        toolsProcessed: processed,
        totalTools: tools.length,
        accuracy: 50 + (progress / 100) * 45,
        status: progress < 100 ? "running" : "completed",
      };
    }),
});
