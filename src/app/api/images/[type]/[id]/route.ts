import { NextRequest, NextResponse } from 'next/server';
import { getOrCacheCardImage } from '@/lib/broccolidb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type: rawType, id: rawId } = await params;
  const cardId = parseInt(rawId.replace(/\.(jpg|png|webp|svg)$/i, ''), 10);

  if (isNaN(cardId) || cardId <= 0) {
    return new NextResponse('Invalid Card ID', { status: 400 });
  }

  const type = (rawType === 'cropped' || rawType === 'normal') ? rawType : 'small';

  try {
    const { buffer, contentType, fromCache, casHash } = await getOrCacheCardImage(cardId, type);

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-BroccoliDB-CAS-Hash': casHash,
        'X-BroccoliDB-Cache': fromCache ? 'HIT' : 'MISS',
        'X-BroccoliDB-Storage': 'Content-Addressed-Storage-Vault',
      },
    });
  } catch (error) {
    console.error(`[API /api/images/${type}/${cardId}] Error:`, error);
    return new NextResponse('Internal Image Cache Error', { status: 500 });
  }
}
