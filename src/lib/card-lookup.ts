import { Card } from '@/types/card';
import cardsRaw from '@/data/cards.json';
import tournamentCardsRaw from '@/data/tournament-cards.json';

const baseCards = cardsRaw as Card[];
const tournamentCards = tournamentCardsRaw as Card[];

// Combine all pre-indexed cards (1,080+ official format cards)
const allKnownCards: Card[] = [...baseCards];
const knownIdSet = new Set(baseCards.map(c => c.id));

for (const tc of tournamentCards) {
  if (!knownIdSet.has(tc.id)) {
    allKnownCards.push(tc);
    knownIdSet.add(tc.id);
  }
}

// O(1) in-memory indices
const cardsById = new Map<number, Card>();
const cardsByName = new Map<string, Card>();

for (const c of allKnownCards) {
  cardsById.set(c.id, c);
  cardsByName.set(c.name.trim().toLowerCase(), c);
}

/**
 * Returns a known card by its numerical ID or case-insensitive name in O(1) time.
 */
export function getKnownCard(id?: number | null, name?: string | null): Card | undefined {
  if (id && cardsById.has(id)) {
    return cardsById.get(id);
  }
  if (name) {
    const key = name.trim().toLowerCase();
    if (cardsByName.has(key)) {
      return cardsByName.get(key);
    }
  }
  return undefined;
}

/**
 * Returns the full list of all 1,080+ pre-indexed format and tournament cards.
 */
export function getAllKnownCards(): Card[] {
  return allKnownCards;
}

// Client-side cache for dynamically resolved cards (persisted across modal opens)
const clientResolvedCache = new Map<number, Card>();

/**
 * Asynchronously resolves full card metadata (including full effect description,
 * ATK/DEF, level, scale, link rating, attribute, and archetype).
 */
export async function resolveCardDetails(id: number, name?: string, fallbackPoints: number = 0): Promise<Card | null> {
  // 1. Check local precomputed index
  const local = getKnownCard(id, name);
  if (local && local.desc && !local.desc.startsWith('Official tournament card')) {
    return local;
  }

  // 2. Check client memory cache
  if (clientResolvedCache.has(id)) {
    return clientResolvedCache.get(id)!;
  }

  // 3. Query internal API or external YGOPRODeck API
  try {
    const queryUrl = id
      ? `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${id}&format=genesys&misc=yes`
      : name
      ? `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(name)}&format=genesys&misc=yes`
      : null;

    if (!queryUrl) return local || null;

    const res = await fetch(queryUrl);
    if (!res.ok) {
      return local || null;
    }

    const data = await res.json();
    if (data.data && data.data[0]) {
      const raw = data.data[0];
      const enriched: Card = {
        id: Number(raw.id),
        name: String(raw.name),
        type: String(raw.type),
        frameType: String(raw.frameType || 'normal'),
        humanReadableCardType: typeof raw.humanReadableCardType === 'string' ? raw.humanReadableCardType : raw.type,
        desc: String(raw.desc || ''),
        race: String(raw.race || ''),
        archetype: typeof raw.archetype === 'string' ? raw.archetype : null,
        attribute: typeof raw.attribute === 'string' ? raw.attribute : null,
        atk: typeof raw.atk === 'number' ? raw.atk : null,
        def: typeof raw.def === 'number' ? raw.def : null,
        level: typeof raw.level === 'number' ? raw.level : null,
        scale: typeof raw.scale === 'number' ? raw.scale : null,
        linkval: typeof raw.linkval === 'number' ? raw.linkval : null,
        points: typeof local?.points === 'number' ? local.points : Number(raw.misc_info?.[0]?.genesys_points || fallbackPoints),
        ban_tcg: raw.banlist_info?.ban_tcg || null,
        images: Array.isArray(raw.card_images) && raw.card_images.length > 0
          ? raw.card_images.map((img: { id: number; image_url?: string; image_url_small?: string; image_url_cropped?: string }) => ({
              id: Number(img.id),
              image_url: String(img.image_url || ''),
              image_url_small: String(img.image_url_small || ''),
              image_url_cropped: String(img.image_url_cropped || ''),
            }))
          : [
              {
                id: Number(raw.id),
                image_url: `https://images.ygoprodeck.com/images/cards/${raw.id}.jpg`,
                image_url_small: `https://images.ygoprodeck.com/images/cards_small/${raw.id}.jpg`,
                image_url_cropped: `https://images.ygoprodeck.com/images/cards_cropped/${raw.id}.jpg`,
              },
            ],
      };

      clientResolvedCache.set(id, enriched);
      return enriched;
    }
  } catch (err) {
    console.warn('[CardLookup] Remote card resolution failed:', err);
  }

  return local || null;
}
