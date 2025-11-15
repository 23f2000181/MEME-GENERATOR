import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredJSON, generateImage } from '@/lib/openrouter';
import { addTextOverlay } from '@/lib/imageOverlay';
import { MemePrompt, CaptionInput, zodToJsonSchema, memePromptSchema } from '@/lib/schemas';
import { saveMeme } from '@/lib/db';

export const runtime = 'nodejs';

interface AutoMemeRequest {
  idea: string;
  captions?: CaptionInput[];
  useOverlay?: boolean; // true = programmatic overlay, false = AI-only
}

export async function POST(request: NextRequest) {
  try {
    const body: AutoMemeRequest = await request.json();
    const { idea, captions = [], useOverlay = false } = body;

    if (!idea || idea.trim().length === 0) {
      return NextResponse.json(
        { error: 'Meme idea is required' },
        { status: 400 }
      );
    }

    console.log('Auto mode request:', { idea, captions, useOverlay });

    // Step 1: Generate structured meme description with Gemini 2.5 Flash
    const jsonPrompt = `Create a detailed, creative meme description based on this idea: "${idea}"

${captions.length > 0 ? `The user wants these captions included: ${JSON.stringify(captions)}` : 'Generate funny, punchy captions that fit the meme idea.'}

Requirements:
- Scene description should be vivid, detailed, and perfect for image generation
- Choose an appropriate visual style that matches the meme concept
- Capture the right mood/emotion
- Generate ${captions.length > 0 ? captions.length : '2-3'} captions with optimal positioning
- Make it funny and relatable!`;

    console.log('Calling OpenRouter (google/gemini-2.5-flash-lite) for JSON structure...');
    const memeData: MemePrompt = await generateStructuredJSON<MemePrompt>(
      jsonPrompt,
      zodToJsonSchema(memePromptSchema)
    );

    console.log('Generated meme structure:', JSON.stringify(memeData, null, 2));

    // Validate the response structure
    if (!memeData.captions || !Array.isArray(memeData.captions)) {
      console.error('Invalid meme data structure:', memeData);
      throw new Error('Generated meme structure is missing captions array');
    }

    if (!memeData.sceneDescription || !memeData.style || !memeData.mood) {
      console.error('Invalid meme data structure:', memeData);
      throw new Error('Generated meme structure is missing required fields');
    }

    // Step 2: Build detailed prompt for Nano Banana
    let imagePrompt: string;

    if (useOverlay) {
      // AI generates base image without text, we'll add text programmatically
      imagePrompt = `Create a ${memeData.style} meme image.

SCENE: ${memeData.sceneDescription}
MOOD: ${memeData.mood}

IMPORTANT: Generate the IMAGE ONLY without any text overlays. The image should be clear, high quality, and leave space at the top and bottom for text to be added later.

Style: High quality, sharp details, suitable for meme format
Aspect ratio: ${memeData.aspectRatio}`;
    } else {
      // AI generates complete image with text
      const captionInstructions = memeData.captions
        .map(
          (cap) =>
            `${cap.position.toUpperCase()} TEXT: "${cap.text}" in bold white Impact font with thick black outline`
        )
        .join('\n');

      imagePrompt = `Create a ${memeData.style} meme image.

SCENE: ${memeData.sceneDescription}
MOOD: ${memeData.mood}

TEXT OVERLAYS (IMPORTANT - Include these exact texts):
${captionInstructions}

Style: Classic internet meme format with bold, perfectly readable text. White Impact font with thick black outline. High quality, sharp details.
Aspect ratio: ${memeData.aspectRatio}`;
    }

    console.log('Image prompt:', imagePrompt);

    // Step 3: Generate image with Nano Banana via OpenRouter
    console.log('Calling OpenRouter (google/gemini-2.5-flash-image) for image generation...');
    let imageBase64 = await generateImage(imagePrompt, memeData.aspectRatio);

    // Step 4: Add programmatic text overlay if requested
    if (useOverlay && memeData.captions.length > 0) {
      console.log('Adding programmatic text overlay...');
      imageBase64 = await addTextOverlay(imageBase64, memeData.captions);
    }

    // Step 5: Save to database
    try {
      const memeId = saveMeme({
        mode: 'auto',
        userInput: idea,
        generatedPrompt: imagePrompt,
        imageData: imageBase64,
        metadata: {
          ...memeData,
          useOverlay,
          captions,
        },
      });
      console.log('Meme saved to database with ID:', memeId);
    } catch (dbError) {
      console.error('Failed to save meme to database:', dbError);
      // Continue even if DB save fails
    }

    // Return the generated meme
    return NextResponse.json({
      success: true,
      image: imageBase64,
      metadata: memeData,
      mode: 'auto',
      overlayUsed: useOverlay,
    });
  } catch (error: any) {
    console.error('Error in auto mode:', error);

    // Handle specific error types
    if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again in a few moments.',
          details: 'The API is currently rate-limited. Try again shortly.',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate meme',
        details: error.message || 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
