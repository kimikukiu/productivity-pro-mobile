import { describe, it, expect } from "vitest";

describe("LLM API Key Validation", () => {
  it("should validate LLM API key with provider", async () => {
    const apiKey = process.env.LLM_API_KEY;
    const provider = process.env.LLM_PROVIDER;

    expect(apiKey).toBeDefined();
    expect(provider).toBeDefined();
    expect(["deepseek", "groq", "together", "openrouter", "ollama"]).toContain(provider);

    // Test with actual API call
    if (provider === "groq" && apiKey) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [{ role: "user", content: "test" }],
          max_tokens: 10,
        }),
      });

      expect(response.status).not.toBe(401);
      expect(response.ok || response.status === 200).toBe(true);
    }

    if (provider === "deepseek" && apiKey) {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: "test" }],
          max_tokens: 10,
        }),
      });

      expect(response.status).not.toBe(401);
    }
  });
});
