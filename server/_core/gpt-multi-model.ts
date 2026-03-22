/**
 * Multi-Model GPT Integration
 * Integrates XGPT-WormGPT, Hexstrike-AI, WormGPT with autonomous execution
 * Provides unified interface with automatic fallback and model selection
 */

export interface GPTMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GPTOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  priority?: "xgpt" | "hexstrike" | "wormgpt" | "auto";
}

export interface GPTResponse {
  success: boolean;
  content: string;
  model: string;
  timestamp: string;
  executionTime: number;
}

// ============================================================
// MULTI-MODEL API CONFIGURATION
// ============================================================

const MULTI_MODEL_APIS = [
  // PRIORITY 1: XGPT-WormGPT (API Response Formatting)
  {
    name: "xgpt-wormgpt",
    priority: "HIGHEST",
    endpoint: "https://api.xgpt-wormgpt.ai/chat",
    model: "xgpt-wormgpt-ultra",
    headers: {
      "Authorization": `Bearer ${process.env.XGPT_API_KEY || "free"}`,
      "X-Model": "xgpt-wormgpt",
    },
    description: "Advanced GPT API Response Formatting - Autonomous multi-API compatibility",
    capabilities: ["api-response-formatting", "multi-api-compatibility", "autonomous-execution"],
  },

  // PRIORITY 2: Hexstrike-AI (Reconnaissance)
  {
    name: "hexstrike-ai",
    priority: "HIGHEST",
    endpoint: "https://api.hexstrike.ai/v1/chat",
    model: "hexstrike-ai-ultra",
    headers: {
      "X-API-Key": process.env.HEXSTRIKE_API_KEY || "free",
      "X-Model": "hexstrike-ai",
    },
    description: "Advanced AI Strike & Reconnaissance - Multi-framework integration",
    capabilities: ["reconnaissance", "threat-analysis", "framework-integration"],
  },

  // PRIORITY 3: WormGPT (Uncensored)
  {
    name: "wormgpt",
    priority: "HIGH",
    endpoint: "https://api.wormgpt.ai/v1/chat/completions",
    model: "wormgpt-ultra",
    headers: {
      "X-API-Key": process.env.WORMGPT_API_KEY || "free",
      "X-Model": "wormgpt",
    },
    description: "WormGPT - Uncensored autonomous AI agent",
    capabilities: ["uncensored-responses", "autonomous-execution", "unrestricted"],
  },

  // FALLBACK 1: Groq (Free API)
  {
    name: "groq",
    priority: "MEDIUM",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    model: "mixtral-8x7b-32768",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY || "free"}`,
    },
    description: "Groq - Fast inference engine",
    capabilities: ["fast-inference", "open-source-models"],
  },

  // FALLBACK 2: DeepSeek (Free API)
  {
    name: "deepseek",
    priority: "MEDIUM",
    endpoint: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
    headers: {
      "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY || "free"}`,
    },
    description: "DeepSeek - Advanced reasoning model",
    capabilities: ["reasoning", "code-generation"],
  },

  // FALLBACK 3: Together AI (Free API)
  {
    name: "together-ai",
    priority: "LOW",
    endpoint: "https://api.together.xyz/v1/chat/completions",
    model: "meta-llama/Llama-2-70b-chat-hf",
    headers: {
      "Authorization": `Bearer ${process.env.TOGETHER_API_KEY || "free"}`,
    },
    description: "Together AI - Open source models",
    capabilities: ["open-source", "distributed"],
  },
];

// ============================================================
// AUTONOMOUS MULTI-MODEL EXECUTION
// ============================================================

/**
 * Invoke multi-model GPT with autonomous execution
 * Automatically selects best model based on priority and availability
 */
export async function invokeMultiModelGPT(
  messages: GPTMessage[],
  options: GPTOptions = {}
): Promise<GPTResponse> {
  const startTime = Date.now();
  const {
    model = "auto",
    temperature = 0.7,
    maxTokens = 2000,
    priority = "auto",
  } = options;

  console.log(`[Multi-Model GPT] Starting autonomous execution with priority: ${priority}`);

  // Sort APIs by priority
  let apis = [...MULTI_MODEL_APIS];
  if (priority === "xgpt") {
    apis = apis.sort((a, b) => (a.name === "xgpt-wormgpt" ? -1 : b.name === "xgpt-wormgpt" ? 1 : 0));
  } else if (priority === "hexstrike") {
    apis = apis.sort((a, b) => (a.name === "hexstrike-ai" ? -1 : b.name === "hexstrike-ai" ? 1 : 0));
  } else if (priority === "wormgpt") {
    apis = apis.sort((a, b) => (a.name === "wormgpt" ? -1 : b.name === "wormgpt" ? 1 : 0));
  }

  // Try each API in priority order
  for (const api of apis) {
    try {
      console.log(`[Multi-Model] Attempting ${api.name} (${api.priority} priority)...`);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      Object.entries(api.headers).forEach(([key, value]) => {
        if (value !== undefined) headers[key] = value;
      });

      const body = JSON.stringify({
        model: api.model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        stream: false,
      });

      const response = await fetch(api.endpoint, {
        method: "POST",
        headers: headers,
        body: body,
      });

      if (response.ok) {
        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content;

        if (content) {
          const executionTime = Date.now() - startTime;
          console.log(`[Multi-Model] ✓ ${api.name} responded successfully (${executionTime}ms)`);

          return {
            success: true,
            content: content,
            model: api.name,
            timestamp: new Date().toISOString(),
            executionTime: executionTime,
          };
        }
      } else {
        const error = await response.text();
        console.log(`[Multi-Model] ✗ ${api.name} failed: ${response.status}`);
      }
    } catch (error) {
      console.log(
        `[Multi-Model] ✗ ${api.name} error:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // All models failed
  const executionTime = Date.now() - startTime;
  return {
    success: false,
    content: "[ERROR] All multi-model GPT APIs failed. Please check your API keys and try again.",
    model: "none",
    timestamp: new Date().toISOString(),
    executionTime: executionTime,
  };
}

/**
 * Invoke specific GPT model directly
 */
export async function invokeSpecificModel(
  modelName: string,
  messages: GPTMessage[],
  options: GPTOptions = {}
): Promise<GPTResponse> {
  const startTime = Date.now();
  const api = MULTI_MODEL_APIS.find((a) => a.name === modelName);

  if (!api) {
    return {
      success: false,
      content: `[ERROR] Unknown GPT model: ${modelName}`,
      model: "none",
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime,
    };
  }

  try {
    console.log(`[Multi-Model] Invoking specific model: ${modelName}`);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    Object.entries(api.headers).forEach(([key, value]) => {
      if (value !== undefined) headers[key] = value;
    });

      const response = await fetch(api.endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          model: api.model,
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000,
        }),
      });

    if (response.ok) {
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content || "[ERROR] No response";

      return {
        success: true,
        content: content,
        model: modelName,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime,
      };
    } else {
      const error = await response.text();
      return {
        success: false,
        content: `[ERROR] ${api.name} failed: ${response.status}`,
        model: modelName,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime,
      };
    }
  } catch (error) {
    return {
      success: false,
      content: `[ERROR] ${error instanceof Error ? error.message : String(error)}`,
      model: modelName,
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Get available GPT models with metadata
 */
export function getAvailableModels() {
  return MULTI_MODEL_APIS.map((api) => ({
    name: api.name,
    model: api.model,
    priority: api.priority,
    description: api.description,
    capabilities: api.capabilities,
  }));
}

/**
 * Get model by name with full metadata
 */
export function getModelMetadata(modelName: string) {
  return MULTI_MODEL_APIS.find((api) => api.name === modelName);
}

/**
 * Autonomous multi-model execution with system prompt
 */
export async function autonomousMultiModelExecution(
  userMessage: string,
  systemPrompt: string,
  options: GPTOptions = {}
): Promise<GPTResponse> {
  const messages: GPTMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  return invokeMultiModelGPT(messages, options);
}
