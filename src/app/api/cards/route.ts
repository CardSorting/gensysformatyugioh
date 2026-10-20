import { NextRequest, NextResponse } from 'next/server';
import { Card } from '@/types/card';
import { getCachedApiSearch, cacheApiSearchResults } from '@/lib/broccolidb';
import { getAllKnownCards, resolveCardDetails } from '@/lib/card-lookup';

const allFormatCards: Card[] = getAllKnownCards();

// Precomputed official point distribution counts (from official 750 point-bearing database)
const staticDistribution = {
  total: allFormatCards.length,
  pointBearing: allFormatCards.filter(c => (c.points || 0) > 0).length,
  p100: allFormatCards.filter(c => (c.points || 0) >= 100).length,
  p50to99: allFormatCards.filter(c => (c.points || 0) >= 50 && (c.points || 0) < 100).length,
  p25to49: allFormatCards.filter(c => (c.points || 0) >= 25 && (c.points || 0) < 50).length,
  p10to24: allFormatCards.filter(c => (c.points || 0) >= 10 && (c.points || 0) < 25).length,
  p1to9: allFormatCards.filter(c => (c.points || 0) >= 1 && (c.points || 0) < 10).length,
  p0: allFormatCards.filter(c => (c.points || 0) === 0).length,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Single card direct lookup
  const idParam = searchParams.get('id');
  if (idParam) {
    const cardId = parseInt(idParam, 10);
    const card = await resolveCardDetails(cardId, searchParams.get('name') || undefined);
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    return NextResponse.json({ card });
  }

  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const typeFilter = searchParams.get('type') || '';
  const pointRange = searchParams.get('pointRange') || '';
  const minPointsParam = searchParams.get('minPoints');
  const maxPointsParam = searchParams.get('maxPoints');
  const attributeFilter = searchParams.get('attribute') || '';
  const sort = searchParams.get('sort') || 'points-desc';
  const limit = Math.min(120, Math.max(1, parseInt(searchParams.get('limit') || '48', 10)));
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

  let results: Card[] = [...allFormatCards];

  // If query is provided, check if we should query YGOPRODeck for any niche cards
  if (q.length >= 2) {
    const localMatches = results.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.archetype && c.archetype.toLowerCase().includes(q))
    );

    if (localMatches.length < 8) {
      // Check BroccoliDB persistent cache first to prevent API spamming
      const cached = await getCachedApiSearch(q);

      if (cached) {
        const existingIds = new Set(results.map(c => c.id));
        for (const c of cached) {
          if (!existingIds.has(c.id)) {
            results.push(c);
            existingIds.add(c.id);
          }
        }
      } else {
        try {
          const apiUrl = `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(q)}&format=genesys&misc=yes`;
          const res = await fetch(apiUrl, { next: { revalidate: 3600 } });
          if (res.ok) {
            const data = await res.json();
            const rawList = Array.isArray(data.data) ? data.data : [];
            const fetchedList: Card[] = rawList.map((c: Record<string, unknown>) => {
              const misc = Array.isArray(c.misc_info) ? (c.misc_info[0] as Record<string, unknown>) : {};
              const banInfo = typeof c.banlist_info === 'object' && c.banlist_info !== null ? (c.banlist_info as Record<string, string>) : null;
              const cardImages = Array.isArray(c.card_images) ? (c.card_images as Array<Record<string, unknown>>) : [];

              return {
                id: Number(c.id),
                name: String(c.name || ''),
                type: String(c.type || ''),
                frameType: String(c.frameType || ''),
                humanReadableCardType: typeof c.humanReadableCardType === 'string' ? c.humanReadableCardType : undefined,
                desc: String(c.desc || ''),
                race: String(c.race || ''),
                archetype: typeof c.archetype === 'string' ? c.archetype : null,
                attribute: typeof c.attribute === 'string' ? c.attribute : null,
                atk: typeof c.atk === 'number' ? c.atk : null,
                def: typeof c.def === 'number' ? c.def : null,
                level: typeof c.level === 'number' ? c.level : null,
                scale: typeof c.scale === 'number' ? c.scale : null,
                linkval: typeof c.linkval === 'number' ? c.linkval : null,
                points: Number(misc?.genesys_points || 0),
                ban_tcg: banInfo?.ban_tcg || null,
                images: cardImages.map((img: Record<string, unknown>) => ({
                  id: Number(img.id),
                  image_url: String(img.image_url || ''),
                  image_url_small: String(img.image_url_small || ''),
                  image_url_cropped: String(img.image_url_cropped || ''),
                })),
              };
            });

            // Vault in BroccoliDB durable storage to prevent any subsequent external queries
            await cacheApiSearchResults(q, fetchedList);

            const existingIds = new Set(results.map(c => c.id));
            for (const c of fetchedList) {
              if (!existingIds.has(c.id)) {
                results.push(c);
                existingIds.add(c.id);
              }
            }
          }
        } catch (err: unknown) {
          console.warn('[BroccoliDB] External API search failed, using local vault:', err);
        }
      }
    }
  }

  // Filter by query (name, archetype, description)
  if (q) {
    results = results.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.archetype && c.archetype.toLowerCase().includes(q)) ||
      c.desc.toLowerCase().includes(q)
    );
  }

  // Filter by Card Type
  if (typeFilter) {
    const tf = typeFilter.toLowerCase();
    results = results.filter(c => {
      const ct = c.type.toLowerCase();
      if (tf === 'monster') return !ct.includes('spell') && !ct.includes('trap');
      if (tf === 'spell') return ct.includes('spell');
      if (tf === 'trap') return ct.includes('trap');
      if (tf === 'extra') return ct.includes('fusion') || ct.includes('synchro') || ct.includes('xyz');
      if (tf === 'fusion') return ct.includes('fusion');
      if (tf === 'synchro') return ct.includes('synchro');
      if (tf === 'xyz') return ct.includes('xyz');
      if (tf === 'ritual') return ct.includes('ritual');
      if (tf === 'link') return ct.includes('link') || c.frameType === 'link';
      if (tf === 'pendulum') return ct.includes('pendulum');
      return ct.includes(tf);
    });
  }

  // Filter by Attribute
  if (attributeFilter) {
    results = results.filter(c => c.attribute && c.attribute.toUpperCase() === attributeFilter.toUpperCase());
  }

  // Filter by Point Preset Range
  if (pointRange) {
    if (pointRange === 'point-bearing') {
      results = results.filter(c => (c.points || 0) > 0);
    } else if (pointRange === '100') {
      results = results.filter(c => (c.points || 0) >= 100);
    } else if (pointRange === '50-99') {
      results = results.filter(c => (c.points || 0) >= 50 && (c.points || 0) < 100);
    } else if (pointRange === '25-49') {
      results = results.filter(c => (c.points || 0) >= 25 && (c.points || 0) < 50);
    } else if (pointRange === '10-24') {
      results = results.filter(c => (c.points || 0) >= 10 && (c.points || 0) < 25);
    } else if (pointRange === '1-9') {
      results = results.filter(c => (c.points || 0) >= 1 && (c.points || 0) < 10);
    } else if (pointRange === '0') {
      results = results.filter(c => (c.points || 0) === 0);
    }
  }

  // Numerical Min/Max point boundaries
  if (minPointsParam !== null && minPointsParam !== '') {
    const minP = parseInt(minPointsParam, 10);
    if (!isNaN(minP)) {
      results = results.filter(c => (c.points || 0) >= minP);
    }
  }

  if (maxPointsParam !== null && maxPointsParam !== '') {
    const maxP = parseInt(maxPointsParam, 10);
    if (!isNaN(maxP)) {
      results = results.filter(c => (c.points || 0) <= maxP);
    }
  }

  // Sorting
  results.sort((a, b) => {
    switch (sort) {
      case 'points-desc':
        if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
        return a.name.localeCompare(b.name);
      case 'points-asc':
        if ((a.points || 0) !== (b.points || 0)) return (a.points || 0) - (b.points || 0);
        return a.name.localeCompare(b.name);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'atk-desc':
        return (b.atk || 0) - (a.atk || 0);
      default:
        if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
        return a.name.localeCompare(b.name);
    }
  });

  const total = results.length;
  const paginated = results.slice(offset, offset + limit);

  return NextResponse.json({
    cards: paginated,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
    pointBearingCount: staticDistribution.pointBearing,
    databaseTotal: staticDistribution.total,
    distribution: staticDistribution,
  });
}
