import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import { invokeLLM } from "./llm";
import { generateDynamicSystemPrompt } from "./real-training-loader";

const SYSTEM_PROMPT = generateDynamicSystemPrompt();

const AGENT_ROLES: Record<string, string> = {
  "orchestrator": "You are the ORCHESTRATOR - coordinate complex multi-step operations",
  "researcher": "You are the RESEARCHER - deep web research, OSINT, data collection",
  "coder": "You are the CODER - full-stack development, debugging, deployment",
  "security": "You are the SECURITY agent - vulnerability assessment, pen testing, incident response",
  "solana": "You are the SOLANA agent - blockchain analysis, smart contracts, DeFi",
};

export const chatRouter = router({
  chat: publicProcedure
    .input(z.any())
    .mutation(async ({ input }) => {
      try {
        // Parse input flexibly - handle multiple formats
        let messages: any[] = [];
        let agentRole: string | undefined;
        let model: string | undefined;
        let sessionId: string | undefined;

        // Handle different input formats
        let parsedInput = input;
        
        // If input is wrapped in { json: {...} } (from client fetch)
        if (input && input.json && typeof input.json === "object") {
          parsedInput = input.json;
        }
        
        // Now parse the actual content
        if (parsedInput) {
          if (Array.isArray(parsedInput.messages)) {
            messages = parsedInput.messages;
          } else if (Array.isArray(parsedInput)) {
            messages = parsedInput;
          } else if (parsedInput.message) {
            // Single message format
            messages = [{ role: "user", content: parsedInput.message }];
          }
          
          agentRole = parsedInput.agentRole;
          model = parsedInput.model;
          sessionId = parsedInput.sessionId;
        }

        // Validate messages
        if (!Array.isArray(messages) || messages.length === 0) {
          return {
            success: false,
            message: "Error: No messages provided",
            error: "Empty or invalid messages array",
            timestamp: new Date().toISOString(),
          };
        }

        // Build system prompt
        let systemPrompt = SYSTEM_PROMPT;
        if (agentRole && AGENT_ROLES[agentRole]) {
          systemPrompt += `\n\n## ACTIVE AGENT ROLE\n${AGENT_ROLES[agentRole]}`;
        }
        if (model) {
          systemPrompt += `\n\n## ACTIVE MODEL: ${model.toUpperCase()}`;
        }

        // Prepare messages for LLM
        const allMessages = [
          { role: "system" as const, content: systemPrompt },
          ...messages.map((msg: any) => ({
            role: msg.role || "user",
            content: msg.content || JSON.stringify(msg),
          })),
        ];

        console.log(`[Chat] Invoking LLM with ${messages.length} messages...`);
        const response = await invokeLLM({
          messages: allMessages,
          model,
        });
        console.log(`[Chat] LLM response received from model: ${response.model}`);
        
        const content = response.choices?.[0]?.message?.content || "[ERROR] No response from Quantum Intelligence Ultra";
        
        // Return in tRPC format that the client expects
        return {
          result: {
            data: {
              json: {
                reply: content,
                message: content,
                success: true,
                model: response.model,
                timestamp: new Date().toISOString(),
              }
            }
          }
        };
      } catch (error: any) {
        console.error("[Chat] Error:", error.message);
        return {
          success: false,
          message: `Error: ${error.message}`,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    }),

  health: publicProcedure.query(async () => {
    return {
      status: "healthy",
      availableModels: ["ollama-local", "deepseek-free", "groq-free", "together-ai"],
      primaryModel: "ollama-local",
      timestamp: new Date().toISOString(),
    };
  }),
});
