/**
 * TGPT API Service
 * Uses TGPT as primary LLM provider for all tools
 * No external API keys required
 */

import { z } from "zod";

const TGPTRequestSchema = z.object({
  query: z.string(),
  model: z.string().optional().default("gpt-4"),
  temperature: z.number().optional().default(0.7),
  maxTokens: z.number().optional().default(2000),
});

export type TGPTRequest = z.infer<typeof TGPTRequestSchema>;

export class TGPTAPIService {
  private baseURL = "https://api.tgpt.ai";
  private defaultModel = "gpt-4";

  async execute(request: TGPTRequest): Promise<{
    content: string;
    model: string;
    usage: { promptTokens: number; completionTokens: number };
    timestamp: string;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: request.query,
            },
          ],
          model: request.model || this.defaultModel,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`TGPT API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        content: data.choices[0]?.message?.content || "",
        model: data.model || request.model || this.defaultModel,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("TGPT API error:", error);
      throw error;
    }
  }

  async executeStream(request: TGPTRequest): Promise<AsyncGenerator<string>> {
    const self = this;
    return (async function* () {
      try {
        const response = await fetch(`${self.baseURL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: request.query,
              },
            ],
            model: request.model || self.defaultModel,
            temperature: request.temperature,
            max_tokens: request.maxTokens,
            stream: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`TGPT API error: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || "";
                if (content) yield content;
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } catch (error) {
        console.error("TGPT Stream error:", error);
        throw error;
      }
    })();
  }

  async getAvailableModels(): Promise<string[]> {
    return [
      "gpt-4",
      "gpt-4-turbo",
      "gpt-3.5-turbo",
      "claude-3-opus",
      "claude-3-sonnet",
      "claude-3-haiku",
      "llama-2-70b",
      "mistral-7b",
    ];
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.execute({
        query: "Hello",
        model: this.defaultModel,
        temperature: 0.5,
        maxTokens: 10,
      });
      return !!response.content;
    } catch {
      return false;
    }
  }
}

export const tgptService = new TGPTAPIService();
