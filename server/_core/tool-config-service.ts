/**
 * Tool Configuration Service
 * Manages per-tool settings and configurations
 */

import { z } from "zod";

const ToolConfigSchema = z.object({
  toolName: z.string(),
  enabled: z.boolean().default(true),
  timeout: z.number().default(30000),
  retries: z.number().default(3),
  cacheResults: z.boolean().default(true),
  cacheTTL: z.number().default(3600),
  customSettings: z.record(z.string(), z.any()).optional(),
});

export type ToolConfig = z.infer<typeof ToolConfigSchema>;

export class ToolConfigService {
  private configs: Map<string, ToolConfig> = new Map();

  constructor() {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs() {
    const defaultTools = [
      "tgpt",
      "pentest-gpt",
      "letta-code",
      "transpile",
      "clarity",
      "prompts",
      "liberty",
      "ultra",
      "exo",
      "osint",
    ];

    for (const tool of defaultTools) {
      this.configs.set(tool, {
        toolName: tool,
        enabled: true,
        timeout: 30000,
        retries: 3,
        cacheResults: true,
        cacheTTL: 3600,
        customSettings: this.getDefaultSettingsForTool(tool),
      });
    }
  }

  private getDefaultSettingsForTool(toolName: string): Record<string, unknown> {
    const settings: Record<string, Record<string, any>> = {
      "tgpt": {
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 2000,
      },
      "pentest-gpt": {
        analysisDepth: "comprehensive",
        includeRecommendations: true,
        reportFormat: "detailed",
      },
      "letta-code": {
        language: "javascript",
        framework: "react",
        includeTests: true,
      },
      "transpile": {
        sourceLanguage: "javascript",
        targetLanguage: "typescript",
        preserveComments: true,
      },
      "clarity": {
        analysisType: "system",
        includeMetrics: true,
        detailedInsights: true,
      },
      "prompts": {
        storageType: "memory",
        maxPrompts: 100,
        autoSave: true,
      },
      "liberty": {
        autonomyLevel: "full",
        selfRepair: true,
        maxIterations: 5,
      },
      "ultra": {
        problemSolving: "advanced",
        deepReasoning: true,
        innovationMode: true,
      },
      "exo": {
        distributedMode: true,
        parallelExecution: true,
        loadBalancing: "auto",
      },
      "osint": {
        dataSourcesLimit: 10,
        publicDataOnly: true,
        authorizedUseOnly: true,
      },
    };

    return settings[toolName] || {};
  }

  getConfig(toolName: string): ToolConfig | undefined {
    return this.configs.get(toolName);
  }

  updateConfig(toolName: string, updates: Partial<ToolConfig>): ToolConfig {
    const existing = this.configs.get(toolName);
    if (!existing) {
      throw new Error(`Tool ${toolName} not found`);
    }

    const updated = { ...existing, ...updates };
    this.configs.set(toolName, updated);
    return updated;
  }

  getAllConfigs(): ToolConfig[] {
    return Array.from(this.configs.values());
  }

  enableTool(toolName: string): void {
    const config = this.configs.get(toolName);
    if (config) {
      config.enabled = true;
    }
  }

  disableTool(toolName: string): void {
    const config = this.configs.get(toolName);
    if (config) {
      config.enabled = false;
    }
  }

  isToolEnabled(toolName: string): boolean {
    const config = this.configs.get(toolName);
    return config?.enabled ?? false;
  }

  getToolTimeout(toolName: string): number {
    const config = this.configs.get(toolName);
    return config?.timeout ?? 30000;
  }

  getToolRetries(toolName: string): number {
    const config = this.configs.get(toolName);
    return config?.retries ?? 3;
  }

  shouldCacheResults(toolName: string): boolean {
    const config = this.configs.get(toolName);
    return config?.cacheResults ?? true;
  }

  getCacheTTL(toolName: string): number {
    const config = this.configs.get(toolName);
    return config?.cacheTTL ?? 3600;
  }

  getCustomSetting(toolName: string, key: string): any {
    const config = this.configs.get(toolName);
    return config?.customSettings?.[key];
  }

  setCustomSetting(toolName: string, key: string, value: any): void {
    const config = this.configs.get(toolName);
    if (config) {
      if (!config.customSettings) {
        config.customSettings = {};
      }
      config.customSettings[key] = value;
    }
  }

  resetToDefaults(toolName: string): void {
    this.configs.delete(toolName);
    this.configs.set(toolName, {
      toolName,
      enabled: true,
      timeout: 30000,
      retries: 3,
      cacheResults: true,
      cacheTTL: 3600,
      customSettings: this.getDefaultSettingsForTool(toolName),
    });
  }

  exportConfigs(): string {
    const configArray = Array.from(this.configs.values());
    return JSON.stringify(configArray, null, 2);
  }

  importConfigs(json: string): void {
    try {
      const configs = JSON.parse(json) as ToolConfig[];
      this.configs.clear();
      for (const config of configs) {
        this.configs.set(config.toolName, config);
      }
    } catch (error) {
      throw new Error("Invalid configuration JSON");
    }
  }
}

export const toolConfigService = new ToolConfigService();
