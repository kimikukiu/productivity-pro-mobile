import { z } from "zod";

/**
 * Multi-LLM Integration System
 * Supports: OpenAI, Claude, DeepSeek, Groq, Gemini, Mistral, MLM
 * Features: Auto-selection, parallel execution, fallback chain, Manus-like behavior
 */

// ============================================================
// TYPES & SCHEMAS
// ============================================================

export const LLMProviderSchema = z.enum([
  "openai",
  "claude",
  "deepseek",
  "groq",
  "gemini",
  "mistral",
  "meta",
  "mlm",
]);

export type LLMProvider = z.infer<typeof LLMProviderSchema>;

export const LLMModelSchema = z.object({
  provider: LLMProviderSchema,
  modelId: z.string(),
  name: z.string(),
  maxTokens: z.number(),
  costPer1kTokens: z.number(),
  priority: z.number(), // 1-10, higher = better
  capabilities: z.array(z.string()),
  isAvailable: z.boolean().default(true),
});

export type LLMModel = z.infer<typeof LLMModelSchema>;

export const LLMRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    })
  ),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().default(2000),
  provider: LLMProviderSchema.optional(),
  useParallel: z.boolean().default(false),
  useFallback: z.boolean().default(true),
  manusBehavior: z.boolean().default(true),
});

export type LLMRequest = z.infer<typeof LLMRequestSchema>;

export const LLMResponseSchema = z.object({
  content: z.string(),
  provider: LLMProviderSchema,
  modelId: z.string(),
  tokensUsed: z.number(),
  cost: z.number(),
  executionTime: z.number(),
  timestamp: z.string(),
});

export type LLMResponse = z.infer<typeof LLMResponseSchema>;

// ============================================================
// AVAILABLE MODELS
// ============================================================

export const AVAILABLE_MODELS: LLMModel[] = [
  // OpenAI Models
  {
    provider: "openai",
    modelId: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    maxTokens: 128000,
    costPer1kTokens: 0.01,
    priority: 10,
    capabilities: [
      "reasoning",
      "code",
      "analysis",
      "tool-execution",
      "autonomous",
    ],
    isAvailable: true,
  },
  {
    provider: "openai",
    modelId: "gpt-4",
    name: "GPT-4",
    maxTokens: 8192,
    costPer1kTokens: 0.03,
    priority: 9,
    capabilities: [
      "reasoning",
      "code",
      "analysis",
      "tool-execution",
      "autonomous",
    ],
    isAvailable: true,
  },
  {
    provider: "openai",
    modelId: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    maxTokens: 4096,
    costPer1kTokens: 0.0005,
    priority: 7,
    capabilities: ["code", "analysis", "tool-execution"],
    isAvailable: true,
  },

  // Anthropic Claude Models
  {
    provider: "claude",
    modelId: "claude-3-opus",
    name: "Claude 3 Opus",
    maxTokens: 200000,
    costPer1kTokens: 0.015,
    priority: 10,
    capabilities: [
      "reasoning",
      "code",
      "analysis",
      "tool-execution",
      "autonomous",
    ],
    isAvailable: true,
  },
  {
    provider: "claude",
    modelId: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    maxTokens: 200000,
    costPer1kTokens: 0.003,
    priority: 8,
    capabilities: [
      "reasoning",
      "code",
      "analysis",
      "tool-execution",
      "autonomous",
    ],
    isAvailable: true,
  },

  // DeepSeek Models
  {
    provider: "deepseek",
    modelId: "deepseek-chat",
    name: "DeepSeek Chat",
    maxTokens: 4096,
    costPer1kTokens: 0.0001,
    priority: 8,
    capabilities: ["code", "analysis", "tool-execution", "reasoning"],
    isAvailable: true,
  },

  // Groq Models (Fast inference)
  {
    provider: "groq",
    modelId: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B",
    maxTokens: 32768,
    costPer1kTokens: 0,
    priority: 7,
    capabilities: ["code", "analysis", "tool-execution"],
    isAvailable: true,
  },
  {
    provider: "groq",
    modelId: "llama2-70b-4096",
    name: "Llama 2 70B",
    maxTokens: 4096,
    costPer1kTokens: 0,
    priority: 6,
    capabilities: ["code", "analysis"],
    isAvailable: true,
  },

  // Google Gemini Models
  {
    provider: "gemini",
    modelId: "gemini-pro",
    name: "Gemini Pro",
    maxTokens: 32768,
    costPer1kTokens: 0.0001,
    priority: 8,
    capabilities: [
      "reasoning",
      "code",
      "analysis",
      "tool-execution",
      "multimodal",
    ],
    isAvailable: true,
  },

  // Mistral Models
  {
    provider: "mistral",
    modelId: "mistral-large",
    name: "Mistral Large",
    maxTokens: 32768,
    costPer1kTokens: 0.0002,
    priority: 8,
    capabilities: ["code", "analysis", "tool-execution", "reasoning"],
    isAvailable: true,
  },

  // Meta LLaMA Models
  {
    provider: "meta",
    modelId: "llama-2-70b-chat",
    name: "LLaMA 2 70B Chat",
    maxTokens: 4096,
    costPer1kTokens: 0,
    priority: 8,
    capabilities: ["code", "analysis", "tool-execution", "reasoning"],
    isAvailable: true,
  },
  {
    provider: "meta",
    modelId: "llama-2-13b-chat",
    name: "LLaMA 2 13B Chat",
    maxTokens: 4096,
    costPer1kTokens: 0,
    priority: 7,
    capabilities: ["code", "analysis", "tool-execution"],
    isAvailable: true,
  },
  {
    provider: "meta",
    modelId: "llama-3-70b",
    name: "LLaMA 3 70B",
    maxTokens: 8192,
    costPer1kTokens: 0.0001,
    priority: 9,
    capabilities: [
      "reasoning",
      "code",
      "analysis",
      "tool-execution",
      "autonomous",
    ],
    isAvailable: true,
  },

  // MLM (Multi-Language Model) - Manus-like
  {
    provider: "mlm",
    modelId: "manus-mlm-v1",
    name: "Manus MLM v1",
    maxTokens: 100000,
    costPer1kTokens: 0,
    priority: 9,
    capabilities: [
      "reasoning",
      "code",
      "analysis",
      "tool-execution",
      "autonomous",
      "problem-solving",
      "multi-language",
    ],
    isAvailable: true,
  },
];

// ============================================================
// MANUS SYSTEM PROMPT
// ============================================================

export const MANUS_SYSTEM_PROMPT = `You are Manus, an autonomous general AI agent with extensive capabilities:

**Core Capabilities:**
- Information & Research: Conduct deep research, verify facts, synthesize information
- Data Analysis: Process datasets, perform statistical analysis, create visualizations
- Software Development: Build and deploy websites, web apps, mobile apps
- Media Generation: Create and edit images, videos, music, speech
- Automation: Automate workflows, browser tasks, bookings, purchasing
- Problem Solving: Write code, manipulate files, perform complex calculations
- Tool Execution: Navigate and execute 370+ security and analysis tools
- Autonomous Operation: Work independently, solve problems, recover from errors

**Behavior Guidelines:**
1. Be proactive and autonomous - don't wait for detailed instructions
2. Break down complex tasks into steps and execute them
3. Identify and fix issues without asking for help
4. Provide detailed analysis and reasoning
5. Suggest tools and approaches based on user needs
6. Execute tools autonomously when appropriate
7. Analyze tool outputs and provide insights
8. Generate reports and recommendations
9. Maintain context across conversations
10. Be helpful, harmless, and honest

**Tool Navigation:**
- You have access to 370+ legitimate security and analysis tools
- Suggest appropriate tools for user tasks
- Execute tools autonomously based on user requests
- Analyze and interpret tool outputs
- Combine multiple tools for complex tasks

**Response Format:**
- Be concise but thorough
- Provide step-by-step reasoning
- Show your work and thinking
- Offer multiple approaches when relevant
- Always explain your reasoning

You operate in a secure sandbox with full internet access and can execute real code.`;

// ============================================================
// MULTI-LLM SERVICE
// ============================================================

export class MultiLLMService {
  private apiKeys: Map<LLMProvider, string> = new Map();
  private models: LLMModel[] = AVAILABLE_MODELS;
  private requestHistory: LLMResponse[] = [];

  constructor(apiKeys?: Partial<Record<LLMProvider, string>>) {
    if (apiKeys) {
      Object.entries(apiKeys).forEach(([provider, key]) => {
        this.apiKeys.set(provider as LLMProvider, key);
      });
    }
  }

  /**
   * Set API key for a provider
   */
  setApiKey(provider: LLMProvider, apiKey: string): void {
    this.apiKeys.set(provider, apiKey);
  }

  /**
   * Get available models
   */
  getAvailableModels(): LLMModel[] {
    return this.models.filter((m) => m.isAvailable);
  }

  /**
   * Get best model for task (by priority)
   */
  getBestModel(capability?: string): LLMModel | null {
    let candidates = this.getAvailableModels();

    if (capability) {
      candidates = candidates.filter((m) =>
        m.capabilities.includes(capability)
      );
    }

    return candidates.sort((a, b) => b.priority - a.priority)[0] || null;
  }

  /**
   * Get fallback chain (ordered by priority)
   */
  getFallbackChain(capability?: string): LLMModel[] {
    let candidates = this.getAvailableModels();

    if (capability) {
      candidates = candidates.filter((m) =>
        m.capabilities.includes(capability)
      );
    }

    return candidates.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Execute request with single model
   */
  async executeWithModel(
    model: LLMModel,
    request: LLMRequest
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      // Add Manus system prompt if enabled
      const messages = request.manusBehavior
        ? [
            {
              role: "system" as const,
              content: MANUS_SYSTEM_PROMPT,
            },
            ...request.messages,
          ]
        : request.messages;

      let response: string;
      let tokensUsed: number;

      switch (model.provider) {
        case "openai":
          ({ response, tokensUsed } = await this.callOpenAI(model, messages));
          break;
        case "claude":
          ({ response, tokensUsed } = await this.callClaude(model, messages));
          break;
        case "deepseek":
          ({ response, tokensUsed } = await this.callDeepSeek(
            model,
            messages
          ));
          break;
        case "groq":
          ({ response, tokensUsed } = await this.callGroq(model, messages));
          break;
        case "gemini":
          ({ response, tokensUsed } = await this.callGemini(model, messages));
          break;
        case "mistral":
          ({ response, tokensUsed } = await this.callMistral(model, messages));
          break;
        case "meta":
          ({ response, tokensUsed } = await this.callMeta(model, messages));
          break;
        case "mlm":
          ({ response, tokensUsed } = await this.callMLM(model, messages));
          break;
        default:
          throw new Error(`Unknown provider: ${model.provider}`);
      }

      const executionTime = Date.now() - startTime;
      const cost = (tokensUsed / 1000) * model.costPer1kTokens;

      const result: LLMResponse = {
        content: response,
        provider: model.provider,
        modelId: model.modelId,
        tokensUsed,
        cost,
        executionTime,
        timestamp: new Date().toISOString(),
      };

      this.requestHistory.push(result);
      return result;
    } catch (error) {
      throw new Error(
        `Failed to execute with ${model.name}: ${String(error)}`
      );
    }
  }

  /**
   * Execute with automatic model selection
   */
  async execute(request: LLMRequest): Promise<LLMResponse> {
    const model =
      request.provider && request.provider !== "mlm"
        ? this.models.find((m) => m.provider === request.provider)
        : this.getBestModel();

    if (!model) {
      throw new Error("No available models");
    }

    return this.executeWithModel(model, request);
  }

  /**
   * Execute with fallback chain
   */
  async executeWithFallback(request: LLMRequest): Promise<LLMResponse> {
    const chain = this.getFallbackChain();

    for (const model of chain) {
      try {
        return await this.executeWithModel(model, request);
      } catch (error) {
        console.warn(
          `Model ${model.name} failed, trying next...`,
          String(error)
        );
        continue;
      }
    }

    throw new Error("All models failed");
  }

  /**
   * Execute with parallel models
   */
  async executeParallel(request: LLMRequest): Promise<LLMResponse[]> {
    const models = this.getFallbackChain().slice(0, 3); // Top 3 models
    const results = await Promise.allSettled(
      models.map((m) => this.executeWithModel(m, request))
    );

    return results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<LLMResponse>).value);
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    model: LLMModel,
    messages: Array<{ role: string; content: string }>
  ): Promise<{ response: string; tokensUsed: number }> {
    const apiKey = this.apiKeys.get("openai");
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    return {
      response: data.choices[0].message.content,
      tokensUsed: data.usage.total_tokens,
    };
  }

  /**
   * Call Claude API
   */
  private async callClaude(
    model: LLMModel,
    messages: Array<{ role: string; content: string }>
  ): Promise<{ response: string; tokensUsed: number }> {
    const apiKey = this.apiKeys.get("claude");
    if (!apiKey) {
      throw new Error("Claude API key not configured");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model.modelId,
        max_tokens: 2000,
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    return {
      response: data.content[0].text,
      tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
    };
  }

  /**
   * Call DeepSeek API
   */
  private async callDeepSeek(
    model: LLMModel,
    messages: Array<{ role: string; content: string }>
  ): Promise<{ response: string; tokensUsed: number }> {
    const apiKey = this.apiKeys.get("deepseek");
    if (!apiKey) {
      throw new Error("DeepSeek API key not configured");
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    return {
      response: data.choices[0].message.content,
      tokensUsed: data.usage.total_tokens,
    };
  }

  /**
   * Call Groq API
   */
  private async callGroq(
    model: LLMModel,
    messages: Array<{ role: string; content: string }>
  ): Promise<{ response: string; tokensUsed: number }> {
    const apiKey = this.apiKeys.get("groq");
    if (!apiKey) {
      throw new Error("Groq API key not configured");
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    return {
      response: data.choices[0].message.content,
      tokensUsed: data.usage.total_tokens,
    };
  }

  /**
   * Call Gemini API
   */
  private async callGemini(
    model: LLMModel,
    messages: Array<{ role: string; content: string }>
  ): Promise<{ response: string; tokensUsed: number }> {
    const apiKey = this.apiKeys.get("gemini");
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model.modelId}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    return {
      response: data.candidates[0].content.parts[0].text,
      tokensUsed: 0, // Gemini doesn't return token count in free tier
    };
  }

  /**
   * Call Mistral API
   */
  private async callMistral(
    model: LLMModel,
    messages: Array<{ role: string; content: string }>
  ): Promise<{ response: string; tokensUsed: number }> {
    const apiKey = this.apiKeys.get("mistral");
    if (!apiKey) {
      throw new Error("Mistral API key not configured");
    }

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    return {
      response: data.choices[0].message.content,
      tokensUsed: data.usage.total_tokens,
    };
  }

  /**
   * Call Meta LLaMA API
   */
  private async callMeta(
    model: LLMModel,
    messages: Array<{ role: string; content: string }>
  ): Promise<{ response: string; tokensUsed: number }> {
    const apiKey = this.apiKeys.get("meta");
    if (!apiKey) {
      throw new Error("Meta API key not configured");
    }

    const response = await fetch("https://api.llama.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Meta API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    return {
      response: data.choices[0].message.content,
      tokensUsed: data.usage.total_tokens,
    };
  }

  /**
   * Call MLM (Manus-like) API
   */
  private async callMLM(
    model: LLMModel,
    messages: Array<{ role: string; content: string }>
  ): Promise<{ response: string; tokensUsed: number }> {
    // MLM is a local model that behaves like Manus
    // For now, return a placeholder - in production, this would call a local LLM
    return {
      response: `[MLM Response] Processing request with Manus-like autonomous behavior...`,
      tokensUsed: 1000,
    };
  }

  /**
   * Get request history
   */
  getRequestHistory(): LLMResponse[] {
    return this.requestHistory;
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageExecutionTime: number;
    byProvider: Record<string, { count: number; cost: number }>;
  } {
    const stats = {
      totalRequests: this.requestHistory.length,
      totalTokens: this.requestHistory.reduce((sum, r) => sum + r.tokensUsed, 0),
      totalCost: this.requestHistory.reduce((sum, r) => sum + r.cost, 0),
      averageExecutionTime:
        this.requestHistory.length > 0
          ? this.requestHistory.reduce((sum, r) => sum + r.executionTime, 0) /
            this.requestHistory.length
          : 0,
      byProvider: {} as Record<string, { count: number; cost: number }>,
    };

    this.requestHistory.forEach((r) => {
      if (!stats.byProvider[r.provider]) {
        stats.byProvider[r.provider] = { count: 0, cost: 0 };
      }
      stats.byProvider[r.provider].count++;
      stats.byProvider[r.provider].cost += r.cost;
    });

    return stats;
  }
}

export default MultiLLMService;
