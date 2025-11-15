import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/openrouter';
import { saveMeme } from '@/lib/db';

export const runtime = 'nodejs';

interface ManualMemeRequest {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '4:3' | '9:16' | '3:4';
  blankTemplate?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ManualMemeRequest = await request.json();
    const { prompt, aspectRatio = '1:1', blankTemplate = false } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Manual mode request:', { prompt, aspectRatio, blankTemplate });

    // Modify prompt if blank template is requested
    let finalPrompt = prompt;
    if (blankTemplate) {
      finalPrompt = `${prompt}. IMPORTANT: Create this image with NO TEXT, NO CAPTIONS, NO WORDS whatsoever in the image. Leave plenty of empty space at the top and bottom of the image for text to be added later. Clean, uncluttered composition with ample whitespace for overlays.`;
    }

    // Generate image directly with Nano Banana via OpenRouter
    console.log('Calling OpenRouter (google/gemini-2.5-flash-image) for image generation...');
    const imageBase64 = await generateImage(finalPrompt, aspectRatio);

    // Save to database
    try {
      const memeId = saveMeme({
        mode: 'manual',
        userInput: prompt,
        generatedPrompt: finalPrompt,
        imageData: imageBase64,
        metadata: {
          aspectRatio,
          blankTemplate,
        },
      });
      console.log('Meme saved to database with ID:', memeId);
    } catch (dbError) {
      console.error('Failed to save meme to database:', dbError);
      // Continue even if DB save fails
    }

    return NextResponse.json({
      success: true,
      image: imageBase64,
      mode: 'manual',
      prompt: finalPrompt,
      aspectRatio,
      blankTemplate,
    });
  } catch (error: any) {
    console.error('Error in manual mode:', error);

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
