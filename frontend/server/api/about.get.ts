import { defineEventHandler, createError } from 'h3';
import { useRuntimeConfig } from '#imports';
import type { Author, StrapiMedia, StrapiImageFormat } from '../../types/content';
import type {
  RawEntity,
  RawRelationOne,
  RawImageFormat,
  RawMediaAttributes,
  RawAuthorAttributes,
  RawObjectiveComponent,
  FlatAuthor,
  FlatMedia,
} from '../../types/raw-strapi-types';

// Local shapes for About single type (raw vs flat)
type RawQuoteComponent = { body: string; author?: RawRelationOne<RawAuthorAttributes> };
type FlatQuote = { body: string; author?: FlatAuthor | null };

type AboutAttributesRaw = {
  title?: string;
  subtitle?: string;
  about?: string;
  mission?: string;
  objectives?: RawObjectiveComponent[] | null;
  quotes?: RawQuoteComponent[] | null;
};

type AboutFlat = {
  title?: string;
  subtitle?: string;
  about?: string;
  mission?: string;
  objectives?: RawObjectiveComponent[] | null;
  quotes?: FlatQuote[] | null;
};

type StrapiSingleRaw = { data: RawEntity<AboutAttributesRaw> | null };
type StrapiSingleFlat = { data: (AboutFlat & { id?: number }) | null };

// Helpers ---------------------------------------------------------------
function hasDataKey(x: unknown): x is { data: unknown } {
  return typeof x === 'object' && x !== null && 'data' in x;
}

function hasAttributes<T extends object>(x: unknown): x is RawEntity<T> {
  return typeof x === 'object' && x !== null && 'attributes' in x;
}

function getPropAsNumber(obj: unknown, key: string): number | undefined {
  if (typeof obj === 'object' && obj !== null && key in obj) {
    const v = (obj as Record<string, unknown>)[key];
    if (typeof v === 'number') return v;
  }
  return undefined;
}

function getPropAsString(obj: unknown, key: string): string | undefined {
  if (typeof obj === 'object' && obj !== null && key in obj) {
    const v = (obj as Record<string, unknown>)[key];
    if (typeof v === 'string') return v;
  }
  return undefined;
}

function getProp(obj: unknown, key: string): unknown {
  if (typeof obj === 'object' && obj !== null && key in obj) {
    return (obj as Record<string, unknown>)[key];
  }
  return undefined;
}

function toAbsoluteUrl(baseUrl: string, url?: string | null): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('//')) return url;
  return `${baseUrl}${url}`;
}

function mapImageFormat(
  baseUrl: string,
  fmt?: RawImageFormat | null
): StrapiImageFormat | undefined {
  if (!fmt) return undefined;
  return {
    ext: fmt.ext ?? null,
    url: toAbsoluteUrl(baseUrl, fmt.url),
    hash: fmt.hash,
    mime: fmt.mime,
    name: fmt.name,
    path: fmt.path ?? null,
    size: fmt.size,
    width: fmt.width,
    height: fmt.height,
  };
}

type RawMediaLike =
  | RawRelationOne<RawMediaAttributes>
  | RawEntity<RawMediaAttributes>
  | null
  | undefined;

function mapStrapiMedia(baseUrl: string, entity: RawMediaLike): StrapiMedia | null {
  const data = hasDataKey(entity)
    ? (entity as RawRelationOne<RawMediaAttributes>).data
    : (entity as RawEntity<RawMediaAttributes> | null | undefined);
  if (!data || !data.id || !data.attributes) return null;
  const a = data.attributes;
  const formats = a.formats || {};
  const mappedFormats: Record<string, StrapiImageFormat> = {};
  for (const key of Object.keys(formats)) {
    const fmt = mapImageFormat(baseUrl, formats[key]);
    if (fmt) mappedFormats[key] = fmt;
  }
  return {
    id: data.id,
    url: toAbsoluteUrl(baseUrl, a.url),
    alternativeText: a.alternativeText ?? null,
    caption: a.caption ?? null,
    width: a.width ?? null,
    height: a.height ?? null,
    formats: mappedFormats,
    mime: a.mime,
    size: a.size,
    name: a.name,
    provider: a.provider,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

function mapFlatMedia(baseUrl: string, m?: FlatMedia | null): StrapiMedia | null {
  if (!m) return null;
  const formats = m.formats || {};
  const mappedFormats: Record<string, StrapiImageFormat> = {};
  for (const key of Object.keys(formats)) {
    const fmt = mapImageFormat(baseUrl, formats[key]);
    if (fmt) mappedFormats[key] = fmt;
  }
  return {
    id: m.id,
    url: toAbsoluteUrl(baseUrl, m.url),
    alternativeText: m.alternativeText ?? null,
    caption: m.caption ?? null,
    width: m.width ?? null,
    height: m.height ?? null,
    formats: mappedFormats,
    mime: m.mime,
    size: m.size,
    name: m.name,
    provider: m.provider,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

function mapRawAuthor(baseUrl: string, ent?: RawEntity<RawAuthorAttributes> | null): Author | null {
  if (!ent || !ent.id || !ent.attributes) return null;
  const a = ent.attributes;
  return {
    id: ent.id,
    name: a.name,
    title: a.title ?? null,
    avatar: mapStrapiMedia(baseUrl, a.avatar),
    email: a.email ?? null,
    research_publications: null,
    colocal: !!a.colocal,
  };
}

function mapFlatAuthor(baseUrl: string, a?: FlatAuthor | null): Author | null {
  if (!a) return null;
  return {
    id: a.id,
    name: a.name,
    title: a.title ?? null,
    avatar: mapFlatMedia(baseUrl, a.avatar ?? null),
    email: a.email ?? null,
    research_publications: null,
    colocal: !!a.colocal,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasOwn(obj: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const baseUrl =
    (config?.strapi?.url as string) ||
    (config?.public?.strapiUrl as string) ||
    'http://localhost:1337';
  const token = (config?.strapi?.token as string) || '';

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await $fetch<StrapiSingleRaw | StrapiSingleFlat>(`${baseUrl}/api/about`, {
      method: 'GET',
      headers,
      // Deep-populate quotes.author.avatar (don't mix with populate='*' to avoid type conflict)
      query: {
        'populate[quotes][populate][author][populate]': 'avatar',
      },
    });

    let payload: AboutAttributesRaw | AboutFlat | null = null;
    if (hasDataKey(res)) {
      const d = (res as StrapiSingleRaw | StrapiSingleFlat).data as unknown;
      if (d && hasAttributes<AboutAttributesRaw>(d)) {
        // v4 raw
        payload = (d as RawEntity<AboutAttributesRaw>).attributes;
      } else {
        // flat (v5 or transform)
        payload = (d || null) as AboutFlat | null;
      }
    }

    if (!payload) return {};

    // Resolve authors robustly (raw, flat, id-only) and memoize fetches
    const authorCache = new Map<number, Author | null>();

    // Pre-collect candidate author IDs for batch fetch
    const candidateIds = new Set<number>();
    for (const q of payload.quotes || []) {
      const authorInput = (q as unknown as { author?: unknown }).author;
      if (!authorInput) continue;
      if (typeof authorInput === 'number') {
        candidateIds.add(authorInput);
      } else if (Array.isArray(authorInput)) {
        const first = authorInput[0];
        if (typeof first === 'number') candidateIds.add(first);
        else if (
          isRecord(first) &&
          'id' in first &&
          typeof first.id === 'number' &&
          !('name' in first)
        ) {
          candidateIds.add(first.id);
        }
      } else if (hasDataKey(authorInput)) {
        const relData: unknown = (authorInput as { data: unknown }).data;
        if (Array.isArray(relData)) {
          const first = relData[0] as unknown;
          if (typeof first === 'number') candidateIds.add(first);
          else if (
            isRecord(first) &&
            'id' in first &&
            typeof first.id === 'number' &&
            !('attributes' in first)
          ) {
            candidateIds.add((first as { id: number }).id);
          }
        } else if (typeof relData === 'number') {
          candidateIds.add(relData);
        } else if (
          isRecord(relData) &&
          'id' in relData &&
          typeof (relData as Record<string, unknown>).id === 'number' &&
          !('attributes' in relData)
        ) {
          candidateIds.add((relData as { id: number }).id);
        }
      } else if (isRecord(authorInput)) {
        const rec = authorInput as Record<string, unknown>;
        if ('id' in rec && typeof rec.id === 'number' && !('name' in rec)) {
          candidateIds.add(rec.id);
        }
      }
    }

    // Batch fetch authors by IDs if needed
    if (candidateIds.size > 0) {
      try {
        const ids = Array.from(candidateIds);
        const aList = await $fetch<{ data: Array<RawEntity<RawAuthorAttributes>> }>(
          `${baseUrl}/api/authors`,
          {
            method: 'GET',
            headers,
            query: {
              'filters[id][$in]': ids, // arrays become repeated params
              'pagination[pageSize]': String(Math.max(ids.length, 50)),
              populate: 'avatar',
            },
          }
        );
        for (const ent of aList?.data || []) {
          authorCache.set(ent.id, mapRawAuthor(baseUrl, ent));
        }
      } catch {
        // ignore batch fetch failure; per-id fetch will be attempted below
      }
    }

    async function fetchAuthorById(id: number): Promise<Author | null> {
      if (authorCache.has(id)) return authorCache.get(id) ?? null;
      try {
        const aRes = await $fetch<{ data: RawEntity<RawAuthorAttributes> | null }>(
          `${baseUrl}/api/authors/${id}`,
          { method: 'GET', headers, query: { populate: 'avatar' } }
        );
        const mapped = aRes?.data ? mapRawAuthor(baseUrl, aRes.data) : null;
        authorCache.set(id, mapped);
        return mapped;
      } catch {
        authorCache.set(id, null);
        return null;
      }
    }

    async function resolveAuthor(input: unknown): Promise<Author | null> {
      if (!input) return null;
      // Raw relation shape { data: { id, attributes } }
      if (hasDataKey(input)) {
        const relData: unknown = (input as { data: unknown }).data;
        if (Array.isArray(relData)) {
          if (relData.length === 0) return null;
          const first = relData[0] as unknown;
          if (typeof first === 'number') return fetchAuthorById(first);
          if (isRecord(first)) {
            if ('attributes' in first)
              return mapRawAuthor(baseUrl, first as RawEntity<RawAuthorAttributes>);
            if ('id' in first && typeof first.id === 'number')
              return fetchAuthorById(first.id as number);
          }
          return null;
        }
        if (typeof relData === 'number') return fetchAuthorById(relData);
        return mapRawAuthor(baseUrl, relData as RawEntity<RawAuthorAttributes> | null);
      }
      // Flat author object
      if (isRecord(input)) {
        const rec = input as Record<string, unknown>;
        // If it already has a name, assume flat author
        if (hasOwn(rec, 'name')) {
          return mapFlatAuthor(baseUrl, rec as unknown as FlatAuthor);
        }
        // If it only has an id, fetch full author
        if (hasOwn(rec, 'id') && typeof rec.id === 'number') {
          return fetchAuthorById(rec.id);
        }
      }
      // Array of authors - pick first for display
      if (Array.isArray(input)) {
        if (input.length === 0) return null;
        const first = input[0] as unknown;
        return resolveAuthor(first);
      }
      // If it's a number id
      if (typeof input === 'number') {
        return fetchAuthorById(input);
      }
      return null;
    }

    // Map quotes authors similar to publications mapping
    const quotes = await Promise.all(
      (payload.quotes || []).map(async (q) => {
        const author = await resolveAuthor((q as unknown as { author?: unknown }).author);
        return { body: (q as { body: string }).body, author };
      })
    );

    const normalized = {
      title: payload.title ?? '',
      subtitle: payload.subtitle ?? '',
      about: payload.about ?? '',
      mission: payload.mission ?? '',
      objectives: payload.objectives || [],
      quotes,
    };

    return normalized;
  } catch (err: unknown) {
    throw createError({
      statusCode: getPropAsNumber(err, 'statusCode') ?? 500,
      statusMessage: 'Failed to fetch about content from Strapi',
      data: {
        message:
          err instanceof Error ? err.message : (getPropAsString(err, 'message') ?? 'Unknown error'),
        details: getProp(err, 'data') ?? null,
      },
    });
  }
});
