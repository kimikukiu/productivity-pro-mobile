import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4";
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice = ToolChoicePrimitive | ToolChoiceByName | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  model?: string;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (value: MessageContent | MessageContent[]): MessageContent[] =>
  Array.isArray(value) ? value : [value];

const normalizeContentPart = (part: MessageContent): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map((part) => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined,
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error("tool_choice 'required' was provided but no tools were configured");
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly",
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error("responseFormat json_schema requires a defined schema object");
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

// ============================================================
// MODEL ROUTING & FALLBACK CHAIN
// ============================================================

interface ModelConfig {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
  modelName: string;
  maxTokens: number;
  timeout: number;
}

const getModelConfigs = (): ModelConfig[] => {
  const configs: ModelConfig[] = [];

  // Primary: Manus Forge API (Gemini)
  if (ENV.forgeApiKey) {
    configs.push({
      id: "manus-gpt",
      name: "Manus GPT (Gemini)",
      apiUrl: ENV.forgeApiUrl
        ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
        : "https://forge.manus.im/v1/chat/completions",
      apiKey: ENV.forgeApiKey,
      modelName: "gemini-2.5-flash",
      maxTokens: 4096,
      timeout: 30000,
    });
  }

  // Fallback 1: DeepSeek Free API
  configs.push({
    id: "deepseek-gpt",
    name: "DeepSeek (Free API)",
    apiUrl: "https://api.deepseek.com/chat/completions",
    apiKey: "sk-deepseek-free", // Free tier
    modelName: "deepseek-chat",
    maxTokens: 4096,
    timeout: 30000,
  });

  // Fallback 2: OpenRouter (if available)
  if (process.env.OPENROUTER_API_KEY) {
    configs.push({
      id: "openrouter-gpt",
      name: "OpenRouter",
      apiUrl: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: process.env.OPENROUTER_API_KEY,
      modelName: "gpt-3.5-turbo",
      maxTokens: 4096,
      timeout: 30000,
    });
  }

  // Fallback 3: Groq API (free tier, very fast)
  if (process.env.GROQ_API_KEY) {
    configs.push({
      id: "groq-gpt",
      name: "Groq (Free API)",
      apiUrl: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: process.env.GROQ_API_KEY,
      modelName: "mixtral-8x7b-32768",
      maxTokens: 4096,
      timeout: 30000,
    });
  }

  return configs;
};

const mapUserModelToConfig = (userModel?: string): ModelConfig[] => {
  const allConfigs = getModelConfigs();

  if (!userModel) {
    // Default: return all in order (primary first, then fallbacks)
    return allConfigs;
  }

  // Map user model selection to available configs
  const modelMap: Record<string, string[]> = {
    "manus-gpt": ["manus-gpt", "deepseek-gpt", "openrouter-gpt", "local-gpt"],
    "meta-gpt": ["deepseek-gpt", "manus-gpt", "openrouter-gpt", "local-gpt"],
    "glm5": ["deepseek-gpt", "manus-gpt", "openrouter-gpt", "local-gpt"],
    "deepseek": ["deepseek-gpt", "manus-gpt", "openrouter-gpt", "local-gpt"],
  };

  const preferredIds = modelMap[userModel] || modelMap["manus-gpt"];
  return preferredIds
    .map((id) => allConfigs.find((c) => c.id === id))
    .filter((c): c is ModelConfig => !!c);
};

// ============================================================
// RETRY LOGIC WITH EXPONENTIAL BACKOFF
// ============================================================

async function invokeWithRetry(
  config: ModelConfig,
  payload: Record<string, unknown>,
  retries: number = 0,
): Promise<InvokeResult> {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        ...payload,
        model: config.modelName,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Error ${response.status}: ${response.statusText} – ${errorText.substring(0, 200)}`,
      );
    }

    const data = await response.json();
    return data as InvokeResult;
  } catch (error: any) {
    // Retry logic
    if (retries < maxRetries) {
      const delay = baseDelay * Math.pow(2, retries); // Exponential backoff
      console.warn(
        `[LLM] Retry ${retries + 1}/${maxRetries} for ${config.name} after ${delay}ms. Error: ${error.message}`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return invokeWithRetry(config, payload, retries + 1);
    }

    throw error;
  }
}

// ============================================================
// MAIN INVOKE FUNCTION WITH FALLBACK CHAIN
// ============================================================

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
    model: userModel,
  } = params;

  const modelConfigs = mapUserModelToConfig(userModel);

  if (modelConfigs.length === 0) {
    throw new Error("No model configurations available");
  }

  const payload: Record<string, unknown> = {
    messages: messages.map(normalizeMessage),
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(toolChoice || tool_choice, tools);
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  // Safe token limits - avoid exceeding API limits
  payload.max_tokens = 4096;

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  // Try each model in fallback chain
  let lastError: Error | null = null;

  for (const config of modelConfigs) {
    try {
      console.log(`[LLM] Attempting with ${config.name}...`);
      const result = await invokeWithRetry(config, payload);
      console.log(`[LLM] Success with ${config.name}`);
      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`[LLM] Failed with ${config.name}: ${error.message}`);
      // Continue to next model in chain
    }
  }

  // All models failed - throw error with details
  throw new Error(
    `LLM invoke failed across all models. Last error: ${lastError?.message || "Unknown error"}`,
  );
}

// ============================================================
// HEALTH CHECK ENDPOINT
// ============================================================

export async function checkLLMHealth(): Promise<{
  status: "healthy" | "degraded" | "unhealthy";
  availableModels: string[];
  primaryModel: string | null;
}> {
  const configs = getModelConfigs();
  const available: string[] = [];
  let primaryModel: string | null = null;

  for (const config of configs) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(config.apiUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.modelName,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 10,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        available.push(config.name);
        if (!primaryModel) primaryModel = config.name;
      }
    } catch (error) {
      // Model unavailable
    }
  }

  return {
    status: available.length > 0 ? (available.length === configs.length ? "healthy" : "degraded") : "unhealthy",
    availableModels: available,
    primaryModel,
  };
}
