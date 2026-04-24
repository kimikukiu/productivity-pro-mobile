/**
 * Speech-to-Text API Service
 * Supports multiple STT providers: OpenAI Whisper, Deepgram, AssemblyAI
 * Phase 19 implementation - WHOAMI Sec Pro Mobile
 */

interface STTRequest {
  audioUrl?: string;
  audioBase64?: string;
  language?: string;
  model?: 'whisper-1' | 'nova-2' | 'best';
  apiKey?: string;
}

interface STTResponse {
  success: boolean;
  text?: string;
  confidence?: number;
  words?: Array<{ word: string; start: number; end: number }>;
  error?: string;
  provider: string;
}

export class STTService {
  private providers = {
    openai: 'https://api.openai.com/v1/audio/transcriptions',
    deepgram: 'https://api.deepgram.com/v1/listen',
    assemblyai: 'https://api.assemblyai.com/v2/transcript',
  };

  /**
   * Transcribe audio using OpenAI Whisper API
   */
  async transcribeWithWhisper(request: STTRequest, apiKey: string): Promise<STTResponse> {
    try {
      const formData = new FormData();
      
      if (request.audioUrl) {
        // Download audio first or pass URL
        formData.append('url', request.audioUrl);
      } else if (request.audioBase64) {
        // Convert base64 to blob
        const audioBlob = this.base64ToBlob(request.audioBase64);
        formData.append('file', audioBlob, 'audio.mp3');
      }
      
      formData.append('model', request.model || 'whisper-1');
      if (request.language) {
        formData.append('language', request.language);
      }

      const response = await fetch(this.providers.openai, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `Whisper API error: ${error}`,
          provider: 'openai-whisper',
        };
      }

      const data = await response.json();
      return {
        success: true,
        text: data.text,
        provider: 'openai-whisper',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: 'openai-whisper',
      };
    }
  }

  /**
   * Transcribe using Deepgram API
   */
  async transcribeWithDeepgram(request: STTRequest, apiKey: string): Promise<STTResponse> {
    try {
      const headers: Record<string, string> = {
        'Authorization': `Token ${apiKey}`,
      };

      let body: BodyInit;
      if (request.audioUrl) {
        // Deepgram can process URLs directly
        const url = new URL(this.providers.deepgram);
        url.searchParams.set('url', request.audioUrl);
        url.searchParams.set('model', request.model || 'nova-2');
        if (request.language) {
          url.searchParams.set('language', request.language);
        }

        const response = await fetch(url.toString(), { headers });
        body = await response.json();
      } else if (request.audioBase64) {
        const audioBlob = this.base64ToBlob(request.audioBase64);
        const response = await fetch(this.providers.deepgram, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'audio/mpeg',
          },
          body: audioBlob,
        });
        body = await response.json();
      } else {
        throw new Error('No audio provided');
      }

      const data = body as any;
      return {
        success: true,
        text: data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '',
        confidence: data.results?.channels?.[0]?.alternatives?.[0]?.confidence,
        words: data.results?.channels?.[0]?.alternatives?.[0]?.words,
        provider: 'deepgram',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: 'deepgram',
      };
    }
  }

  /**
   * Transcribe using AssemblyAI
   */
  async transcribeWithAssemblyAI(request: STTRequest, apiKey: string): Promise<STTResponse> {
    try {
      // Step 1: Submit transcription job
      const submitResponse = await fetch(this.providers.assemblyai, {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: request.audioUrl,
          language_code: request.language || 'en',
        }),
      });

      if (!submitResponse.ok) {
        throw new Error(`AssemblyAI submit error: ${await submitResponse.text()}`);
      }

      const { id } = await submitResponse.json();

      // Step 2: Poll for completion
      let transcription;
      for (let i = 0; i < 30; i++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        
        const statusResponse = await fetch(`${this.providers.assemblyai}/${id}`, {
          headers: { 'Authorization': apiKey },
        });
        const status = await statusResponse.json();
        
        if (status.status === 'completed') {
          transcription = status;
          break;
        } else if (status.status === 'error') {
          throw new Error(`AssemblyAI error: ${status.error}`);
        }
      }

      return {
        success: true,
        text: transcription?.text || '',
        confidence: transcription?.confidence,
        provider: 'assemblyai',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: 'assemblyai',
      };
    }
  }

  /**
   * Main transcribe method - tries providers in order
   */
  async transcribe(request: STTRequest): Promise<STTResponse> {
    const apiKeys = this.getApiKeys();
    
    // Try Whisper first
    if (apiKeys.openai) {
      const result = await this.transcribeWithWhisper(request, apiKeys.openai);
      if (result.success) return result;
    }

    // Try Deepgram
    if (apiKeys.deepgram) {
      const result = await this.transcribeWithDeepgram(request, apiKeys.deepgram);
      if (result.success) return result;
    }

    // Try AssemblyAI
    if (apiKeys.assemblyai) {
      const result = await this.transcribeWithAssemblyAI(request, apiKeys.assemblyai);
      if (result.success) return result;
    }

    return {
      success: false,
      error: 'No configured STT provider available or all providers failed',
      provider: 'none',
    };
  }

  private getApiKeys(): Record<string, string | undefined> {
    // Get API keys from environment or storage
    return {
      openai: process.env.OPENAI_API_KEY,
      deepgram: process.env.DEEPGRAM_API_KEY,
      assemblyai: process.env.ASSEMBLYAI_API_KEY,
    };
  }

  private base64ToBlob(base64: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'audio/mpeg' });
  }
}

export const sttService = new STTService();
