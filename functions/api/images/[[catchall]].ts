interface EventContext {
  request: Request;
  params: {
    catchall?: string[];
  };
}

export async function onRequest(context: EventContext): Promise<Response> {
  const url = new URL(context.request.url);
  // catchall path is e.g. ['small', '35272499'] or ['cropped', '35272499.jpg']
  const parts = context.params.catchall || [];
  const type = parts[0] || 'small';
  const idRaw = parts[1] || '';
  const cardId = parseInt(idRaw.replace(/\.(jpg|png|webp|svg)$/i, ''), 10);

  if (isNaN(cardId) || cardId <= 0) {
    return new Response('Invalid Card ID', { status: 400 });
  }

  let folder = 'cards_small';
  if (type === 'cropped') {
    folder = 'cards_cropped';
  } else if (type === 'normal') {
    folder = 'cards';
  }

  const upstreamUrl = `https://images.ygoprodeck.com/images/${folder}/${cardId}.jpg`;

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      cf: {
        cacheEverything: true,
        cacheTtl: 31536000,
      },
    } as unknown as RequestInit);

    if (!upstreamResponse.ok) {
      if (folder !== 'cards') {
        const fallbackResponse = await fetch(`https://images.ygoprodeck.com/images/cards/${cardId}.jpg`, {
          cf: { cacheEverything: true, cacheTtl: 31536000 },
        } as unknown as RequestInit);
        if (fallbackResponse.ok) {
          const headers = new Headers(fallbackResponse.headers);
          headers.set('Content-Type', 'image/jpeg');
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          headers.set('X-Edge-Provider', 'Cloudflare-Pages');
          return new Response(fallbackResponse.body, {
            status: 200,
            headers,
          });
        }
      }
      return new Response('Image not found', { status: 404 });
    }

    const headers = new Headers(upstreamResponse.headers);
    headers.set('Content-Type', 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('X-Edge-Provider', 'Cloudflare-Pages');
    return new Response(upstreamResponse.body, {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(`Image fetch error: ${msg}`, { status: 502 });
  }
}
