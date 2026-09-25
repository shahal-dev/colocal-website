type QueryPrimitive = string | number | boolean;
export type StrapiQuery = Record<string, QueryPrimitive | QueryPrimitive[] | null | undefined>;

const fetchCachedStrapiResponse = defineCachedFunction(
  async (
    baseUrl: string,
    token: string,
    path: string,
    query: StrapiQuery | undefined
  ): Promise<unknown> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    return await $fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers,
      query,
    });
  },
  {
    name: 'strapi-get',
    group: 'strapi',
    maxAge: 60 * 60,
    swr: true,
  }
);

/**
 * Cache public Strapi GET requests inside Nitro.
 *
 * SSR calls local Nuxt API routes without passing through the CDN, so the
 * response Cache-Control header is not enough on its own. The cache key hashes
 * the base URL, token, path and complete query, isolating every environment and
 * request variant. Rejected requests are not stored by Nitro's function cache.
 */
export async function cachedStrapiGet<T>(
  baseUrl: string,
  token: string,
  path: string,
  query?: StrapiQuery
): Promise<T> {
  return (await fetchCachedStrapiResponse(baseUrl, token, path, query)) as T;
}
