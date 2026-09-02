import { defineEventHandler, getRequestURL, sendRedirect, setHeader } from 'h3';

const CACHEABLE_PREFIXES = [
  '/about',
  '/projects',
  '/education-training',
  '/research-publications',
  '/outreach',
  '/blog',
  '/api/',
];

/**
 * All public content is identical for every visitor. Cache function responses
 * at Vercel's CDN so repeat requests do not invoke Nuxt or Strapi. Query strings
 * remain part of the CDN cache key, so filtered API variants stay isolated.
 */
export default defineEventHandler((event) => {
  if (event.method !== 'GET' && event.method !== 'HEAD') return;

  const url = getRequestURL(event);
  const pathname = url.pathname;
  const cacheable =
    pathname === '/' || CACHEABLE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!cacheable) return;

  setHeader(
    event,
    'Cache-Control',
    'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400'
  );

  // Pages do not use URL query parameters. Redirect tracking/cache-buster
  // variants to one canonical cache key before they can trigger CMS reads.
  if (!pathname.startsWith('/api/') && url.search) {
    return sendRedirect(event, pathname, 308);
  }
});
