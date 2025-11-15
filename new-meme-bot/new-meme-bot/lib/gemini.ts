import { GoogleGenerativeAI, GenerateContentRequest, GenerateContentResult } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

/**
 * Retry configuration
 */
const MAX_RETRIES = 5;
const INITIAL_DELAY = 1000; // 1 second
const MAX_DELAY = 60000; // 60 seconds

/**
 * Sleep utility for delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate content with automatic retry on rate limits
 */
export async function generateWithRetry(
  modelName: string,
  request: {
    contents: string | any[];
    config?: any;
  }
): Promise<GenerateContentResult> {
  const model = genAI.getGenerativeModel({ model: modelName });
  let delay = INITIAL_DELAY;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent({
        contents: typeof request.contents === 'string'
          ? [{ role: 'user', parts: [{ text: request.contents }] }]
          : request.contents,
        generationConfig: request.config,
      });

      return result;
    } catch (error: any) {
      const isRateLimitError =
        error?.status === 429 ||
        error?.message?.includes('429') ||
        error?.message?.includes('RESOURCE_EXHAUSTED');

      const isServerError =
        error?.status === 503 ||
        error?.message?.includes('503') ||
        error?.message?.includes('ServiceUnavailable');

      if ((isRateLimitError || isServerError) && attempt < MAX_RETRIES - 1) {
        console.log(`Retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms due to: ${error.message}`);
        await sleep(delay);
        delay = Math.min(delay * 2, MAX_DELAY); // Exponential backoff
      } else {
        throw error;
      }
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Get Gemini 2.5 Flash model for JSON generation
 */
export function getGeminiFlash() {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

/**
 * Get Gemini 2.5 Flash Image model (Nano Banana) for image generation
 */
export function getNanoBanana() {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });
}

/**
 * Strip markdown code blocks from content
 */
function stripMarkdownCodeBlocks(content: string): string {
  // Remove markdown code blocks (```json ... ``` or ``` ... ```)
  const codeBlockPattern = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
  const match = content.trim().match(codeBlockPattern);

  if (match) {
    return match[1].trim();
  }

  return content.trim();
}

/**
 * Generate structured JSON with Gemini 2.5 Flash
 */
export async function generateStructuredJSON<T>(
  prompt: string,
  schema: any
): Promise<T> {
  const result = await generateWithRetry('gemini-2.5-flash', {
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  });

  const response = await result.response;
  const text = response.text();
  const cleanedText = stripMarkdownCodeBlocks(text);

  try {
    return JSON.parse(cleanedText) as T;
  } catch (error: any) {
    console.error('Failed to parse JSON response:', {
      originalText: text,
      cleanedText,
      error: error.message,
    });
    throw new Error(`Failed to parse JSON response: ${error.message}`);
  }
}

/**
 * Generate image with Gemini image generation models
 * Tries multiple models in order of preference
 */
export async function generateImage(
  prompt: string,
  aspectRatio: '1:1' | '16:9' | '4:3' | '9:16' | '3:4' = '1:1'
): Promise<string> {
  // Try models in order of preference
  const modelsToTry = [
    'gemini-2.0-flash-exp-image-generation',
    'gemini-2.0-flash-preview-image-generation',
    'gemini-2.5-flash-image',
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying image generation with model: ${modelName}`);
      const result = await generateWithRetry(modelName, {
        contents: prompt,
        config: {
          responseModalities: ['Image'],
          imageConfig: {
            aspectRatio,
          },
        },
      });

      const response = await result.response;

      // Extract base64 image data
      for (const candidate of response.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if ((part as any).inlineData) {
            const imageData = (part as any).inlineData.data;
            console.log(`✓ Successfully generated image with ${modelName}`);
            return `data:image/png;base64,${imageData}`;
          }
        }
      }
    } catch (error: any) {
      console.log(`✗ ${modelName} failed: ${error.message}`);
      lastError = error;
      // Continue to next model
    }
  }

  // If all models failed, throw the last error
  throw lastError || new Error('All image generation models failed');
}
