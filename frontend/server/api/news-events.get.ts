import { defineEventHandler, createError, getQuery } from 'h3';
import { useRuntimeConfig } from '#imports';
import type { NewsEvent, StrapiMedia, StrapiImageFormat, Author } from '../../types/content';
import type {
  RawEntity,
  RawRelationOne,
  RawRelationMany,
  RawImageFormat,
  RawMediaAttributes,
  StrapiListResponseRaw,
  _RawNewsEventAttributes,
  FlatMedia,
  _FlatNewsEvent,
  StrapiListResponseFlat,
  FlatAuthor,
} from '../../types/raw-strapi-types';

type StrapiListResponseUnion =
  | StrapiListResponseRaw<_RawNewsEventAttributes>
  | StrapiListResponseFlat<_FlatNewsEvent>;

// Helpers -------------------------------------------------------------------
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

function mapStrapiMediaMany(
  baseUrl: string,
  relation?: RawRelationMany<RawMediaAttributes> | RawEntity<RawMediaAttributes>[] | null
): StrapiMedia[] | null {
  const data = hasDataKey(relation)
    ? (relation as RawRelationMany<RawMediaAttributes>).data
    : (relation as RawEntity<RawMediaAttributes>[] | null | undefined);
  if (!Array.isArray(data)) return null;
  const mapped = data
    .map((item) => mapStrapiMedia(baseUrl, item))
    .filter((m): m is StrapiMedia => Boolean(m));
  return mapped.length ? mapped : null;
}

function mapFlatMediaList(baseUrl: string, list?: FlatMedia[] | null): StrapiMedia[] | null {
  if (!Array.isArray(list)) return null;
  const mapped = list
    .map((item) => mapFlatMedia(baseUrl, item))
    .filter((m): m is StrapiMedia => Boolean(m));
  return mapped.length ? mapped : null;
}

function mapNewsEvent(
  baseUrl: string,
  raw: RawEntity<_RawNewsEventAttributes> | null | undefined
): NewsEvent | null {
  if (!raw || !raw.id || !raw.attributes) return null;
  const a = raw.attributes;
  return {
    id: raw.id,
    title: a.title,
    secondaryTitle: a.secondary_title ?? null,
    date: a.date,
    cover: mapStrapiMedia(baseUrl, a.cover)!,
    images: mapStrapiMediaMany(baseUrl, a.images),
    body: a.body,
    section: a.section ?? null,
    lla: !!a.lla,
    projects: null,
  };
}

function mapFlatAuthors(baseUrl: string, list?: FlatAuthor[] | null): Author[] | null {
  if (!Array.isArray(list)) return null;
  return list.map(
    (a): Author => ({
      id: a.id,
      name: a.name,
      title: a.title ?? null,
      avatar: mapFlatMedia(baseUrl, a.avatar ?? null),
      email: a.email ?? null,
      research_publications: null,
      colocal: !!a.colocal,
      admin: !!a.admin,
      country: a.country ?? null,
    })
  );
}

function mapFlatNewsEvents(baseUrl: string, list?: _FlatNewsEvent[] | null): NewsEvent[] | null {
  if (!Array.isArray(list)) return null;
  return list.map(
    (e): NewsEvent => ({
      id: e.id,
      title: e.title,
      secondaryTitle: e.secondary_title ?? null,
      date: e.date,
      cover: mapFlatMedia(baseUrl, e.cover)!,
      images: mapFlatMediaList(baseUrl, e.images ?? null),
      body: e.body,
      section: e.section ?? null,
      lla: !!e.lla,
      blog: e.blog,
      authors: mapFlatAuthors(baseUrl, e.authors ?? null),
      projects: null,
    })
  );
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const q = getQuery(event) as {
    project?: string;
    projectSlug?: string;
    projectId?: string;
    id?: string;
  };
  const baseUrl =
    (config?.strapi?.url as string) ||
    (config?.public?.strapiUrl as string) ||
    'http://localhost:1337';
  const token = (config?.strapi?.token as string) || '';

  const query: Record<string, string> = { populate: '*' };

  const slug = (q.projectSlug || q.project) as string | undefined;
  const id = q.projectId ? Number(q.projectId) : undefined;
  const itemId = q.id ? Number(q.id) : undefined;
  if (slug) {
    // News/Event expected to have many-to-many with projects; filter on relation
    query['filters[projects][slug][$eq]'] = String(slug);
  } else if (typeof id === 'number' && !Number.isNaN(id)) {
    query['filters[projects][id][$eq]'] = String(id);
  }
  if (typeof itemId === 'number' && !Number.isNaN(itemId)) {
    query['filters[id][$eq]'] = String(itemId);
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await $fetch<StrapiListResponseUnion>(`${baseUrl}/api/news-events`, {
      method: 'GET',
      headers,
      query,
    });

    let items: NewsEvent[] = [];
    if (Array.isArray(res?.data)) {
      const first: unknown = res.data[0];
      if (first && hasAttributes<_RawNewsEventAttributes>(first)) {
        const dataRaw = res as StrapiListResponseRaw<_RawNewsEventAttributes>;
        items = dataRaw.data
          .map((item) => mapNewsEvent(baseUrl, item))
          .filter(Boolean) as NewsEvent[];
      } else {
        const dataFlat = res as StrapiListResponseFlat<_FlatNewsEvent>;
        items = mapFlatNewsEvents(baseUrl, dataFlat.data) ?? [];
      }
    }

    return items;
  } catch (err: unknown) {
    throw createError({
      statusCode: getPropAsNumber(err, 'statusCode') ?? 500,
      statusMessage: 'Failed to fetch news/events from Strapi',
      data: {
        message:
          err instanceof Error ? err.message : (getPropAsString(err, 'message') ?? 'Unknown error'),
        details: getProp(err, 'data') ?? null,
      },
    });
  }
});
