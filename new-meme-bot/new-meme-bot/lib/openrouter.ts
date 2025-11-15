/**
 * OpenRouter API Client
 *
 * Uses OpenRouter to access Google's Gemini models:
 * - google/gemini-2.5-flash-lite for JSON generation
 * - google/gemini-2.5-flash-image for image generation (Nano Banana)
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const SITE_NAME = process.env.SITE_NAME || 'AI Meme Generator';

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
 * Make request to OpenRouter with retry logic
 */
async function openRouterRequest(
  model: string,
  messages: any[],
  options: any = {}
): Promise<any> {
  let delay = INITIAL_DELAY;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': SITE_URL,
          'X-Title': SITE_NAME,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Check for token limit errors
        const errorMessage = errorData.error?.message || '';
        if (errorMessage.includes('max_tokens') || errorMessage.includes('credits')) {
          throw new Error(
            `Token limit exceeded: ${errorMessage}. Please try again with a simpler request or check your OpenRouter credits.`
          );
        }

        // Check if it's a rate limit or server error
        if (response.status === 429 || response.status === 503) {
          if (attempt < MAX_RETRIES - 1) {
            console.log(`Retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms (Status: ${response.status})`);
            await sleep(delay);
            delay = Math.min(delay * 2, MAX_DELAY);
            continue;
          }
        }

        throw new Error(
          errorData.error?.message ||
          `OpenRouter API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;

    } catch (error: any) {
      if (attempt < MAX_RETRIES - 1 && (
        error.message?.includes('fetch failed') ||
        error.message?.includes('network')
      )) {
        console.log(`Retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms due to: ${error.message}`);
        await sleep(delay);
        delay = Math.min(delay * 2, MAX_DELAY);
      } else {
        throw error;
      }
    }
  }

  throw new Error('Max retries exceeded');
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
 * Generate structured JSON with Gemini 2.5 Flash Lite
 */
export async function generateStructuredJSON<T>(
  prompt: string,
  schema: any
): Promise<T> {
  console.log('Generating JSON with google/gemini-2.5-flash-lite...');

  const response = await openRouterRequest(
    'google/gemini-2.5-flash-lite',
    [
      {
        role: 'user',
        content: prompt,
      },
    ],
    {
      max_tokens: 1500, // Reduced to avoid token limit issues
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'meme_prompt',
          schema: schema,
          strict: true,
        },
      },
    }
  );

  const content = response.choices[0]?.message?.content || '{}';
  const cleanedContent = stripMarkdownCodeBlocks(content);

  try {
    return JSON.parse(cleanedContent) as T;
  } catch (error: any) {
    console.error('Failed to parse JSON response:', {
      originalContent: content,
      cleanedContent,
      error: error.message,
    });
    throw new Error(`Failed to parse JSON response: ${error.message}`);
  }
}

/**
 * Generate image with Gemini 2.5 Flash Image (Nano Banana)
 */
export async function generateImage(
  prompt: string,
  aspectRatio: '1:1' | '16:9' | '4:3' | '9:16' | '3:4' = '1:1'
): Promise<string> {
  console.log('Generating image with google/gemini-2.5-flash-image...');

  // Format the prompt to request image generation
  const imagePrompt = `Generate an image: ${prompt}

Aspect ratio: ${aspectRatio}
Output: Return only the generated image.`;

  const response = await openRouterRequest(
    'google/gemini-2.5-flash-image',
    [
      {
        role: 'user',
        content: imagePrompt,
      },
    ],
    {
      max_tokens: 500,
      modalities: ['text', 'image'],
    }
  );

  // Debug: Log the full response
  console.log('OpenRouter Response:', JSON.stringify(response, null, 2));

  const choice = response.choices[0];
  if (!choice) {
    throw new Error('No response from OpenRouter');
  }

  // Gemini image models return content as an array with parts
  const message = choice.message;
  console.log('Message content:', JSON.stringify(message, null, 2));

  // Try different response formats

  // Format 0: OpenRouter images array format (NEW - most common for Gemini 2.5 Flash Image)
  if (message.images && Array.isArray(message.images)) {
    for (const imageObj of message.images) {
      if (imageObj.type === 'image_url' && imageObj.image_url?.url) {
        console.log('✓ Found image in message.images array');
        return imageObj.image_url.url;
      }
    }
  }

  // Format 1: Content is an array with parts
  if (Array.isArray(message.content)) {
    for (const part of message.content) {
      // Check for inline data (base64)
      if (part.inline_data || part.inlineData) {
        const imageData = part.inline_data?.data || part.inlineData?.data;
        if (imageData) {
          console.log('✓ Found image in inline_data');
          return `data:image/png;base64,${imageData}`;
        }
      }
      // Check for image_url format
      if (part.type === 'image_url' && part.image_url?.url) {
        console.log('✓ Found image URL');
        return part.image_url.url;
      }
    }
  }

  // Format 2: Direct content field with parts
  if (message.parts && Array.isArray(message.parts)) {
    for (const part of message.parts) {
      if (part.inline_data || part.inlineData) {
        const imageData = part.inline_data?.data || part.inlineData?.data;
        if (imageData) {
          console.log('✓ Found image in parts.inline_data');
          return `data:image/png;base64,${imageData}`;
        }
      }
    }
  }

  // Format 3: Content is a string (URL or base64)
  const content = message.content;
  if (typeof content === 'string') {
    console.log(`Content type: string, length: ${content.length}, first 50 chars:`, content.substring(0, 50));

    if (content.startsWith('data:image')) {
      console.log('✓ Found base64 string with prefix');
      return content;
    }
    if (content.startsWith('http')) {
      console.log('✓ Found image URL');
      return content;
    }

    // Check if it's raw base64 data (common with OpenRouter)
    // Base64 strings are typically very long and contain only base64 characters
    const trimmedContent = content.trim();
    if (trimmedContent.length > 100) {
      // Test if the first 100 chars are base64-like (allowing some flexibility)
      const testString = trimmedContent.substring(0, 100);
      const base64Pattern = /^[A-Za-z0-9+\/]+={0,2}$/;

      if (base64Pattern.test(testString)) {
        console.log('✓ Found raw base64 data (pattern match), adding prefix');
        return `data:image/png;base64,${trimmedContent}`;
      }

      // Alternative: Check if it starts with PNG signature in base64 (iVBORw0KGgo)
      if (trimmedContent.startsWith('iVBORw0KGgo')) {
        console.log('✓ Found PNG base64 data (PNG signature), adding prefix');
        return `data:image/png;base64,${trimmedContent}`;
      }

      // Or JPEG signature (/9j/)
      if (trimmedContent.startsWith('/9j/')) {
        console.log('✓ Found JPEG base64 data (JPEG signature), adding prefix');
        return `data:image/jpeg;base64,${trimmedContent}`;
      }
    }
  }

  // If we got here, we couldn't find the image
  console.error('Could not find image in response. Response structure:', {
    hasChoices: !!response.choices,
    hasMessage: !!choice?.message,
    contentType: typeof content,
    isArray: Array.isArray(content),
    hasParts: !!message.parts,
  });

  throw new Error(`No image data found in response. Got: ${typeof content}`);
}

/**
 * Alternative: Generate image with text prompt (fallback method)
 * This uses the standard text completion and explicitly requests image output
 */
export async function generateImageAlt(
  prompt: string,
  aspectRatio: '1:1' | '16:9' | '4:3' | '9:16' | '3:4' = '1:1'
): Promise<string> {
  console.log('Generating image with google/gemini-2.5-flash-image (alternative method)...');

  const response = await openRouterRequest(
    'google/gemini-2.5-flash-image',
    [
      {
        role: 'system',
        content: 'You are an image generation AI. Generate images based on user descriptions. Output modality: Image only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    {
      image_config: {
        aspect_ratio: aspectRatio,
      },
      response_modalities: ['Image'],
    }
  );

  // Extract image from response
  const choice = response.choices[0];

  // Try multiple extraction methods
  if (choice.message?.image) {
    return choice.message.image;
  }

  if (choice.message?.content) {
    const content = choice.message.content;

    if (typeof content === 'string' && content.startsWith('data:image')) {
      return content;
    }

    if (Array.isArray(content)) {
      for (const part of content) {
        if (part.image || part.image_url) {
          return part.image || part.image_url.url;
        }
      }
    }
  }

  throw new Error('Could not extract image from response');
}
