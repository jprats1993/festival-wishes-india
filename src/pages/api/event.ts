import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { event, url, fallback } = body;
    if (!event || typeof event !== 'string') {
      return new Response(JSON.stringify({ ok: false, error: 'missing event' }), { status: 400 });
    }
    // In Phase 1 this is a no-op endpoint. Later it can forward to a Cloudflare Worker.
    // We log server-side during development only.
    if (import.meta.env.DEV) {
      console.log('[event]', { event, url, fallback });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid json' }), { status: 400 });
  }
};
