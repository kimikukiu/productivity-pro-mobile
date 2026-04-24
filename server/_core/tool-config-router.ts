/**
 * Tool Configuration Router
 * tRPC endpoints for managing tool configurations
 */

import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import { toolConfigService } from "./tool-config-service";

export const toolConfigRouter = router({
  getConfig: publicProcedure
    .input(z.object({ toolName: z.string() }))
    .query(({ input }) => {
      return toolConfigService.getConfig(input.toolName);
    }),

  getAllConfigs: publicProcedure.query(() => {
    return toolConfigService.getAllConfigs();
  }),

  updateConfig: publicProcedure
    .input(
      z.object({
        toolName: z.string(),
        timeout: z.number().optional(),
        retries: z.number().optional(),
        cacheResults: z.boolean().optional(),
        cacheTTL: z.number().optional(),
        customSettings: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(({ input }) => {
      const { toolName, ...updates } = input;
      return toolConfigService.updateConfig(toolName, updates);
    }),

  enableTool: publicProcedure
    .input(z.object({ toolName: z.string() }))
    .mutation(({ input }) => {
      toolConfigService.enableTool(input.toolName);
      return { success: true, message: `${input.toolName} enabled` };
    }),

  disableTool: publicProcedure
    .input(z.object({ toolName: z.string() }))
    .mutation(({ input }) => {
      toolConfigService.disableTool(input.toolName);
      return { success: true, message: `${input.toolName} disabled` };
    }),

  isToolEnabled: publicProcedure
    .input(z.object({ toolName: z.string() }))
    .query(({ input }) => {
      return toolConfigService.isToolEnabled(input.toolName);
    }),

  resetToDefaults: publicProcedure
    .input(z.object({ toolName: z.string() }))
    .mutation(({ input }) => {
      toolConfigService.resetToDefaults(input.toolName);
      return { success: true, message: `${input.toolName} reset to defaults` };
    }),

  exportConfigs: publicProcedure.query(() => {
    return { configs: toolConfigService.exportConfigs() };
  }),

  importConfigs: publicProcedure
    .input(z.object({ json: z.string() }))
    .mutation(({ input }) => {
      try {
        toolConfigService.importConfigs(input.json);
        return { success: true, message: "Configurations imported" };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Import failed",
        };
      }
    }),
});
