export async function onRequest(context: { request: Request }): Promise<Response> {
  const method = context.request.method;

  if (method === 'GET') {
    return new Response(
      JSON.stringify({
        status: 'ok',
        engine: 'BroccoliQueue',
        backedBy: 'Cloudflare Edge Workers',
        overview: {
          active: 0,
          waiting: 0,
          completed: 1080,
          failed: 0,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Edge-Provider': 'Cloudflare-Pages',
        },
      }
    );
  }

  if (method === 'POST') {
    let body: Record<string, unknown> = {};
    try {
      body = (await context.request.json()) as Record<string, unknown>;
    } catch {
      // ignore
    }
    return new Response(
      JSON.stringify({
        success: true,
        action: body.action || 'sync',
        jobId: `job_${Date.now()}`,
        message: 'Job processed successfully on Cloudflare Edge',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Edge-Provider': 'Cloudflare-Pages',
        },
      }
    );
  }

  return new Response('Method Not Allowed', { status: 405 });
}
