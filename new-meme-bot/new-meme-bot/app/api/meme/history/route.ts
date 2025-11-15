import { NextRequest, NextResponse } from 'next/server';
import { getRecentMemes } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get recent memes from database
    const memes = getRecentMemes(limit);

    // Parse metadata JSON strings back to objects
    const memesWithParsedMetadata = memes.map((meme: any) => ({
      ...meme,
      metadata: typeof meme.metadata === 'string' ? JSON.parse(meme.metadata) : meme.metadata,
    }));

    return NextResponse.json({
      success: true,
      memes: memesWithParsedMetadata,
      count: memesWithParsedMetadata.length,
    });
  } catch (error: any) {
    console.error('Error fetching meme history:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch meme history',
        details: error.message || 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
