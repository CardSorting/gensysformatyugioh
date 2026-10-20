import { BroccoliQueue, Job } from './broccoliqueue-engine';
import { getBroccoliDb, getOrCacheCardImage } from './broccolidb';

export interface ImagePrefetchJobData {
  cardId: number;
  type?: 'small' | 'cropped' | 'normal';
  cardName?: string;
  [key: string]: unknown;
}

export interface DeckPreloadJobData {
  deckId: string;
  cardIds: number[];
  tournamentId?: string;
  [key: string]: unknown;
}

let queueInstance: BroccoliQueue | null = null;
let queueInitPromise: Promise<BroccoliQueue> | null = null;

/**
 * Returns the singleton BroccoliQueue instance backed by the shared BroccoliDB kernel.
 */
export async function getBroccoliQueue(): Promise<BroccoliQueue> {
  if (queueInstance) {
    return queueInstance;
  }

  if (queueInitPromise) {
    return queueInitPromise;
  }

  queueInitPromise = (async () => {
    const { kernel } = await getBroccoliDb();

    const queue = new BroccoliQueue({
      db: kernel,
      namespace: 'genesys_jobs',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delayMs: 1000, maxDelayMs: 15000 },
      },
    });

    await queue.start();

    // 1. Worker for individual card image prefetching & caching
    const imageWorker = queue.process<ImagePrefetchJobData>(
      'image.prefetch',
      async (job: Job<ImagePrefetchJobData>, { signal }) => {
        signal.throwIfAborted();
        const { cardId, type = 'small', cardName } = job.data;
        const result = await getOrCacheCardImage(cardId, type, cardName);
        return {
          cardId,
          type,
          casHash: result.casHash,
          fromCache: result.fromCache,
          size: result.buffer.length,
        };
      },
      { concurrency: 4, workerId: 'worker-image-prefetch' }
    );
    await imageWorker.start();

    // 2. Worker for deck-level batch prefetching
    const deckWorker = queue.process<DeckPreloadJobData>(
      'deck.preload',
      async (job: Job<DeckPreloadJobData>, { signal }) => {
        signal.throwIfAborted();
        const { cardIds } = job.data;
        const results = [];
        for (const id of cardIds) {
          signal.throwIfAborted();
          const small = await getOrCacheCardImage(id, 'small');
          const cropped = await getOrCacheCardImage(id, 'cropped');
          results.push({ id, smallHash: small.casHash, croppedHash: cropped.casHash });
        }
        return { processedCount: results.length, details: results };
      },
      { concurrency: 2, workerId: 'worker-deck-preload' }
    );
    await deckWorker.start();

    queueInstance = queue;
    return queue;
  })();

  return queueInitPromise;
}

/**
 * Enqueues an image prefetch job with producer idempotency.
 */
export async function enqueueImagePrefetch(
  cardId: number,
  type: 'small' | 'cropped' | 'normal' = 'small',
  cardName?: string
): Promise<string> {
  const queue = await getBroccoliQueue();
  const job = await queue.add(
    'image.prefetch',
    { cardId, type, cardName },
    {
      idempotencyKey: `img:${type}:${cardId}`,
      priority: 5,
    }
  );
  return job.id;
}

/**
 * Enqueues a deck preload job to vault all card images for a given tournament deck.
 */
export async function enqueueDeckPreload(
  deckId: string,
  cardIds: number[],
  tournamentId?: string
): Promise<string> {
  const queue = await getBroccoliQueue();
  const job = await queue.add(
    'deck.preload',
    { deckId, cardIds, tournamentId },
    {
      idempotencyKey: `deck:${tournamentId || 'unknown'}:${deckId}`,
      priority: 10,
    }
  );
  return job.id;
}

/**
 * Returns queue overview, health, and aggregated state counts.
 */
export async function getQueueStatus() {
  const queue = await getBroccoliQueue();
  return queue.getOverview();
}

/**
 * Gracefully shuts down workers and closes the queue.
 */
export async function closeBroccoliQueue(): Promise<void> {
  if (queueInstance) {
    const q = queueInstance;
    queueInstance = null;
    queueInitPromise = null;
    await q.close({ drainTimeoutMs: 500 });
  }
}
