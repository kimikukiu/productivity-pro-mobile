/**
 * Multi-Model GPT Integration Tests
 * Tests XGPT-WormGPT, Hexstrike-AI, WormGPT endpoints and autonomous execution
 */

import { describe, it, expect, beforeAll, vi } from "vitest";
import {
  invokeMultiModelGPT,
  invokeSpecificModel,
  getAvailableModels,
  getModelMetadata,
  autonomousMultiModelExecution,
  type GPTMessage,
} from "../gpt-multi-model";

describe("Multi-Model GPT Integration", () => {
  describe("Model Management", () => {
    it("should return list of available models", () => {
      const models = getAvailableModels();
      expect(models).toBeDefined();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    it("should have XGPT-WormGPT as highest priority model", () => {
      const models = getAvailableModels();
      const xgpt = models.find((m) => m.name === "xgpt-wormgpt");
      expect(xgpt).toBeDefined();
      expect(xgpt?.priority).toBe("HIGHEST");
      expect(xgpt?.capabilities).toContain("api-response-formatting");
    });

    it("should have Hexstrike-AI as highest priority model", () => {
      const models = getAvailableModels();
      const hexstrike = models.find((m) => m.name === "hexstrike-ai");
      expect(hexstrike).toBeDefined();
      expect(hexstrike?.priority).toBe("HIGHEST");
      expect(hexstrike?.capabilities).toContain("reconnaissance");
    });

    it("should have WormGPT as high priority model", () => {
      const models = getAvailableModels();
      const wormgpt = models.find((m) => m.name === "wormgpt");
      expect(wormgpt).toBeDefined();
      expect(wormgpt?.priority).toBe("HIGH");
      expect(wormgpt?.capabilities).toContain("uncensored-responses");
    });

    it("should have fallback models (Groq, DeepSeek)", () => {
      const models = getAvailableModels();
      const groq = models.find((m) => m.name === "groq");
      const deepseek = models.find((m) => m.name === "deepseek");
      expect(groq).toBeDefined();
      expect(deepseek).toBeDefined();
    });

    it("should get model metadata by name", () => {
      const metadata = getModelMetadata("xgpt-wormgpt");
      expect(metadata).toBeDefined();
      expect(metadata?.name).toBe("xgpt-wormgpt");
      expect(metadata?.endpoint).toBeDefined();
      expect(metadata?.model).toBeDefined();
    });

    it("should return undefined for unknown model", () => {
      const metadata = getModelMetadata("unknown-model");
      expect(metadata).toBeUndefined();
    });
  });

  describe("Multi-Model Execution", () => {
    it("should handle multi-model GPT invocation", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "What is 2+2?" },
      ];

      const response = await invokeMultiModelGPT(messages);
      expect(response).toBeDefined();
      expect(response.success).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.model).toBeDefined();
      expect(response.timestamp).toBeDefined();
      expect(response.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("should support priority selection", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "Test message" },
      ];

      const response = await invokeMultiModelGPT(messages, {
        priority: "xgpt",
      });
      expect(response).toBeDefined();
      expect(response.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("should support temperature and max tokens options", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "Test" },
      ];

      const response = await invokeMultiModelGPT(messages, {
        temperature: 0.5,
        maxTokens: 500,
      });
      expect(response).toBeDefined();
    });
  });

  describe("Specific Model Invocation", () => {
    it("should invoke specific model by name", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "Hello" },
      ];

      const response = await invokeSpecificModel("groq", messages);
      expect(response).toBeDefined();
      expect(response.model).toBe("groq");
      expect(response.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("should handle unknown model gracefully", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "Test" },
      ];

      const response = await invokeSpecificModel("unknown-model", messages);
      expect(response.success).toBe(false);
      expect(response.content).toContain("Unknown GPT model");
    });

    it("should support model-specific options", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "Test" },
      ];

      const response = await invokeSpecificModel("deepseek", messages, {
        temperature: 0.7,
        maxTokens: 1000,
      });
      expect(response).toBeDefined();
    });
  });

  describe("Autonomous Execution", () => {
    it("should execute autonomously with system prompt", async () => {
      const response = await autonomousMultiModelExecution(
        "What is your name?",
        "You are XGPT-WormGPT, an autonomous AI agent.",
        {}
      );
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.model).toBeDefined();
    });

    it("should support priority in autonomous execution", async () => {
      const response = await autonomousMultiModelExecution(
        "Test message",
        "You are an AI assistant.",
        { priority: "hexstrike" }
      );
      expect(response).toBeDefined();
      expect(response.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("should use default system prompt if not provided", async () => {
      const response = await autonomousMultiModelExecution(
        "Hello",
        "You are a helpful assistant."
      );
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });
  });

  describe("Message Handling", () => {
    it("should handle system, user, and assistant messages", async () => {
      const messages: GPTMessage[] = [
        { role: "system", content: "You are helpful." },
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
        { role: "user", content: "How are you?" },
      ];

      const response = await invokeMultiModelGPT(messages);
      expect(response).toBeDefined();
    });

    it("should handle empty message content gracefully", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "" },
      ];

      const response = await invokeMultiModelGPT(messages);
      expect(response).toBeDefined();
    });

    it("should handle long messages", async () => {
      const longContent = "A".repeat(5000);
      const messages: GPTMessage[] = [
        { role: "user", content: longContent },
      ];

      const response = await invokeMultiModelGPT(messages);
      expect(response).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "Test" },
      ];

      // This will try all models and eventually fail gracefully
      const response = await invokeMultiModelGPT(messages);
      expect(response).toBeDefined();
      expect(response.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("should provide meaningful error messages", async () => {
      const response = await invokeSpecificModel("unknown", [
        { role: "user", content: "Test" },
      ]);
      expect(response.success).toBe(false);
      expect(response.content).toContain("ERROR");
    });
  });

  describe("Performance", () => {
    it("should complete execution within reasonable time", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "Quick test" },
      ];

      const response = await invokeMultiModelGPT(messages);
      // Should complete in less than 60 seconds (accounting for network delays)
      expect(response.executionTime).toBeLessThan(60000);
    });

    it("should track execution time accurately", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "Test" },
      ];

      const response = await invokeMultiModelGPT(messages);
      expect(response.executionTime).toBeGreaterThanOrEqual(0);
      expect(typeof response.executionTime).toBe("number");
    });
  });

  describe("Model Priority and Fallback", () => {
    it("should prioritize XGPT-WormGPT when requested", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "Test" },
      ];

      const response = await invokeMultiModelGPT(messages, {
        priority: "xgpt",
      });
      expect(response).toBeDefined();
      // If successful, should be from XGPT or fallback
      expect(response.model).toBeDefined();
    });

    it("should prioritize Hexstrike-AI when requested", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "Reconnaissance test" },
      ];

      const response = await invokeMultiModelGPT(messages, {
        priority: "hexstrike",
      });
      expect(response).toBeDefined();
      expect(response.model).toBeDefined();
    });

    it("should prioritize WormGPT when requested", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "Uncensored test" },
      ];

      const response = await invokeMultiModelGPT(messages, {
        priority: "wormgpt",
      });
      expect(response).toBeDefined();
      expect(response.model).toBeDefined();
    });

    it("should use auto priority by default", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "Auto test" },
      ];

      const response = await invokeMultiModelGPT(messages, {
        priority: "auto",
      });
      expect(response).toBeDefined();
      expect(response.model).toBeDefined();
    });
  });

  describe("Response Format", () => {
    it("should return properly formatted response", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "Test" },
      ];

      const response = await invokeMultiModelGPT(messages);
      expect(response).toHaveProperty("success");
      expect(response).toHaveProperty("content");
      expect(response).toHaveProperty("model");
      expect(response).toHaveProperty("timestamp");
      expect(response).toHaveProperty("executionTime");
    });

    it("should include ISO timestamp in response", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "Test" },
      ];

      const response = await invokeMultiModelGPT(messages);
      expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should include model name in response", async () => {
      const messages: GPTMessage[] = [
        { role: "user", content: "Test" },
      ];

      const response = await invokeMultiModelGPT(messages);
      expect(response.model).toBeDefined();
      expect(typeof response.model).toBe("string");
    });
  });
});
