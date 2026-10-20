import cardsRaw from '../../src/data/cards.json';

interface Card {
  id: number;
  name: string;
  type: string;
  frameType: string;
  humanReadableCardType?: string;
  desc: string;
  race: string;
  archetype?: string | null;
  attribute?: string | null;
  atk?: number | null;
  def?: number | null;
  level?: number | null;
  scale?: number | null;
  linkval?: number | null;
  points?: number;
  ban_tcg?: string | null;
  images: Array<{
    id: number;
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
  }>;
}

const allCards = cardsRaw as Card[];

const staticDistribution = {
  total: allCards.length,
  pointBearing: allCards.filter(c => (c.points || 0) > 0).length,
  p100: allCards.filter(c => (c.points || 0) >= 100).length,
  p50to99: allCards.filter(c => (c.points || 0) >= 50 && (c.points || 0) < 100).length,
  p25to49: allCards.filter(c => (c.points || 0) >= 25 && (c.points || 0) < 50).length,
  p10to24: allCards.filter(c => (c.points || 0) >= 10 && (c.points || 0) < 25).length,
  p1to9: allCards.filter(c => (c.points || 0) >= 1 && (c.points || 0) < 10).length,
  p0: allCards.filter(c => (c.points || 0) === 0).length,
};

export async function onRequest(context: { request: Request }): Promise<Response> {
  const url = new URL(context.request.url);
  const searchParams = url.searchParams;

  const idParam = searchParams.get('id');
  if (idParam) {
    const cardId = parseInt(idParam, 10);
    const card = allCards.find(c => c.id === cardId);
    if (!card) {
      return new Response(JSON.stringify({ error: 'Card not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ card }), {
      headers: { 'Content-Type': 'application/json' },
    });
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

  let results: Card[] = [...allCards];

  if (q) {
    results = results.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.archetype && c.archetype.toLowerCase().includes(q)) ||
      c.desc.toLowerCase().includes(q)
    );
  }

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

  if (attributeFilter) {
    results = results.filter(c => c.attribute && c.attribute.toUpperCase() === attributeFilter.toUpperCase());
  }

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

  return new Response(
    JSON.stringify({
      cards: paginated,
      total,
      offset,
      limit,
      hasMore: offset + limit < total,
      pointBearingCount: staticDistribution.pointBearing,
      databaseTotal: staticDistribution.total,
      distribution: staticDistribution,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
        'X-Edge-Provider': 'Cloudflare-Pages',
      },
    }
  );
}
