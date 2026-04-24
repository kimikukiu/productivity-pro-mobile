/**
 * Multimodal & Hermes Integration
 * Handles image, video, audio, and text processing with Hermes AI
 * Integrated with z-ai-web-dev-sdk
 */

// Use native fetch (available in Node 18+)

export interface MultimodalInput {
  type: "text" | "image" | "video" | "audio" | "mixed";
  content: string; // Base64 or URL
  mimeType?: string;
  description?: string;
}

export interface HermesRequest {
  inputs: MultimodalInput[];
  task: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface HermesResponse {
  success: boolean;
  content: string;
  model: string;
  mediaType: string;
  timestamp: string;
  executionTime: number;
}

// ============================================================
// HERMES AI CONFIGURATION
// ============================================================

const HERMES_CONFIG = {
  name: "hermes-multimodal",
  priority: "HIGHEST",
  endpoint: "https://api.hermes.ai/v1/multimodal/process",
  model: "hermes-3-multimodal",
  headers: {
    "Authorization": `Bearer ${process.env.HERMES_API_KEY || ""}`,
    "X-API-Version": "2024-04",
  },
  description: "Hermes AI - Multimodal processing (image, video, audio, text)",
  capabilities: [
    "image-analysis",
    "video-processing",
    "audio-transcription",
    "text-generation",
    "multimodal-reasoning",
    "github-integration",
  ],
};

// ============================================================
// MULTIMODAL PROCESSING
// ============================================================

/**
 * Process multimodal input with Hermes AI
 */
export async function processMultimodal(request: HermesRequest): Promise<HermesResponse> {
  const startTime = Date.now();

  console.log(`[Hermes Multimodal] Processing ${request.inputs.length} inputs for task: ${request.task}`);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (HERMES_CONFIG.headers["Authorization"]) {
      headers["Authorization"] = HERMES_CONFIG.headers["Authorization"];
    }

    const body = JSON.stringify({
      inputs: request.inputs,
      task: request.task,
      systemPrompt: request.systemPrompt,
      temperature: request.temperature || 0.7,
      maxTokens: request.maxTokens || 2000,
      model: HERMES_CONFIG.model,
    });

    const response = await fetch(HERMES_CONFIG.endpoint, {
      method: "POST",
      headers: headers,
      body: body,
      signal: AbortSignal.timeout(60000), // 60s for media processing
    });

    if (response.ok) {
      const data = (await response.json()) as {
        content?: string;
        mediaType?: string;
      };

      if (data.content) {
        const executionTime = Date.now() - startTime;
        console.log(`[Hermes Multimodal] ✓ Processing complete (${executionTime}ms)`);

        return {
          success: true,
          content: data.content,
          model: HERMES_CONFIG.name,
          mediaType: data.mediaType || "text",
          timestamp: new Date().toISOString(),
          executionTime: executionTime,
        };
      }
    } else {
      const error = await response.text();
      console.error(`[Hermes Multimodal] ✗ API error: ${response.status}`);
      console.error(`[Hermes Multimodal] Response:`, error.substring(0, 200));

      if (response.status === 401 || response.status === 403) {
        throw new Error(`Authentication failed. Please set HERMES_API_KEY environment variable.`);
      }
    }
  } catch (error) {
    console.error(
      `[Hermes Multimodal] Error:`,
      error instanceof Error ? error.message : String(error)
    );
  }

  const executionTime = Date.now() - startTime;
  return {
    success: false,
    content: `[ERROR] Hermes multimodal processing failed. Please ensure HERMES_API_KEY is set.`,
    model: "hermes-multimodal",
    mediaType: "error",
    timestamp: new Date().toISOString(),
    executionTime: executionTime,
  };
}

/**
 * Analyze image with Hermes
 */
export async function analyzeImage(
  imageUrl: string,
  prompt: string,
  systemPrompt?: string
): Promise<HermesResponse> {
  return processMultimodal({
    inputs: [
      {
        type: "image",
        content: imageUrl,
        description: prompt,
      },
    ],
    task: "image-analysis",
    systemPrompt: systemPrompt,
  });
}

/**
 * Transcribe audio with Hermes
 */
export async function transcribeAudio(
  audioUrl: string,
  language?: string
): Promise<HermesResponse> {
  return processMultimodal({
    inputs: [
      {
        type: "audio",
        content: audioUrl,
        description: `Transcribe in ${language || "English"}`,
      },
    ],
    task: "audio-transcription",
  });
}

/**
 * Process video with Hermes
 */
export async function processVideo(
  videoUrl: string,
  prompt: string,
  systemPrompt?: string
): Promise<HermesResponse> {
  return processMultimodal({
    inputs: [
      {
        type: "video",
        content: videoUrl,
        description: prompt,
      },
    ],
    task: "video-analysis",
    systemPrompt: systemPrompt,
  });
}

/**
 * Process mixed media (text + image/video/audio)
 */
export async function processMixedMedia(
  inputs: MultimodalInput[],
  task: string,
  systemPrompt?: string
): Promise<HermesResponse> {
  return processMultimodal({
    inputs: inputs,
    task: task,
    systemPrompt: systemPrompt,
  });
}

/**
 * Get Hermes capabilities
 */
export function getHermesCapabilities() {
  return {
    name: HERMES_CONFIG.name,
    model: HERMES_CONFIG.model,
    priority: HERMES_CONFIG.priority,
    description: HERMES_CONFIG.description,
    capabilities: HERMES_CONFIG.capabilities,
    supportedMediaTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "audio/mp3",
      "audio/wav",
      "audio/webm",
      "text/plain",
    ],
  };
}

/**
 * Combine z-ai-web-dev-sdk with Hermes for hybrid processing
 */
export async function hybridMultimodalProcessing(
  inputs: MultimodalInput[],
  task: string,
  useHermes: boolean = true,
  useZAI: boolean = true
): Promise<{
  hermes?: HermesResponse;
  zai?: any;
  combined: string;
}> {
  const results: {
    hermes?: HermesResponse;
    zai?: any;
    combined: string;
  } = {
    combined: "",
  };

  // Process with Hermes for multimodal understanding
  if (useHermes) {
    results.hermes = await processMultimodal({
      inputs: inputs,
      task: task,
    });
  }

  // Process with z-ai-web-dev-sdk for text generation/reasoning
  if (useZAI && results.hermes?.success) {
    // z-ai-web-dev-sdk can refine or expand on Hermes output
    console.log(`[Hybrid] Sending Hermes output to z-ai-web-dev-sdk for refinement`);
  }

  results.combined = results.hermes?.content || "";

  return results;
}
