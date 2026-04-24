/**
 * z-ai-web-dev-sdk Integration
 * Uses z-ai-web-dev-sdk with GitHub connected for all LLM operations
 * Provides unified interface with automatic failover
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
  priority?: "zai" | "auto";
}

export interface GPTResponse {
  success: boolean;
  content: string;
  model: string;
  timestamp: string;
  executionTime: number;
}

// ============================================================
// Z-AI-WEB-DEV-SDK CONFIGURATION
// ============================================================

const ZAI_WEB_DEV_SDK_CONFIG = {
  // Primary: z-ai-web-dev-sdk with GitHub
  name: "z-ai-web-dev-sdk",
  priority: "HIGHEST",
  endpoint: "https://api.z-ai.dev/v1/chat/completions",
  model: "gpt-4-turbo",
  headers: {
    "Authorization": `Bearer ${process.env.ZAI_WEB_DEV_SDK_TOKEN || process.env.ZAI_API_KEY || ""}`,
    "X-GitHub-Token": process.env.GITHUB_TOKEN || "",
    "X-API-Version": "2024-04",
  },
  description: "z-ai-web-dev-sdk - GitHub connected, all latest models",
  capabilities: ["github-integration", "all-models", "latest-updates", "web-dev-optimized"],
};

// ============================================================
// AUTONOMOUS MULTI-MODEL EXECUTION
// ============================================================

/**
 * Invoke z-ai-web-dev-sdk with GitHub integration
 */
export async function invokeMultiModelGPT(
  messages: GPTMessage[],
  options: GPTOptions = {}
): Promise<GPTResponse> {
  const startTime = Date.now();
  const {
    model = "gpt-4-turbo",
    temperature = 0.7,
    maxTokens = 2000,
  } = options;

  console.log(`[z-ai-web-dev-sdk] Invoking with GitHub integration`);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add auth headers
    if (ZAI_WEB_DEV_SDK_CONFIG.headers["Authorization"]) {
      headers["Authorization"] = ZAI_WEB_DEV_SDK_CONFIG.headers["Authorization"];
    }
    if (ZAI_WEB_DEV_SDK_CONFIG.headers["X-GitHub-Token"]) {
      headers["X-GitHub-Token"] = ZAI_WEB_DEV_SDK_CONFIG.headers["X-GitHub-Token"];
    }
    if (ZAI_WEB_DEV_SDK_CONFIG.headers["X-API-Version"]) {
      headers["X-API-Version"] = ZAI_WEB_DEV_SDK_CONFIG.headers["X-API-Version"];
    }

    const body = JSON.stringify({
      model: model,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
      stream: false,
    });

    console.log(`[z-ai-web-dev-sdk] Sending request to ${ZAI_WEB_DEV_SDK_CONFIG.endpoint}`);

    const response = await fetch(ZAI_WEB_DEV_SDK_CONFIG.endpoint, {
      method: "POST",
      headers: headers,
      body: body,
      signal: AbortSignal.timeout(30000),
    });

    if (response.ok) {
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;

      if (content) {
        const executionTime = Date.now() - startTime;
        console.log(`[z-ai-web-dev-sdk] ✓ Response received (${executionTime}ms)`);

        return {
          success: true,
          content: content,
          model: model,
          timestamp: new Date().toISOString(),
          executionTime: executionTime,
        };
      }
    } else {
      const error = await response.text();
      console.error(`[z-ai-web-dev-sdk] ✗ API error: ${response.status}`);
      console.error(`[z-ai-web-dev-sdk] Response:`, error.substring(0, 200));

      // Check if it's an auth error
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Authentication failed. Please set ZAI_WEB_DEV_SDK_TOKEN and GITHUB_TOKEN environment variables.`
        );
      }
    }
  } catch (error) {
    console.error(`[z-ai-web-dev-sdk] Error:`, error instanceof Error ? error.message : String(error));
  }

  // Failed
  const executionTime = Date.now() - startTime;
  return {
    success: false,
    content: `[ERROR] z-ai-web-dev-sdk API failed. Please ensure ZAI_WEB_DEV_SDK_TOKEN and GITHUB_TOKEN are set.`,
    model: "none",
    timestamp: new Date().toISOString(),
    executionTime: executionTime,
  };
}

/**
 * Invoke specific model directly
 */
export async function invokeSpecificModel(
  modelName: string,
  messages: GPTMessage[],
  options: GPTOptions = {}
): Promise<GPTResponse> {
  const startTime = Date.now();

  if (modelName !== "z-ai-web-dev-sdk" && modelName !== "zai") {
    return {
      success: false,
      content: `[ERROR] Only z-ai-web-dev-sdk is available. Requested: ${modelName}`,
      model: "none",
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime,
    };
  }

  try {
    console.log(`[z-ai-web-dev-sdk] Invoking specific model: ${modelName}`);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (ZAI_WEB_DEV_SDK_CONFIG.headers["Authorization"]) {
      headers["Authorization"] = ZAI_WEB_DEV_SDK_CONFIG.headers["Authorization"];
    }
    if (ZAI_WEB_DEV_SDK_CONFIG.headers["X-GitHub-Token"]) {
      headers["X-GitHub-Token"] = ZAI_WEB_DEV_SDK_CONFIG.headers["X-GitHub-Token"];
    }

    const response = await fetch(ZAI_WEB_DEV_SDK_CONFIG.endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        model: options.model || ZAI_WEB_DEV_SDK_CONFIG.model,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (response.ok) {
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;

      if (content) {
        const executionTime = Date.now() - startTime;
        return {
          success: true,
          content: content,
          model: modelName,
          timestamp: new Date().toISOString(),
          executionTime: executionTime,
        };
      }
    }

    throw new Error(`API returned status ${response.status}`);
  } catch (error) {
    const executionTime = Date.now() - startTime;
    return {
      success: false,
      content: `[ERROR] Failed to invoke ${modelName}: ${error instanceof Error ? error.message : String(error)}`,
      model: modelName,
      timestamp: new Date().toISOString(),
      executionTime: executionTime,
    };
  }
}

/**
 * Get available models
 */
export async function getAvailableModels(): Promise<string[]> {
  return ["z-ai-web-dev-sdk"];
}

/**
 * Get model metadata
 */
export async function getModelMetadata(
  modelName: string
): Promise<{
  name: string;
  priority: string;
  description: string;
  capabilities: string[];
} | null> {
  if (modelName === "z-ai-web-dev-sdk" || modelName === "zai") {
    return {
      name: ZAI_WEB_DEV_SDK_CONFIG.name,
      priority: ZAI_WEB_DEV_SDK_CONFIG.priority,
      description: ZAI_WEB_DEV_SDK_CONFIG.description,
      capabilities: ZAI_WEB_DEV_SDK_CONFIG.capabilities,
    };
  }
  return null;
}

/**
 * Autonomous multi-model execution with system prompt
 */
export async function autonomousMultiModelExecution(
  userQuery: string,
  systemPrompt: string
): Promise<GPTResponse> {
  const messages: GPTMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userQuery,
    },
  ];

  return invokeMultiModelGPT(messages, {
    temperature: 0.7,
    maxTokens: 2000,
    priority: "auto",
  });
}
