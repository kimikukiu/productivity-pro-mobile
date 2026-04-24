import { apiKeyStore } from "./api-keys-storage";

/**
 * LLM Service with Stored API Keys
 * Reads from stored API keys and executes with proper fallback chain
 */

interface LLMResponse {
  success: boolean;
  message: string;
  model: string;
  provider: string;
  response?: string;
  error?: string;
}

/**
 * Invoke LLM with stored API keys
 * Uses priority-based fallback chain
 */
export async function invokeLLMWithStoredKeys(
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  try {
    // Get active API keys sorted by priority
    const activeKeys = apiKeyStore.getActiveKeys();

    if (activeKeys.length === 0) {
      return {
        success: false,
        message: "No API keys configured. Please add API keys in the API Keys management screen.",
        model: "none",
        provider: "none",
        error: "NO_API_KEYS",
      };
    }

    // Try each API key in priority order
    for (const keyEntry of activeKeys) {
      try {
        const result = await tryProviderAPI(
          keyEntry.provider,
          keyEntry.apiKey,
          keyEntry.modelId,
          prompt,
          systemPrompt
        );

        if (result.success) {
          return result;
        }
      } catch (error) {
        console.error(`Failed with ${keyEntry.provider}:`, error);
        // Continue to next provider
      }
    }

    return {
      success: false,
      message: "All API keys failed. Please check your API keys and try again.",
      model: "none",
      provider: "none",
      error: "ALL_KEYS_FAILED",
    };
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      model: "none",
      provider: "none",
      error: "UNKNOWN_ERROR",
    };
  }
}

/**
 * Try a specific provider API
 */
async function tryProviderAPI(
  provider: string,
  apiKey: string,
  modelId: string | undefined,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  switch (provider.toLowerCase()) {
    case "openai":
      return invokeOpenAI(apiKey, modelId || "gpt-4", prompt, systemPrompt);
    case "claude":
      return invokeClaude(apiKey, modelId || "claude-3-opus-20240229", prompt, systemPrompt);
    case "deepseek":
      return invokeDeepSeek(apiKey, modelId || "deepseek-chat", prompt, systemPrompt);
    case "groq":
      return invokeGroq(apiKey, modelId || "mixtral-8x7b-32768", prompt, systemPrompt);
    case "gemini":
      return invokeGemini(apiKey, modelId || "gemini-pro", prompt, systemPrompt);
    case "mistral":
      return invokeMistral(apiKey, modelId || "mistral-large-latest", prompt, systemPrompt);
    case "meta":
      return invokeMeta(apiKey, modelId || "llama-2-70b", prompt, systemPrompt);
    case "grok":
      return invokeGrok(apiKey, modelId || "grok-1", prompt, systemPrompt);
    case "cohere":
      return invokeCohere(apiKey, modelId || "command", prompt, systemPrompt);
    case "perplexity":
      return invokePerplexity(apiKey, modelId || "pplx-7b-online", prompt, systemPrompt);
    case "openrouter":
      return invokeOpenRouter(apiKey, modelId || "openai/gpt-4", prompt, systemPrompt);
    case "together":
      return invokeTogether(apiKey, modelId || "meta-llama/Llama-2-70b-chat-hf", prompt, systemPrompt);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * OpenAI API
 */
async function invokeOpenAI(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI API error");
  }

  return {
    success: true,
    message: "Success",
    model,
    provider: "openai",
    response: data.choices[0]?.message?.content || "",
  };
}

/**
 * Anthropic Claude API
 */
async function invokeClaude(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Claude API error");
  }

  return {
    success: true,
    message: "Success",
    model,
    provider: "claude",
    response: data.content[0]?.text || "",
  };
}

/**
 * DeepSeek API
 */
async function invokeDeepSeek(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "DeepSeek API error");
  }

  return {
    success: true,
    message: "Success",
    model,
    provider: "deepseek",
    response: data.choices[0]?.message?.content || "",
  };
}

/**
 * Groq API
 */
async function invokeGroq(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  const response = await fetch("https://api.groq.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Groq API error");
  }

  return {
    success: true,
    message: "Success",
    model,
    provider: "groq",
    response: data.choices[0]?.message?.content || "",
  };
}

/**
 * Google Gemini API
 */
async function invokeGemini(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              ...(systemPrompt ? [{ text: systemPrompt }] : []),
              { text: prompt },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini API error");
  }

  return {
    success: true,
    message: "Success",
    model,
    provider: "gemini",
    response: data.candidates[0]?.content?.parts[0]?.text || "",
  };
}

/**
 * Mistral API
 */
async function invokeMistral(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Mistral API error");
  }

  return {
    success: true,
    message: "Success",
    model,
    provider: "mistral",
    response: data.choices[0]?.message?.content || "",
  };
}

/**
 * Meta LLaMA API
 */
async function invokeMeta(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  const response = await fetch("https://api.llama.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Meta API error");
  }

  return {
    success: true,
    message: "Success",
    model,
    provider: "meta",
    response: data.choices[0]?.message?.content || "",
  };
}

/**
 * xAI Grok API
 */
async function invokeGrok(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Grok API error");
  }

  return {
    success: true,
    message: "Success",
    model,
    provider: "grok",
    response: data.choices[0]?.message?.content || "",
  };
}

/**
 * Cohere API
 */
async function invokeCohere(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  const response = await fetch("https://api.cohere.ai/v1/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Cohere API error");
  }

  return {
    success: true,
    message: "Success",
    model,
    provider: "cohere",
    response: data.generations[0]?.text || "",
  };
}

/**
 * Perplexity API
 */
async function invokePerplexity(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Perplexity API error");
  }

  return {
    success: true,
    message: "Success",
    model,
    provider: "perplexity",
    response: data.choices[0]?.message?.content || "",
  };
}

/**
 * OpenRouter API
 */
async function invokeOpenRouter(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenRouter API error");
  }

  return {
    success: true,
    message: "Success",
    model,
    provider: "openrouter",
    response: data.choices[0]?.message?.content || "",
  };
}

/**
 * Together AI API
 */
async function invokeTogether(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  const response = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Together API error");
  }

  return {
    success: true,
    message: "Success",
    model,
    provider: "together",
    response: data.choices[0]?.message?.content || "",
  };
}
