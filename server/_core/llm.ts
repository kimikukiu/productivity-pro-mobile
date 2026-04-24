// Use native fetch (available in Node 18+)

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
  object: "chat.completion";
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | null;
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

// ============================================================
// MODEL ROUTING & FALLBACK CHAIN - REAL WORKING MODELS ONLY
// ============================================================

interface ModelConfig {
  id: string;
  name: string;
  apiUrl: string;
  apiKey?: string;
  modelName: string;
  maxTokens: number;
  timeout: number;
  priority: number; // Lower = higher priority
}

const getModelConfigs = (): ModelConfig[] => {
  const configs: ModelConfig[] = [];

  // Priority 1: Ollama Local (No API key needed, always available)
  configs.push({
    id: "ollama-local",
    name: "Ollama Local (Mistral)",
    apiUrl: "http://localhost:11434/api/chat",
    modelName: "mistral",
    maxTokens: 2048,
    timeout: 60000,
    priority: 1,
  });

  // Priority 2: DeepSeek Free API (Real endpoint)
  configs.push({
    id: "deepseek-free",
    name: "DeepSeek Free API",
    apiUrl: "https://api.deepseek.com/chat/completions",
    apiKey: process.env.DEEPSEEK_API_KEY || "free", // Use env var or free tier
    modelName: "deepseek-chat",
    maxTokens: 4096,
    timeout: 45000,
    priority: 2,
  });

  // Priority 3: Groq Free API (Real working endpoint)
  if (process.env.GROQ_API_KEY) {
    configs.push({
      id: "groq-free",
      name: "Groq (Free)",
      apiUrl: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: process.env.GROQ_API_KEY,
      modelName: "mixtral-8x7b-32768",
      maxTokens: 32768,
      timeout: 45000,
      priority: 3,
    });
  }

  // Priority 4: Together AI Free (Real endpoint)
  if (process.env.TOGETHER_API_KEY) {
    configs.push({
      id: "together-ai",
      name: "Together AI",
      apiUrl: "https://api.together.xyz/v1/chat/completions",
      apiKey: process.env.TOGETHER_API_KEY,
      modelName: "meta-llama/Llama-2-70b-chat-hf",
      maxTokens: 4096,
      timeout: 45000,
      priority: 4,
    });
  }

  // Sort by priority
  return configs.sort((a, b) => a.priority - b.priority);
};

async function invokeWithRetry(
  config: ModelConfig,
  payload: Record<string, unknown>,
  retries: number = 0,
): Promise<InvokeResult> {
  const maxRetries = 2;
  const baseDelay = 1000;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeout);

    // Special handling for Ollama (different API format)
    let requestBody: Record<string, unknown>;
    let headers: Record<string, string>;

    if (config.id === "ollama-local") {
      requestBody = {
        model: config.modelName,
        messages: payload.messages,
        stream: false,
      };
      headers = {
        "content-type": "application/json",
      };
    } else {
      // Standard OpenAI-compatible API
      requestBody = {
        ...payload,
        model: config.modelName,
      };
      headers = {
        "content-type": "application/json",
        ...(config.apiKey ? { authorization: `Bearer ${config.apiKey}` } : {}),
      };
    }

    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    } as any);

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Error ${response.status}: ${response.statusText} – ${errorText.substring(0, 200)}`,
      );
    }

    const data = await response.json();

    // Normalize Ollama response to OpenAI format
    if (config.id === "ollama-local" && data.message) {
      return {
        id: "ollama-" + Date.now(),
        created: Math.floor(Date.now() / 1000),
        model: config.modelName,
        object: "chat.completion",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: data.message.content,
            },
            finish_reason: "stop",
          },
        ],
      };
    }

    return data as InvokeResult;
  } catch (error: any) {
    if (retries < maxRetries) {
      const delay = baseDelay * Math.pow(2, retries);
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
  const { messages, maxTokens = 2048 } = params;

  const payload = {
    messages: messages.map(normalizeMessage),
    max_tokens: maxTokens,
    temperature: 0.7,
  };

  const configs = getModelConfigs();
  let lastError: Error | null = null;

  for (const config of configs) {
    try {
      console.log(`[LLM] Attempting with ${config.name}...`);
      const result = await invokeWithRetry(config, payload);
      console.log(`[LLM] ✓ Success with ${config.name}`);
      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`[LLM] ✗ Failed with ${config.name}: ${error.message}`);
      // Continue to next model
    }
  }

  throw new Error(
    `LLM invoke failed across all models. Last error: ${lastError?.message || "Unknown error"}`,
  );
}

export default { invokeLLM };
