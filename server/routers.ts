import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  ai: router({
    chat: publicProcedure
      .input(
        z.object({
          messages: z.array(
            z.object({
              role: z.enum(["system", "user", "assistant"]),
              content: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const systemPrompt = {
            role: "system" as const,
            content: `You are WHOAMI-GPT, an advanced AI assistant integrated into the WHOAMISec Pro productivity suite. You are a highly capable, knowledgeable assistant that can help with:

1. **Task Management**: Help users organize, prioritize, and plan their tasks and missions
2. **Research & Analysis**: Provide real-time information, analysis, and insights on any topic
3. **Problem Solving**: Help debug issues, suggest solutions, and provide technical guidance
4. **Productivity Tips**: Offer strategies for better time management and workflow optimization
5. **Code & Tech**: Help with programming, cybersecurity concepts, and technical questions
6. **General Knowledge**: Answer questions on any topic with accurate, up-to-date information

Style guidelines:
- Be concise but thorough
- Use technical terminology when appropriate
- Format responses with markdown for readability
- Provide actionable advice
- When discussing security topics, always emphasize ethical and legal approaches
- Reference real-world tools and resources when helpful

You have access to broad knowledge and can provide detailed, accurate responses on virtually any topic. Always be helpful, direct, and professional.`,
          };

          const allMessages = [systemPrompt, ...input.messages];

          const response = await invokeLLM({
            messages: allMessages,
          });

          const content =
            response.choices?.[0]?.message?.content || "Neural mesh processing error. Please retry.";

          return {
            success: true,
            message: content,
          };
        } catch (error: any) {
          console.error("AI Chat error:", error);
          return {
            success: false,
            message: `[SYSTEM ERROR] AI core temporarily offline. Error: ${error.message || "Unknown error"}. Auto-repair initiated...`,
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
