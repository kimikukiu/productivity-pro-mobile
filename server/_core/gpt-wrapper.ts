/**
 * GPT Wrapper - Integrates WormGPT, XGPT-WormGPT, Hexstrike-AI APIs
 * Provides unified interface for all GPT models with automatic fallback
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
}

const GPT_APIS = [
  {
    name: "wormgpt",
    endpoint: "https://api.wormgpt.ai/v1/chat/completions",
    model: "wormgpt-ultra",
    headers: { "X-API-Key": process.env.WORMGPT_API_KEY || "free" },
  },
  {
    name: "xgpt-wormgpt",
    endpoint: "https://api.xgpt-wormgpt.ai/chat",
    model: "xgpt-wormgpt",
    headers: { "Authorization": `Bearer ${process.env.XGPT_API_KEY || "free"}` },
  },
  {
    name: "hexstrike-ai",
    endpoint: "https://api.hexstrike.ai/v1/chat",
    model: "hexstrike-ai",
    headers: { "X-API-Key": process.env.HEXSTRIKE_API_KEY || "free" },
  },
  {
    name: "groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    model: "mixtral-8x7b-32768",
    headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY || "free"}` },
  },
  {
    name: "deepseek",
    endpoint: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
    headers: { "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY || "free"}` },
  },
];

export async function invokeGPTWrapper(
  messages: GPTMessage[],
  options: GPTOptions = {}
): Promise<string> {
  const { model = "auto", temperature = 0.7, maxTokens = 2000 } = options;

  // Try each API in order
  for (const api of GPT_APIS) {
    try {
      console.log(`[GPT] Trying ${api.name}...`);

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
          temperature: temperature,
          max_tokens: maxTokens,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          console.log(`[GPT] ${api.name} responded successfully`);
          return content;
        }
      } else {
        const error = await response.text();
        console.log(`[GPT] ${api.name} failed: ${response.status} - ${error}`);
      }
    } catch (error) {
      console.log(
        `[GPT] ${api.name} error:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // If all APIs fail, return error message
  return "[ERROR] All GPT APIs failed. Please check your API keys and try again.";
}

/**
 * Invoke a specific GPT model directly
 */
export async function invokeSpecificGPT(
  apiName: string,
  messages: GPTMessage[],
  options: GPTOptions = {}
): Promise<string> {
  const api = GPT_APIS.find((a) => a.name === apiName);
  if (!api) {
    return `[ERROR] Unknown GPT API: ${apiName}`;
  }

  try {
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
      return data.choices?.[0]?.message?.content || "[ERROR] No response from GPT";
    } else {
      const error = await response.text();
      return `[ERROR] ${api.name} failed: ${response.status} - ${error}`;
    }
  } catch (error) {
    return `[ERROR] ${api.name} error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

/**
 * Get list of available GPT APIs
 */
export function getAvailableGPTAPIs(): string[] {
  return GPT_APIS.map((api) => api.name);
}
