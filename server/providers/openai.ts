/**
 * OpenAI Provider
 * Sign up at https://platform.openai.com
 * Requires OPENAI_API_KEY environment variable
 */

import { BaseProvider, LLMRequest, LLMResponse } from "./base-provider";

export class OpenAIProvider extends BaseProvider {
  name = "openai";
  displayName = "OpenAI GPT";
  models = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"];

  private apiKey: string;
  private baseUrl = "https://api.openai.com/v1/chat/completions";

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || "";
    if (!this.apiKey) {
      console.warn("[OpenAI] No API key provided. Set OPENAI_API_KEY env var.");
    }
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: request.model || "gpt-4o",
          messages: request.messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 2048,
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${error}`);
      }

      const data = await response.json();

      return {
        text: data.choices?.[0]?.message?.content || "",
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        model: request.model || "unknown",
        provider: this.name,
      };
    } catch (error) {
      console.error("[OpenAI] Error:", error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }
}

export function createOpenAIProvider(apiKey?: string): OpenAIProvider {
  return new OpenAIProvider(apiKey);
}
