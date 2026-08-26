import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  return new Response(
    `User-agent: *
Allow: /
Sitemap: https://festivalwishesindia.com/sitemap-index.xml
`,
    {
      headers: { 'Content-Type': 'text/plain' },
    }
  );
};
