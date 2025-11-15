import { z } from 'zod';

/**
 * Schema for caption configuration
 */
export const captionSchema = z.object({
  text: z.string().describe('The caption text to display on the meme'),
  position: z.enum(['top', 'bottom', 'center']).describe('Where to place the text on the meme'),
});

/**
 * Schema for meme prompt structure (what Gemini generates)
 */
export const memePromptSchema = z.object({
  sceneDescription: z.string().describe('Detailed visual description of the meme image scene, including characters, expressions, background, and composition'),
  style: z.string().describe('Visual style of the meme (e.g., "classic meme format", "photorealistic", "cartoon style", "minimalist")'),
  mood: z.string().describe('Overall mood or emotion of the meme (e.g., "humorous", "sarcastic", "wholesome", "surprised")'),
  captions: z.array(captionSchema).describe('Text captions to overlay on the meme image'),
  aspectRatio: z.enum(['1:1', '16:9', '4:3', '9:16', '3:4']).default('1:1').describe('Aspect ratio for the generated image'),
});

export type CaptionInput = z.infer<typeof captionSchema>;
export type MemePrompt = z.infer<typeof memePromptSchema>;

/**
 * Convert Zod schema to JSON Schema format for Gemini API
 */
export function zodToJsonSchema(zodSchema: z.ZodType<any>): any {
  // For the memePromptSchema
  return {
    type: 'object',
    properties: {
      sceneDescription: {
        type: 'string',
        description: 'Detailed visual description of the meme image scene, including characters, expressions, background, and composition',
      },
      style: {
        type: 'string',
        description: 'Visual style of the meme (e.g., "classic meme format", "photorealistic", "cartoon style", "minimalist")',
      },
      mood: {
        type: 'string',
        description: 'Overall mood or emotion of the meme (e.g., "humorous", "sarcastic", "wholesome", "surprised")',
      },
      captions: {
        type: 'array',
        description: 'Text captions to overlay on the meme image',
        items: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'The caption text to display on the meme',
            },
            position: {
              type: 'string',
              enum: ['top', 'bottom', 'center'],
              description: 'Where to place the text on the meme',
            },
          },
          required: ['text', 'position'],
        },
      },
      aspectRatio: {
        type: 'string',
        enum: ['1:1', '16:9', '4:3', '9:16', '3:4'],
        description: 'Aspect ratio for the generated image',
        default: '1:1',
      },
    },
    required: ['sceneDescription', 'style', 'mood', 'captions', 'aspectRatio'],
  };
}
