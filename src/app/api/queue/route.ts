import { NextRequest, NextResponse } from 'next/server';
import {
  getQueueStatus,
  enqueueImagePrefetch,
  enqueueDeckPreload,
  getBroccoliQueue,
} from '@/lib/queue';

export async function GET() {
  try {
    const overview = await getQueueStatus();
    return NextResponse.json({
      status: 'ok',
      engine: 'BroccoliQueue',
      backedBy: 'BroccoliDB Tables & WAL',
      overview,
    });
  } catch (error) {
    console.error('[API /api/queue GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to inspect queue status', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'prefetch-image') {
      const { cardId, type = 'small', cardName } = body;
      if (!cardId || typeof cardId !== 'number') {
        return NextResponse.json({ error: 'Valid numeric cardId is required' }, { status: 400 });
      }
      const jobId = await enqueueImagePrefetch(cardId, type, cardName);
      return NextResponse.json({
        success: true,
        action,
        jobId,
        message: `Enqueued image prefetch for card #${cardId} (${type})`,
      });
    }

    if (action === 'preload-deck') {
      const { deckId, cardIds, tournamentId } = body;
      if (!deckId || !Array.isArray(cardIds) || cardIds.length === 0) {
        return NextResponse.json(
          { error: 'deckId and non-empty cardIds array are required' },
          { status: 400 }
        );
      }
      const jobId = await enqueueDeckPreload(deckId, cardIds, tournamentId);
      return NextResponse.json({
        success: true,
        action,
        jobId,
        message: `Enqueued batch preload for deck ${deckId} (${cardIds.length} cards)`,
      });
    }

    if (action === 'custom') {
      const { name, data, options } = body;
      if (!name || typeof name !== 'string') {
        return NextResponse.json({ error: 'Job name is required' }, { status: 400 });
      }
      const queue = await getBroccoliQueue();
      const job = await queue.add(name, data ?? {}, options ?? {});
      return NextResponse.json({
        success: true,
        action,
        jobId: job.id,
        message: `Enqueued custom job '${name}'`,
      });
    }

    return NextResponse.json(
      { error: `Unknown action: '${action}'. Expected: 'prefetch-image', 'preload-deck', or 'custom'.` },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API /api/queue POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to enqueue job', details: String(error) },
      { status: 500 }
    );
  }
}
