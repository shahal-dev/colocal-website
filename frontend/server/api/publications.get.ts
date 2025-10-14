import { defineEventHandler, createError, getQuery } from 'h3';
import { useRuntimeConfig } from '#imports';
import type {
  ResearchPublication,
  Author,
  Tag,
  StrapiMedia,
  StrapiImageFormat,
  PublicationType,
  Theme,
  Country,
} from '../../types/content';
import type {
  RawEntity,
  RawRelationOne,
  RawRelationMany,
  RawImageFormat,
  RawMediaAttributes,
  RawAuthorAttributes,
  RawTagComponent,
  RawPublicationTypeComponent,
  RawThemeComponent,
  RawCountryComponent,
  RawPublicationAttributes,
  StrapiListResponseRaw,
  FlatMedia,
  FlatAuthor,
  FlatPublication,
  StrapiListResponseFlat,
} from '../../types/raw-strapi-types';

type StrapiListResponseUnion =
  | StrapiListResponseRaw<RawPublicationAttributes>
  | StrapiListResponseFlat<FlatPublication>;

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

function mapTags(raw: RawTagComponent[] | null | undefined): Tag[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.map((t) => ({ tag: t?.tag ?? '' })).filter((t) => t.tag.trim().length > 0);
}

function mapPublicationType(c?: RawPublicationTypeComponent): PublicationType {
  return { type: c?.type ?? '' };
}
function mapTheme(c?: RawThemeComponent | null): Theme | null {
  if (!c) return null;
  return { theme: c.theme ?? '' };
}
function mapCountry(c?: RawCountryComponent | null): Country | null {
  if (!c) return null;
  return { name: c.name ?? '' };
}

function mapAuthors(
  baseUrl: string,
  raw: RawRelationMany<RawAuthorAttributes> | RawEntity<RawAuthorAttributes>[] | null | undefined
): Author[] | null {
  const arr = hasDataKey(raw)
    ? (raw as RawRelationMany<RawAuthorAttributes>).data
    : (raw as RawEntity<RawAuthorAttributes>[] | null | undefined);
  if (!Array.isArray(arr)) return null;
  return arr.map((item) => {
    const a = item.attributes || ({} as RawAuthorAttributes);
    return {
      id: item.id,
      name: a.name,
      avatar: mapStrapiMedia(baseUrl, a.avatar),
      email: a.email ?? null,
      research_publications: null,
      colocal: !!a.colocal,
    } as Author;
  });
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

function mapPublication(
  baseUrl: string,
  raw: RawEntity<RawPublicationAttributes> | null | undefined
): ResearchPublication | null {
  if (!raw || !raw.id || !raw.attributes) return null;
  const a = raw.attributes;
  return {
    id: raw.id,
    title: a.title,
    secondaryTitle: a.secondary_title ?? null,
    abstract: a.abstract,
    date: a.date,
    authors: mapAuthors(baseUrl, a.authors) ?? [],
    tags: mapTags(a.tags),
    url: a.url,
    file: mapStrapiMedia(baseUrl, a.file),
    imageCover: mapStrapiMedia(baseUrl, a.image_cover) ?? null,
    images: mapStrapiMediaMany(baseUrl, a.images),
    project: null,
    lla: !!a.lla,
    publication_type: mapPublicationType(a.publication_type),
    theme: mapTheme(a.theme ?? null),
    country: mapCountry(a.country ?? null),
  };
}

function mapFlatPublications(
  baseUrl: string,
  list?: FlatPublication[] | null
): ResearchPublication[] | null {
  if (!Array.isArray(list)) return null;
  return list.map(
    (p): ResearchPublication => ({
      id: p.id,
      title: p.title,
      secondaryTitle: p.secondary_title ?? null,
      abstract: p.abstract,
      date: p.date,
      authors: mapFlatAuthors(baseUrl, p.authors) ?? [],
      tags: mapTags(p.tags),
      url: p.url ?? p.URL ?? '',
      file: mapFlatMedia(baseUrl, p.file ?? null),
      imageCover: mapFlatMedia(baseUrl, p.image_cover ?? null),
      images: mapFlatMediaList(baseUrl, p.images ?? null),
      project: null,
      lla: !!p.lla,
      publication_type: mapPublicationType(p.publication_type),
      theme: mapTheme(p.theme ?? null),
      country: mapCountry(p.country ?? null),
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
    query['filters[project][slug][$eq]'] = String(slug);
  } else if (typeof id === 'number' && !Number.isNaN(id)) {
    query['filters[project][id][$eq]'] = String(id);
  }
  if (typeof itemId === 'number' && !Number.isNaN(itemId)) {
    query['filters[id][$eq]'] = String(itemId);
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await $fetch<StrapiListResponseUnion>(`${baseUrl}/api/research-publications`, {
      method: 'GET',
      headers,
      query,
    });

    let items: ResearchPublication[] = [];
    if (Array.isArray(res?.data)) {
      const first: unknown = res.data[0];
      if (first && hasAttributes<RawPublicationAttributes>(first)) {
        const dataRaw = res as StrapiListResponseRaw<RawPublicationAttributes>;
        items = dataRaw.data
          .map((item) => mapPublication(baseUrl, item))
          .filter(Boolean) as ResearchPublication[];
      } else {
        const dataFlat = res as StrapiListResponseFlat<FlatPublication>;
        items = mapFlatPublications(baseUrl, dataFlat.data) ?? [];
      }
    }

    return items;
  } catch (err: unknown) {
    throw createError({
      statusCode: getPropAsNumber(err, 'statusCode') ?? 500,
      statusMessage: 'Failed to fetch research publications from Strapi',
      data: {
        message:
          err instanceof Error ? err.message : (getPropAsString(err, 'message') ?? 'Unknown error'),
        details: getProp(err, 'data') ?? null,
      },
    });
  }
});
