/**
 * Seeding and pre-caching script for BroccoliDB.
 * Pre-populates BroccoliDB Content-Addressed Storage with official card artwork
 * for all tournament decks and top Genesys cards, eliminating external image requests.
 */

import fs from 'node:fs';
import path from 'node:path';
import { getBroccoliDb, getOrCacheCardImage, getBroccoliCacheStats } from '../src/lib/broccolidb';

async function seedTournamentAssets() {
  console.log('🥦 [BroccoliDB] Starting automated cache seeding...');
  const { kernel } = await getBroccoliDb();

  const ycsPath = path.join(process.cwd(), 'src/data/tournaments/ycs-houston-2026.json');
  const gcPath = path.join(process.cwd(), 'src/data/tournaments/genesys-giant-card-houston-2026.json');

  const ycs = JSON.parse(fs.readFileSync(ycsPath, 'utf-8'));
  const gc = JSON.parse(fs.readFileSync(gcPath, 'utf-8'));

  const cardMap = new Map<number, string>();

  // Collect cards from tournaments
  for (const tourney of [ycs, gc]) {
    for (const deck of tourney.decks) {
      for (const section of [deck.mainDeck, deck.extraDeck, deck.sideDeck]) {
        for (const card of section) {
          if (card.cardId && card.cardId > 0) {
            cardMap.set(card.cardId, card.name);
          }
        }
      }
    }
  }

  console.log(`🥦 [BroccoliDB] Found ${cardMap.size} unique tournament cards to cache.`);

  let cachedCount = 0;
  let alreadyCached = 0;
  const entries = Array.from(cardMap.entries());

  for (let i = 0; i < entries.length; i++) {
    const [cardId, cardName] = entries[i];
    process.stdout.write(`\rCaching card [${i + 1}/${entries.length}]: ${cardName}... `);

    // Cache both small and cropped images into BroccoliDB CAS vault
    const resSmall = await getOrCacheCardImage(cardId, 'small', cardName);
    const resCrop = await getOrCacheCardImage(cardId, 'cropped', cardName);

    if (resSmall.fromCache && resCrop.fromCache) {
      alreadyCached++;
    } else {
      cachedCount++;
    }
  }

  console.log('\n');
  await kernel.flush();

  const stats = await getBroccoliCacheStats();
  console.log('🥦 [BroccoliDB] Seeding Complete!');
  console.log(`   - Total Cached Image Records in BroccoliDB: ${stats.cachedImagesCount}`);
  console.log(`   - Newly Downloaded & Stored in CAS: ${cachedCount}`);
  console.log(`   - Already in CAS Vault: ${alreadyCached}`);
  console.log(`   - CAS Sharded Vault Path: ${stats.casDirectory}`);
}

seedTournamentAssets()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('BroccoliDB Seeding Error:', err);
    process.exit(1);
  });
