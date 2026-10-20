interface WorkerEnv {
  UPSTREAM_ORIGIN?: string;
  [key: string]: unknown;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const worker = {
  async fetch(request: Request, env: WorkerEnv, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const upstream = env.UPSTREAM_ORIGIN || 'https://gensysygo.vercel.app';
    const targetUrl = new URL(url.pathname + url.search, upstream);

    const headers = new Headers(request.headers);
    headers.set('X-Forwarded-Host', url.host);
    headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

    try {
      const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
        redirect: 'follow',
      });

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('X-Edge-Provider', 'Cloudflare-Worker');
      responseHeaders.set('X-Custom-Domain', 'genesysygo.top');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(`Worker Gateway Error: ${msg}`, { status: 502 });
    }
  },
};

export default worker;
