interface Env {
  UPSTREAM_ORIGIN?: string;
}

interface PagesContext {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<unknown>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<string, string | string[]>;
  data: Record<string, unknown>;
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const url = new URL(context.request.url);
  const upstream = context.env.UPSTREAM_ORIGIN || 'https://gensysygo.vercel.app';
  const targetUrl = new URL(url.pathname + url.search, upstream);

  // Clone headers and preserve client headers
  const headers = new Headers(context.request.headers);
  headers.set('X-Forwarded-Host', url.host);
  headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

  try {
    const response = await fetch(targetUrl.toString(), {
      method: context.request.method,
      headers: headers,
      body: context.request.method !== 'GET' && context.request.method !== 'HEAD' ? context.request.body : undefined,
      redirect: 'follow',
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('X-Edge-Provider', 'Cloudflare-Pages');
    responseHeaders.set('X-Canonical-Domain', 'genesysygo.top');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(`Edge Gateway Error connecting to upstream: ${message}`, {
      status: 502,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};
