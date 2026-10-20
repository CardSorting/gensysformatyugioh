import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getBroccoliDb,
  generateFallbackCardSvg,
  getOrCacheCardImage,
  getCachedApiSearch,
  cacheApiSearchResults,
  getBroccoliCacheStats,
  closeBroccoliDb,
} from './broccolidb';
import { getProxiedImageUrl, getDeckThumbnailUrl } from './images';
import { Card } from '@/types/card';

test('BroccoliDB - Local Storage and CAS Engine', async (t) => {
  t.after(async () => {
    await closeBroccoliDb().catch(() => {});
  });

  await t.test('initializes BroccoliDB kernel and CAS storage service', async () => {
    const { kernel, cas } = await getBroccoliDb();
    assert.ok(kernel, 'BroccoliDB kernel should be initialized');
    assert.ok(cas, 'BroccoliCASStorageService should be initialized');

    const imageTable = kernel.getTable('image_cache');
    assert.ok(imageTable, 'image_cache table should exist');

    const cardsTable = kernel.getTable('cards');
    assert.ok(cardsTable, 'cards table should exist');

    const searchTable = kernel.getTable('api_search_cache');
    assert.ok(searchTable, 'api_search_cache table should exist');
  });

  await t.test('stores and retrieves binary blobs with SHA-256 CAS verification', async () => {
    const { cas } = await getBroccoliDb();
    const testPayload = Buffer.from('Yu-Gi-Oh! Genesys BroccoliDB Storage Verification');

    const hash = await cas.store(testPayload);
    assert.equal(typeof hash, 'string');
    assert.equal(hash.length, 64, 'SHA-256 hash should be 64 hex characters');

    const retrieved = await cas.read(hash);
    assert.deepEqual(retrieved, testPayload, 'Retrieved blob must match stored content exactly');
    assert.notEqual(retrieved, null, 'CAS read must return non-null for stored hash');
  });

  await t.test('generates valid, high-resolution SVG fallback card for broken/missing artwork', () => {
    const svgBuffer = generateFallbackCardSvg('Blue-Eyes White Dragon', 20);
    assert.ok(svgBuffer && svgBuffer.length > 0, 'Fallback SVG buffer should not be empty');

    const svgString = svgBuffer.toString('utf-8');
    assert.ok(svgString.includes('<svg'), 'Should be valid SVG XML');
    assert.ok(svgString.includes('viewBox="0 0 421 614"'), 'Should match card aspect ratio');
    assert.ok(svgString.includes('Blue-Eyes White Dragon'), 'Should display card name');
    assert.ok(svgString.includes('20 PTS'), 'Should display point value');
    assert.ok(svgString.includes('BROCCOLIDB CAS INTEGRITY VERIFIED'), 'Should include BroccoliDB watermark');
  });

  await t.test('gracefully caches and serves fallback SVG for non-existent card without error', async () => {
    // Card ID 999999999 does not exist on YGOPRODeck CDN
    const result = await getOrCacheCardImage(999999999, 'small', 'Unknown Test Card');
    assert.ok(result.buffer.length > 0, 'Buffer must be non-empty');
    assert.equal(result.contentType, 'image/svg+xml', 'Content type must be SVG for fallback');
    assert.equal(result.casHash.length, 64, 'CAS hash must be 64 characters');
  });

  await t.test('persists and retrieves external search results to eliminate API spamming', async () => {
    const testQuery = 'testquerygenesys';
    const mockCards: Card[] = [
      {
        id: 8880001,
        name: 'Mock Test Card Alpha',
        type: 'Effect Monster',
        frameType: 'effect',
        desc: 'BroccoliDB test description',
        race: 'Dragon',
        points: 15,
        images: [
          {
            id: 8880001,
            image_url: 'https://images.ygoprodeck.com/images/cards/8880001.jpg',
            image_url_small: 'https://images.ygoprodeck.com/images/cards_small/8880001.jpg',
            image_url_cropped: 'https://images.ygoprodeck.com/images/cards_cropped/8880001.jpg',
          },
        ],
      },
    ];

    await cacheApiSearchResults(testQuery, mockCards);

    const cachedResults = await getCachedApiSearch(testQuery);
    assert.ok(cachedResults, 'Should retrieve cached search results');
    assert.equal(cachedResults.length, 1);
    assert.equal(cachedResults[0].name, 'Mock Test Card Alpha');
    assert.equal(cachedResults[0].points, 15);
  });

  await t.test('returns diagnostic storage stats from BroccoliDB tables and CAS directory', async () => {
    const stats = await getBroccoliCacheStats();
    assert.ok(stats.cachedImagesCount >= 0, 'Should return non-negative image count');
    assert.ok(stats.totalCardsIndexed >= 0, 'Should return non-negative cards count');
    assert.ok(stats.casDirectory.includes('.broccolidb'), 'CAS directory path should be valid');
  });
});

test('Image Resolver Utilities - Zero Broken Images & Local Proxy Routing', async (t) => {
  await t.test('resolves proxied URLs for known card IDs', () => {
    assert.equal(getProxiedImageUrl(35272499, 'small'), '/api/images/small/35272499');
    assert.equal(getProxiedImageUrl(35272499, 'cropped'), '/api/images/cropped/35272499');
    assert.equal(getProxiedImageUrl(35272499, 'normal'), '/api/images/normal/35272499');
  });

  await t.test('extracts card ID from fallback CDN URL when cardId is missing or zero', () => {
    const cdnUrl = 'https://images.ygoprodeck.com/images/cards_cropped/15177726.jpg';
    assert.equal(getProxiedImageUrl(undefined, 'cropped', cdnUrl), '/api/images/cropped/15177726');
    assert.equal(getProxiedImageUrl(0, 'small', cdnUrl), '/api/images/small/15177726');
  });

  await t.test('returns empty string when both cardId and fallbackUrl are missing to prevent empty-string img src', () => {
    assert.equal(getProxiedImageUrl(undefined, 'small'), '');
    assert.equal(getProxiedImageUrl(0, 'cropped'), '');
    assert.equal(getDeckThumbnailUrl(undefined), '');
  });

  await t.test('resolves deck thumbnail to cropped proxied URL', () => {
    assert.equal(getDeckThumbnailUrl(35272499), '/api/images/cropped/35272499');
  });
});
