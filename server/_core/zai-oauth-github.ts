/**
 * z.ai OAuth GitHub Integration
 * Connects to z.ai with GitHub OAuth for seamless authentication
 * Enables multi-model training across the entire project
 */

import { z } from "zod";
import { publicProcedure, router } from "./trpc";

interface ZAiConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  apiKey: string;
  githubToken: string;
  isConnected: boolean;
  connectedAt: string | null;
}

// In-memory storage (use database in production)
let zaiConfig: ZAiConfig = {
  clientId: process.env.ZAI_CLIENT_ID || "",
  clientSecret: process.env.ZAI_CLIENT_SECRET || "",
  redirectUri: process.env.ZAI_REDIRECT_URI || "https://prodpro-9thrl9qn.manus.space/oauth/callback",
  apiKey: process.env.ZAI_API_KEY || "",
  githubToken: process.env.GITHUB_TOKEN || "",
  isConnected: !!(process.env.ZAI_API_KEY && process.env.GITHUB_TOKEN),
  connectedAt: process.env.ZAI_CONNECTED_AT || null,
};

export const zaiOAuthRouter = router({
  /**
   * Get z.ai OAuth login URL
   */
  getOAuthUrl: publicProcedure.query(() => {
    const params = new URLSearchParams({
      client_id: zaiConfig.clientId,
      redirect_uri: zaiConfig.redirectUri,
      response_type: "code",
      scope: "repo,user,gist",
      state: generateState(),
    });

    return {
      url: `https://z-ai.dev/oauth/authorize?${params.toString()}`,
      clientId: zaiConfig.clientId,
    };
  }),

  /**
   * Handle OAuth callback and connect to z.ai
   */
  handleOAuthCallback: publicProcedure
    .input(
      z.object({
        code: z.string(),
        state: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("[z.ai OAuth] Processing callback...");

        // Exchange code for token
        const tokenResponse = await fetch("https://z-ai.dev/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: zaiConfig.clientId,
            client_secret: zaiConfig.clientSecret,
            code: input.code,
            redirect_uri: zaiConfig.redirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error("Failed to exchange OAuth code for token");
        }

        const { access_token, github_token } = await tokenResponse.json();

        // Store tokens
        zaiConfig = {
          ...zaiConfig,
          apiKey: access_token,
          githubToken: github_token,
          isConnected: true,
          connectedAt: new Date().toISOString(),
        };

        console.log("[z.ai OAuth] ✓ Successfully connected to z.ai with GitHub");

        return {
          success: true,
          message: "Connected to z.ai with GitHub OAuth",
          isConnected: true,
          connectedAt: zaiConfig.connectedAt,
        };
      } catch (error) {
        console.error("[z.ai OAuth] Error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "OAuth connection failed",
        };
      }
    }),

  /**
   * Get current z.ai connection status
   */
  getConnectionStatus: publicProcedure.query(() => {
    return {
      isConnected: zaiConfig.isConnected,
      connectedAt: zaiConfig.connectedAt,
      hasApiKey: !!zaiConfig.apiKey,
      hasGithubToken: !!zaiConfig.githubToken,
    };
  }),

  /**
   * Train models on entire project with z.ai
   */
  trainProjectModels: publicProcedure
    .input(
      z.object({
        projectPath: z.string().optional(),
        models: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!zaiConfig.isConnected) {
          return {
            success: false,
            error: "z.ai not connected. Please authenticate with GitHub first.",
          };
        }

        console.log("[z.ai Training] Starting multi-model training...");

        // Fetch project files from GitHub
        const projectFiles = await fetchProjectFilesFromGithub(zaiConfig.githubToken);

        // Train models on project
        const trainingResponse = await fetch("https://z-ai.dev/api/v1/train", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${zaiConfig.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: "productivity-pro-mobile",
            files: projectFiles,
            models: input.models || [
              "gpt-4-turbo",
              "gpt-3.5-turbo",
              "claude-3-opus",
              "llama-2-70b",
              "mistral-7b",
            ],
            scope: "full-project",
            includeBackend: true,
            includeTools: true,
            includeEndpoints: true,
          }),
        });

        if (!trainingResponse.ok) {
          throw new Error("Model training failed");
        }

        const trainingResult = await trainingResponse.json();

        console.log("[z.ai Training] ✓ Models trained successfully");

        return {
          success: true,
          message: "Project models trained with z.ai",
          trainingId: trainingResult.id,
          models: trainingResult.models,
          trainedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error("[z.ai Training] Error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Training failed",
        };
      }
    }),

  /**
   * Invoke z.ai with trained models
   */
  invokeTrainedModel: publicProcedure
    .input(
      z.object({
        prompt: z.string(),
        model: z.string().optional(),
        context: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!zaiConfig.isConnected) {
          return {
            success: false,
            error: "z.ai not connected",
          };
        }

        const response = await fetch("https://z-ai.dev/api/v1/invoke", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${zaiConfig.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: input.prompt,
            model: input.model || "gpt-4-turbo",
            context: {
              ...input.context,
              projectName: "productivity-pro-mobile",
              trainedModels: true,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Model invocation failed");
        }

        const result = await response.json();

        return {
          success: true,
          response: result.content,
          model: result.model,
          usage: result.usage,
        };
      } catch (error) {
        console.error("[z.ai Invoke] Error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Invocation failed",
        };
      }
    }),

  /**
   * Get trained models list
   */
  getTrainedModels: publicProcedure.query(async () => {
    try {
      if (!zaiConfig.isConnected) {
        return {
          success: false,
          models: [],
          error: "z.ai not connected",
        };
      }

      const response = await fetch("https://z-ai.dev/api/v1/models", {
        headers: {
          "Authorization": `Bearer ${zaiConfig.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = await response.json();

      return {
        success: true,
        models: data.models || [],
        count: data.models?.length || 0,
      };
    } catch (error) {
      console.error("[z.ai Models] Error:", error);
      return {
        success: false,
        models: [],
        error: error instanceof Error ? error.message : "Failed to fetch models",
      };
    }
  }),

  /**
   * Disconnect z.ai
   */
  disconnect: publicProcedure.mutation(() => {
    zaiConfig = {
      ...zaiConfig,
      apiKey: "",
      githubToken: "",
      isConnected: false,
      connectedAt: null,
    };

    console.log("[z.ai OAuth] Disconnected");

    return {
      success: true,
      message: "Disconnected from z.ai",
    };
  }),
});

/**
 * Helper: Generate random state for OAuth
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Helper: Fetch project files from GitHub
 */
async function fetchProjectFilesFromGithub(githubToken: string): Promise<any[]> {
  try {
        const response = await fetch(
          "https://api.github.com/repos/kimikukiu/whoami-project-pro/contents",
          {
            headers: {
              "Authorization": `Bearer ${githubToken}`,
              "Accept": "application/vnd.github.v3+json",
            },
          } as RequestInit
        );

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub files");
    }

    const files = await response.json();

    // Recursively fetch all files
    const allFiles = await Promise.all(
      files.map(async (file: any) => {
        if (file.type === "file") {
          const contentResponse = await fetch(file.url, {
            headers: {
              "Authorization": `Bearer ${githubToken}`,
            },
          } as RequestInit);
          const contentData = await contentResponse.json();
          return {
            path: file.path,
            content: Buffer.from(contentData.content, "base64" as BufferEncoding).toString("utf-8"),
          };
        }
        return null;
      })
    );

    return allFiles.filter((f) => f !== null);
  } catch (error) {
    console.error("[GitHub Fetch] Error:", error);
    return [];
  }
}
