/**
 * OCR (Optical Character Recognition) API Service
 * Supports Mistral OCR and Amazon Textract
 * Phase 19 implementation - WHOAMI Sec Pro Mobile
 */

interface OCRRequest {
  imageUrl?: string;
  imageBase64?: string;
  language?: string;
  provider?: 'mistral' | 'textract' | 'auto';
  // Textract specific
  region?: string;
  s3Bucket?: string;
  s3Key?: string;
}

interface OCRResponse {
  success: boolean;
  text?: string;
  confidence?: number;
  blocks?: Array<{
    text: string;
    confidence: number;
    boundingBox?: { x: number; y: number; width: number; height: number };
  }>;
  provider: string;
  error?: string;
}

export class OCRService {
  /**
   * Extract text using Mistral OCR API
   * Mistral's OCR is multimodal and supports complex documents
   */
  async extractWithMistral(request: OCRRequest, apiKey: string): Promise<OCRResponse> {
    try {
      let imageData: string;
      
      if (request.imageUrl) {
        // For URL, we need to download or pass URL
        imageData = request.imageUrl;
      } else if (request.imageBase64) {
        imageData = request.imageBase64;
      } else {
        throw new Error('No image provided');
      }

      const response = await fetch('https://api.mistral.ai/v1/ocr', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-ocr-latest',
          document: {
            type: 'image_url',
            image_url: request.imageUrl || `data:image/jpeg;base64,${request.imageBase64}`,
          },
          include_bounding_boxes: true,
          language: request.language || 'en',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `Mistral OCR error: ${error}`,
          provider: 'mistral-ocr',
        };
      }

      const data = await response.json();
      
      // Parse Mistral OCR response
      const blocks = data.pages?.[0]?.blocks?.map((block: any) => ({
        text: block.text || '',
        confidence: block.confidence || 0,
        boundingBox: block.bounding_box,
      })) || [];

      const fullText = blocks.map((b: any) => b.text).join(' ');

      return {
        success: true,
        text: fullText,
        confidence: blocks.length > 0 
          ? blocks.reduce((sum: number, b: any) => sum + b.confidence, 0) / blocks.length 
          : 0,
        blocks,
        provider: 'mistral-ocr',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: 'mistral-ocr',
      };
    }
  }

  /**
   * Extract text using Amazon Textract
   * Supports various document types including forms and tables
   */
  async extractWithTextract(request: OCRRequest): Promise<OCRResponse> {
    try {
      // Textract requires AWS SDK - this is a simplified version
      // In production, use AWS SDK v3
      const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
      const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
      const region = request.region || process.env.AWS_REGION || 'us-east-1';

      if (!awsAccessKey || !awsSecretKey) {
        throw new Error('AWS credentials not configured');
      }

      // For Textract, image should be in S3 or as bytes
      let body: any;
      
      if (request.s3Bucket && request.s3Key) {
        body = {
          S3Object: {
            Bucket: request.s3Bucket,
            Name: request.s3Key,
          },
        };
      } else if (request.imageBase64) {
        // Decode base64 and send as bytes
        const binaryData = Buffer.from(request.imageBase64, 'base64');
        body = {
          Document: {
            Bytes: binaryData.toString('base64'), // AWS expects base64 in Bytes field
          },
        };
      } else if (request.imageUrl) {
        // Download and convert
        const imageResponse = await fetch(request.imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        body = {
          Document: {
            Bytes: Buffer.from(imageBuffer).toString('base64'),
          },
        };
      } else {
        throw new Error('No valid image source provided');
      }

      // This is a simplified call - actual Textract API is more complex
      // Using AWS SDK is recommended
      const response = await fetch(`https://textract.${region}.amazonaws.com`, {
        method: 'POST',
        headers: {
          'X-Amz-Target': 'AmazonTextract.DetectDocumentText',
          'Content-Type': 'application/x-amz-json-1.1',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `Textract error: ${error}`,
          provider: 'aws-textract',
        };
      }

      const data = await response.json();
      
      const blocks = (data.Blocks || [])
        .filter((block: any) => block.BlockType === 'LINE')
        .map((block: any) => ({
          text: block.Text || '',
          confidence: block.Confidence || 0,
          boundingBox: block.Geometry?.BoundingBox,
        }));

      const fullText = blocks.map((b: any) => b.text).join('\n');

      return {
        success: true,
        text: fullText,
        confidence: blocks.length > 0
          ? blocks.reduce((sum: number, b: any) => sum + b.confidence, 0) / blocks.length
          : 0,
        blocks,
        provider: 'aws-textract',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: 'aws-textract',
      };
    }
  }

  /**
   * Main extract method - tries providers in order
   */
  async extractText(request: OCRRequest): Promise<OCRResponse> {
    const provider = request.provider || 'auto';
    const apiKeys = this.getApiKeys();

    if (provider === 'mistral' || (provider === 'auto' && apiKeys.mistral)) {
      const result = await this.extractWithMistral(request, apiKeys.mistral!);
      if (result.success) return result;
    }

    if (provider === 'textract' || provider === 'auto') {
      const result = await this.extractWithTextract(request);
      if (result.success) return result;
    }

    return {
      success: false,
      error: 'No configured OCR provider available or all providers failed',
      provider: 'none',
    };
  }

  /**
   * Extract text from multiple images (batch processing)
   */
  async extractTextBatch(requests: OCRRequest[]): Promise<OCRResponse[]> {
    const results = await Promise.all(
      requests.map((req) => this.extractText(req))
    );
    return results;
  }

  private getApiKeys(): Record<string, string | undefined> {
    return {
      mistral: process.env.MISTRAL_API_KEY,
      awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
}

export const ocrService = new OCRService();
