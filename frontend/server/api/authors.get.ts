import { defineEventHandler, createError, getQuery } from 'h3';
import { useRuntimeConfig } from '#imports';
import type { Author, StrapiMedia, StrapiImageFormat } from '../../types/content';
import type {
  RawEntity,
  RawImageFormat,
  RawAuthorAttributes,
  FlatAuthor,
  FlatMedia,
} from '../../types/raw-strapi-types';

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

function mapStrapiMedia(baseUrl: string, m?: FlatMedia | null): StrapiMedia | null {
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

function mapRawAuthor(baseUrl: string, ent: RawEntity<RawAuthorAttributes>): Author {
  const a = ent.attributes;
  // For raw author, avatar is a relation - need to extract and map properly
  let avatarMedia: StrapiMedia | null = null;
  if (a.avatar) {
    const avatarRel = a.avatar as { data?: RawEntity<unknown> | null };
    if (avatarRel.data) {
      const mediaData = avatarRel.data as RawEntity<FlatMedia>;
      if (mediaData.attributes) {
        avatarMedia = mapStrapiMedia(baseUrl, mediaData.attributes as FlatMedia);
      }
    }
  }

  return {
    id: ent.id,
    documentId: ent.documentId || String(ent.id),
    name: a.name,
    title: a.title ?? null,
    avatar: avatarMedia,
    email: a.email ?? null,
    research_publications: null,
    colocal: !!a.colocal,
    admin: !!a.admin,
    country: a.country ?? null,
  };
}

function mapFlatAuthor(baseUrl: string, a: FlatAuthor): Author {
  return {
    id: a.id,
    documentId: a.documentId || String(a.id),
    name: a.name,
    title: a.title ?? null,
    avatar: mapStrapiMedia(baseUrl, a.avatar ?? null),
    email: a.email ?? null,
    research_publications: null,
    colocal: !!a.colocal,
    admin: !!a.admin,
    country: a.country ?? null,
  };
}

type StrapiListRaw = { data: Array<RawEntity<RawAuthorAttributes>> };
type StrapiListFlat = { data: Array<FlatAuthor> };

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const baseUrl =
    (config?.strapi?.url as string) ||
    (config?.public?.strapiUrl as string) ||
    'http://localhost:1337';
  const token = (config?.strapi?.token as string) || '';

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Get query parameters for filtering
  const query = getQuery(event);
  const filterColocal = query.colocal as string | undefined;
  const filterTeam = query.team as string | undefined;
  const pageSize = query.pageSize ? String(query.pageSize) : '200';
  const sort = query.sort ? String(query.sort) : 'name:asc';

  try {
    // Build Strapi query with dynamic filters
    const strapiQuery: Record<string, string> = {
      'pagination[pageSize]': pageSize,
      sort,
      populate: 'avatar',
    };

    // Add filters based on query params
    if (filterColocal !== undefined) {
      strapiQuery['filters[colocal][$eq]'] = filterColocal;
    }
    if (filterTeam !== undefined) {
      strapiQuery['filters[team][$eq]'] = filterTeam;
    }

    const res = await $fetch<StrapiListRaw | StrapiListFlat>(`${baseUrl}/api/authors`, {
      method: 'GET',
      headers,
      query: strapiQuery,
    });

    let dataList: Array<RawEntity<RawAuthorAttributes>> | Array<FlatAuthor> = [];

    if (hasDataKey(res)) {
      const d = (res as StrapiListRaw | StrapiListFlat).data;
      if (Array.isArray(d)) {
        dataList = d;
      }
    }

    // Map authors to normalized format
    const authors: Author[] = dataList.map((item) => {
      // Check if it's raw (has attributes) or flat
      if (hasAttributes<RawAuthorAttributes>(item)) {
        return mapRawAuthor(baseUrl, item as RawEntity<RawAuthorAttributes>);
      } else {
        return mapFlatAuthor(baseUrl, item as FlatAuthor);
      }
    });

    return { data: authors };
  } catch (err: unknown) {
    throw createError({
      statusCode: getPropAsNumber(err, 'statusCode') ?? 500,
      statusMessage: 'Failed to fetch authors from Strapi',
      data: {
        message:
          err instanceof Error ? err.message : (getPropAsString(err, 'message') ?? 'Unknown error'),
        details: getProp(err, 'data') ?? null,
      },
    });
  }
});
