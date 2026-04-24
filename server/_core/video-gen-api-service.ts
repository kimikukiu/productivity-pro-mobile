/**
 * Video Generation API Service
 * Supports multiple video generation providers: Seedance, Wan AI, Runway, Pika
 * Phase 19 implementation - WHOAMI Sec Pro Mobile
 */

interface VideoGenRequest {
  prompt: string;
  negativePrompt?: string;
  duration?: number; // seconds
  width?: number;
  height?: number;
  fps?: number;
  seed?: number;
  style?: 'realistic' | 'animated' | 'cyberpunk' | 'fantasy';
  provider?: 'seedance' | 'wan' | 'runway' | 'pika' | 'auto';
  // Provider-specific options
  seedanceOptions?: {
    model?: 'seedance-v1' | 'seedance-v2';
    motionStrength?: number;
  };
  wanOptions?: {
    model?: 'wan-1.0' | 'wan-2.0';
    guidanceScale?: number;
  };
}

interface VideoGenResponse {
  success: boolean;
  videoUrl?: string;
  videoBase64?: string;
  thumbnailUrl?: string;
  duration?: number;
  provider: string;
  jobId?: string; // For async providers
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  metadata?: {
    width?: number;
    height?: number;
    fps?: number;
    frameCount?: number;
  };
}

export class VideoGenService {
  private providers = {
    seedance: 'https://api.seedance.ai/v1/generate',
    wan: 'https://api.wan-ai.com/v1/video/generate',
    runway: 'https://api.runwayml.com/v1/gen2/video',
    pika: 'https://api.pika.art/v1/video',
  };

  /**
   * Generate video using Seedance API
   * Known for high-quality, realistic video generation
   */
  async generateWithSeedance(
    request: VideoGenRequest,
    apiKey: string
  ): Promise<VideoGenResponse> {
    try {
      const response = await fetch(this.providers.seedance, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          negative_prompt: request.negativePrompt,
          duration: request.duration || 5,
          width: request.width || 1920,
          height: request.height || 1080,
          fps: request.fps || 30,
          seed: request.seed,
          model: request.seedanceOptions?.model || 'seedance-v2',
          motion_strength: request.seedanceOptions?.motionStrength || 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `Seedance API error: ${error}`,
          provider: 'seedance',
        };
      }

      const data = await response.json();
      
      // Seedance may return async job
      if (data.job_id) {
        return {
          success: true,
          jobId: data.job_id,
          status: 'processing',
          provider: 'seedance',
        };
      }

      return {
        success: true,
        videoUrl: data.video_url,
        thumbnailUrl: data.thumbnail_url,
        duration: data.duration,
        provider: 'seedance',
        metadata: {
          width: data.width,
          height: data.height,
          fps: data.fps,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: 'seedance',
      };
    }
  }

  /**
   * Generate video using Wan AI
   * Chinese video generation model with good motion consistency
   */
  async generateWithWan(
    request: VideoGenRequest,
    apiKey: string
  ): Promise<VideoGenResponse> {
    try {
      const response = await fetch(this.providers.wan, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          negative_prompt: request.negativePrompt,
          num_frames: (request.duration || 5) * (request.fps || 16), // Wan uses frame count
          width: request.width || 1920,
          height: request.height || 1080,
          fps: request.fps || 16,
          seed: request.seed,
          model: request.wanOptions?.model || 'wan-2.0',
          guidance_scale: request.wanOptions?.guidanceScale || 7.5,
          style: request.style,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `Wan AI API error: ${error}`,
          provider: 'wan',
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        videoUrl: data.video_url || data.output?.video,
        thumbnailUrl: data.thumbnail_url,
        duration: data.duration || request.duration,
        provider: 'wan',
        metadata: {
          width: data.width || request.width,
          height: data.height || request.height,
          fps: data.fps || request.fps,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: 'wan',
      };
    }
  }

  /**
   * Generate video using Runway Gen-2
   * High-quality creative video generation
   */
  async generateWithRunway(
    request: VideoGenRequest,
    apiKey: string
  ): Promise<VideoGenResponse> {
    try {
      const response = await fetch(this.providers.runway, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          negative_prompt: request.negativePrompt,
          duration: request.duration || 4,
          ratio: `${request.width || 1920}:${request.height || 1080}`,
          seed: request.seed,
          style: request.style || 'realistic',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `Runway API error: ${error}`,
          provider: 'runway',
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        videoUrl: data.video?.url,
        thumbnailUrl: data.video?.thumbnail_url,
        duration: data.video?.duration,
        provider: 'runway',
        metadata: data.video?.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: 'runway',
      };
    }
  }

  /**
   * Generate video using Pika Art
   * Fast video generation with good stylization
   */
  async generateWithPika(
    request: VideoGenRequest,
    apiKey: string
  ): Promise<VideoGenResponse> {
    try {
      const response = await fetch(this.providers.pika, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          negative_prompt: request.negativePrompt,
          duration: request.duration || 3,
          width: request.width || 1024,
          height: request.height || 576,
          fps: request.fps || 24,
          seed: request.seed,
          style: request.style,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `Pika API error: ${error}`,
          provider: 'pika',
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        videoUrl: data.video_url,
        thumbnailUrl: data.thumbnail_url,
        duration: data.duration,
        provider: 'pika',
        metadata: {
          width: data.width,
          height: data.height,
          fps: data.fps,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: 'pika',
      };
    }
  }

  /**
   * Main generation method - tries providers in order
   */
  async generateVideo(request: VideoGenRequest): Promise<VideoGenResponse> {
    const apiKeys = this.getApiKeys();
    const provider = request.provider || 'auto';

    // Try specific provider or auto-select
    if (provider === 'seedance' || (provider === 'auto' && apiKeys.seedance)) {
      const result = await this.generateWithSeedance(request, apiKeys.seedance!);
      if (result.success) return result;
    }

    if (provider === 'wan' || (provider === 'auto' && apiKeys.wan)) {
      const result = await this.generateWithWan(request, apiKeys.wan!);
      if (result.success) return result;
    }

    if (provider === 'runway' || (provider === 'auto' && apiKeys.runway)) {
      const result = await this.generateWithRunway(request, apiKeys.runway!);
      if (result.success) return result;
    }

    if (provider === 'pika' || provider === 'auto') {
      const result = await this.generateWithPika(request, apiKeys.pika!);
      if (result.success) return result;
    }

    return {
      success: false,
      error: 'No configured video generation provider available',
      provider: 'none',
    };
  }

  /**
   * Check status of async video generation job
   */
  async checkJobStatus(
    jobId: string,
    provider: string,
    apiKey: string
  ): Promise<VideoGenResponse> {
    try {
      let statusUrl = '';
      if (provider === 'seedance') {
        statusUrl = `https://api.seedance.ai/v1/jobs/${jobId}`;
      } else {
        throw new Error(`Status check not supported for provider: ${provider}`);
      }

      const response = await fetch(statusUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${await response.text()}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        jobId,
        status: data.status,
        videoUrl: data.video_url,
        thumbnailUrl: data.thumbnail_url,
        provider,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider,
      };
    }
  }

  private getApiKeys(): Record<string, string | undefined> {
    return {
      seedance: process.env.SEEDANCE_API_KEY,
      wan: process.env.WAN_AI_API_KEY,
      runway: process.env.RUNWAY_API_KEY,
      pika: process.env.PIKA_API_KEY,
    };
  }
}

export const videoGenService = new VideoGenService();
