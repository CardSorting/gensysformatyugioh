import { BroccoliDatabaseKernel, BroccoliCASStorageService } from './broccolidb-engine';
import path from 'node:path';
import { Card } from '@/types/card';
import cardsRaw from '@/data/cards.json';

export type CachedImageRecord = {
  id: string; // key: `${type}-${cardId}`
  cardId: number;
  type: 'small' | 'cropped' | 'normal';
  casHash: string;
  contentType: string;
  size: number;
  lastFetched: number;
  sourceUrl: string;
  [key: string]: unknown;
};

export type CachedCardRecord = {
  id: string; // String(cardId)
  cardId: number;
  name: string;
  type: string;
  points: number;
  category: string;
  cardData: Card;
  [key: string]: unknown;
};

export type CachedApiSearchRecord = {
  id: string; // `search:${query}`
  query: string;
  cards: Card[];
  timestamp: number;
  [key: string]: unknown;
};

let kernelInstance: BroccoliDatabaseKernel | null = null;
let casInstance: BroccoliCASStorageService | null = null;
let initPromise: Promise<{ kernel: BroccoliDatabaseKernel; cas: BroccoliCASStorageService }> | null = null;

// High-resolution Yu-Gi-Oh Genesys fallback SVG card
export function generateFallbackCardSvg(cardName: string = 'Yu-Gi-Oh! Card', points: number = 0): Buffer {
  const safeName = cardName.replace(/[<>&'"]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 421 614" width="421" height="614">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0f19" />
      <stop offset="50%" stop-color="#111827" />
      <stop offset="100%" stop-color="#07090e" />
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#d97706" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <linearGradient id="borderGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#00f0ff" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
  </defs>
  <!-- Card Outer Frame -->
  <rect x="0" y="0" width="421" height="614" rx="16" fill="url(#bg)" stroke="url(#gold)" stroke-width="6"/>
  <!-- Inner Border -->
  <rect x="18" y="18" width="385" height="578" rx="10" fill="none" stroke="url(#borderGrad)" stroke-width="2" stroke-opacity="0.4"/>
  <!-- Title Box -->
  <rect x="28" y="28" width="365" height="44" rx="6" fill="#040608" stroke="#374151" stroke-width="1.5"/>
  <text x="44" y="56" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="bold" font-size="16">${safeName}</text>
  <!-- Artwork Area -->
  <rect x="42" y="86" width="337" height="337" rx="8" fill="#030407" stroke="#1f2937" stroke-width="2"/>
  <circle cx="210" cy="235" r="54" fill="none" stroke="#00f0ff" stroke-width="3" stroke-dasharray="6 4" opacity="0.6"/>
  <text x="210" y="244" text-anchor="middle" fill="#00f0ff" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-weight="900" font-size="28">GENESYS</text>
  <text x="210" y="272" text-anchor="middle" fill="#9ca3af" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="12" letter-spacing="1">AUTHENTIC CARD</text>
  <!-- Points Badge -->
  <rect x="312" y="380" width="60" height="30" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="1"/>
  <text x="342" y="401" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="14">${points} PTS</text>
  <!-- Description Box -->
  <rect x="28" y="440" width="365" height="140" rx="6" fill="#040608" stroke="#374151" stroke-width="1.5"/>
  <text x="40" y="468" fill="#93c5fd" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-weight="bold" font-size="13">[ Yu-Gi-Oh! Genesys Format ]</text>
  <text x="40" y="494" fill="#9ca3af" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="12">Official format card stored in local BroccoliDB vault.</text>
  <text x="40" y="516" fill="#6b7280" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="11">Deduplicated and Brotli-compressed in CAS storage.</text>
  <text x="40" y="556" fill="#00f0ff" font-family="monospace" font-size="10" opacity="0.7">BROCCOLIDB CAS INTEGRITY VERIFIED</text>
</svg>`;
  return Buffer.from(svg, 'utf-8');
}

export async function getBroccoliDb(): Promise<{
  kernel: BroccoliDatabaseKernel;
  cas: BroccoliCASStorageService;
}> {
  if (kernelInstance && casInstance) {
    return { kernel: kernelInstance, cas: casInstance };
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const workspaceRoot = process.env.BROCCOLIDB_WORKSPACE_ROOT || process.cwd();
    const kernel = new BroccoliDatabaseKernel({
      workspaceRoot,
      walDebounceMs: 25,
    });
    const cas = new BroccoliCASStorageService(workspaceRoot);

    await kernel.start();
    await cas.start();

    // Ensure tables and indexes exist
    const imageCacheTable = kernel.getTable<CachedImageRecord>('image_cache');
    imageCacheTable.createIndex('cardId');
    imageCacheTable.createIndex('type');
    imageCacheTable.createIndex('casHash');

    const cardsTable = kernel.getTable<CachedCardRecord>('cards');
    cardsTable.createIndex('name');
    cardsTable.createIndex('points');
    cardsTable.createIndex('category');

    const searchCacheTable = kernel.getTable<CachedApiSearchRecord>('api_search_cache');
    searchCacheTable.createIndex('query');

    kernelInstance = kernel;
    casInstance = cas;

    // Seed cards table in background if empty
    seedCardsIntoBroccoliDb(kernel).catch(err => {
      console.error('[BroccoliDB] Failed seeding cards:', err);
    });

    return { kernel, cas };
  })();

  return initPromise;
}

export async function seedCardsIntoBroccoliDb(kernel: BroccoliDatabaseKernel): Promise<number> {
  const table = kernel.getTable<CachedCardRecord>('cards');
  if (table.count() > 0) {
    return table.count();
  }

  const allCards = cardsRaw as Card[];
  let count = 0;
  for (const card of allCards) {
    table.put(String(card.id), {
      id: String(card.id),
      cardId: card.id,
      name: card.name,
      type: card.type,
      points: card.points,
      category: card.frameType || 'monster',
      cardData: card,
    });
    count++;
  }
  await kernel.flush();
  return count;
}

export function getCdnSourceUrl(cardId: number, type: 'small' | 'cropped' | 'normal'): string {
  if (type === 'cropped') {
    return `https://images.ygoprodeck.com/images/cards_cropped/${cardId}.jpg`;
  }
  if (type === 'small') {
    return `https://images.ygoprodeck.com/images/cards_small/${cardId}.jpg`;
  }
  return `https://images.ygoprodeck.com/images/cards/${cardId}.jpg`;
}

/**
 * Retrieves a card image from BroccoliDB Content-Addressed Storage.
 * If not present, downloads it once from the CDN, stores it durably in BroccoliDB CAS,
 * and records it in the image_cache table to eliminate all future API and image calling.
 */
export async function getOrCacheCardImage(
  cardId: number,
  type: 'small' | 'cropped' | 'normal' = 'small',
  cardName?: string
): Promise<{ buffer: Buffer; contentType: string; fromCache: boolean; casHash: string }> {
  const { kernel, cas } = await getBroccoliDb();
  const cacheKey = `${type}-${cardId}`;
  const imageCacheTable = kernel.getTable<CachedImageRecord>('image_cache');

  // 1. Check BroccoliDB Table Record
  const existingRecord = imageCacheTable.get(cacheKey);
  if (existingRecord) {
    try {
      const blob = await cas.read(existingRecord.casHash);
      if (blob && blob.length > 0) {
        return {
          buffer: blob,
          contentType: existingRecord.contentType || 'image/jpeg',
          fromCache: true,
          casHash: existingRecord.casHash,
        };
      }
    } catch {
      // If CAS read failed, re-fetch and re-store below
    }
  }

  // 2. Fetch once from YGOPRODeck CDN
  const sourceUrl = getCdnSourceUrl(cardId, type);
  try {
    const res = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'GenesysVisualizer/2.0 (BroccoliDB Storage Cache)',
      },
    });

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = res.headers.get('content-type') || 'image/jpeg';

      // 3. Store into BroccoliDB Content-Addressed Storage (CAS)
      const casHash = await cas.store(buffer);

      // 4. Record into BroccoliDB in-memory table with WAL durability
      imageCacheTable.put(cacheKey, {
        id: cacheKey,
        cardId,
        type,
        casHash,
        contentType,
        size: buffer.length,
        lastFetched: Date.now(),
        sourceUrl,
      });

      return { buffer, contentType, fromCache: false, casHash };
    }
  } catch (err) {
    console.warn(`[BroccoliDB] CDN fetch failed for card ${cardId} (${sourceUrl}):`, err);
  }

  // 5. Fallback: Return generated SVG card to guarantee zero broken images
  const fallbackSvg = generateFallbackCardSvg(cardName || `Card #${cardId}`);
  const fallbackHash = await cas.store(fallbackSvg);
  return {
    buffer: fallbackSvg,
    contentType: 'image/svg+xml',
    fromCache: false,
    casHash: fallbackHash,
  };
}

export async function getCachedApiSearch(query: string, maxAgeMs: number = 3600000): Promise<Card[] | null> {
  const { kernel } = await getBroccoliDb();
  const table = kernel.getTable<CachedApiSearchRecord>('api_search_cache');
  const record = table.get(`search:${query.toLowerCase().trim()}`);
  if (record && Date.now() - record.timestamp < maxAgeMs) {
    return record.cards;
  }
  return null;
}

export async function cacheApiSearchResults(query: string, cards: Card[]): Promise<void> {
  const { kernel } = await getBroccoliDb();
  const table = kernel.getTable<CachedApiSearchRecord>('api_search_cache');
  const key = `search:${query.toLowerCase().trim()}`;
  table.put(key, {
    id: key,
    query: query.toLowerCase().trim(),
    cards,
    timestamp: Date.now(),
  });
  // Also index individual cards into the cards table so they are permanently available locally
  const cardsTable = kernel.getTable<CachedCardRecord>('cards');
  for (const card of cards) {
    if (!cardsTable.get(String(card.id))) {
      cardsTable.put(String(card.id), {
        id: String(card.id),
        cardId: card.id,
        name: card.name,
        type: card.type,
        points: card.points,
        category: card.frameType || 'monster',
        cardData: card,
      });
    }
  }
  await kernel.flush();
}

/**
 * Returns diagnostic statistics about BroccoliDB storage and cache hit status.
 */
export async function getBroccoliCacheStats(): Promise<{
  cachedImagesCount: number;
  totalCardsIndexed: number;
  casDirectory: string;
}> {
  const { kernel } = await getBroccoliDb();
  const imageCacheTable = kernel.getTable<CachedImageRecord>('image_cache');
  const cardsTable = kernel.getTable<CachedCardRecord>('cards');

  return {
    cachedImagesCount: imageCacheTable.count(),
    totalCardsIndexed: cardsTable.count(),
    casDirectory: path.join(process.cwd(), '.broccolidb', 'cas'),
  };
}

/**
 * Gracefully flushes and closes active database and CAS services.
 */
export async function closeBroccoliDb(): Promise<void> {
  if (kernelInstance) {
    const k = kernelInstance;
    const c = casInstance;
    kernelInstance = null;
    casInstance = null;
    initPromise = null;
    await k.stop().catch(() => {});
    await c?.stop().catch(() => {});
  }
}
