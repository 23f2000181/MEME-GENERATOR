import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, loadImage, registerFont } from 'canvas';

export const runtime = 'nodejs';

interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  strokeColor: string;
  strokeWidth: number;
}

interface AddTextRequest {
  imageUrl: string;
  textLayers: TextLayer[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AddTextRequest = await request.json();
    const { imageUrl, textLayers } = body;

    if (!imageUrl || !textLayers || textLayers.length === 0) {
      return NextResponse.json(
        { error: 'Image URL and text layers are required' },
        { status: 400 }
      );
    }

    console.log('Adding text to image:', { imageUrl: imageUrl.substring(0, 50) + '...', layerCount: textLayers.length });

    // Load the base image
    const image = await loadImage(imageUrl);

    // Create canvas with same dimensions as image
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // Draw the base image
    ctx.drawImage(image, 0, 0);

    // Add text layers
    for (const layer of textLayers) {
      const { text, x, y, fontSize, color, fontFamily, strokeColor, strokeWidth } = layer;

      // Set font
      ctx.font = `bold ${fontSize}px "${fontFamily}", Impact, Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Convert percentage to pixel coordinates
      const pixelX = (x / 100) * image.width;
      const pixelY = (y / 100) * image.height;

      // Draw text with stroke (outline)
      if (strokeWidth > 0) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * 2; // Double for better visibility
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(text.toUpperCase(), pixelX, pixelY);
      }

      // Draw text fill
      ctx.fillStyle = color;
      ctx.fillText(text.toUpperCase(), pixelX, pixelY);
    }

    // Convert canvas to base64
    const buffer = canvas.toBuffer('image/png');
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      image: base64Image,
    });
  } catch (error: any) {
    console.error('Error adding text to image:', error);

    return NextResponse.json(
      {
        error: 'Failed to add text to image',
        details: error.message || 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
