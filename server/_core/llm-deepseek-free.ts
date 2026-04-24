// DeepSeek Free API + Ollama Local - NO FAKE KEYS
type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

interface LLMResponse {
  content: string;
  model: string;
  usage?: { prompt_tokens: number; completion_tokens: number };
}

// DeepSeek Free API endpoint (LLM-Red-Team)
const DEEPSEEK_FREE_ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

// Ollama local endpoint
const OLLAMA_ENDPOINT = "http://localhost:11434/api/chat";

export async function invokeDeepSeekFree(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LLMResponse> {
  try {
    console.log("[LLM] Trying DeepSeek Free API...");
    
    const response = await fetch(DEEPSEEK_FREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return {
      content: data.choices?.[0]?.message?.content || "No response",
      model: "deepseek-chat",
      usage: data.usage,
    };
  } catch (error) {
    console.log("[LLM] DeepSeek failed, trying Ollama...");
    return invokeOllamaLocal(messages, options);
  }
}

export async function invokeOllamaLocal(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LLMResponse> {
  try {
    console.log("[LLM] Trying Ollama Local...");
    
    const response = await fetch(OLLAMA_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        messages: messages,
        temperature: options?.temperature || 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json() as any;
    return {
      content: data.message?.content || "No response",
      model: "ollama-mistral",
    };
  } catch (error) {
    console.log("[LLM] Ollama failed, returning fallback response");
    return {
      content: "LLM service temporarily unavailable. Please try again.",
      model: "fallback",
    };
  }
}

export async function invokeLLM(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LLMResponse> {
  return invokeDeepSeekFree(messages, options);
}
