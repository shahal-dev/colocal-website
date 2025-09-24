import { defineEventHandler, createError } from 'h3';
import { useRuntimeConfig } from '#imports';
import type { StrapiMedia, StrapiImageFormat } from '../../types/content';
import type {
  RawEntity,
  RawRelationOne,
  RawImageFormat,
  RawMediaAttributes,
} from '../../types/raw-strapi-types';

type GlobalAttributesRaw = {
  favicon?: RawRelationOne<RawMediaAttributes> | null;
};
type GlobalFlat = {
  favicon?: {
    id?: number;
    url?: string;
    formats?: Record<string, RawImageFormat>;
  } | null;
};

type StrapiSingleRaw = { data: RawEntity<GlobalAttributesRaw> | null };
type StrapiSingleFlat = { data: (GlobalFlat & { id?: number }) | null };

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
function mapStrapiMedia(
  baseUrl: string,
  entity: RawRelationOne<RawMediaAttributes> | RawEntity<RawMediaAttributes> | null | undefined
): StrapiMedia | null {
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
    const res = await $fetch<StrapiSingleRaw | StrapiSingleFlat>(`${baseUrl}/api/global`, {
      method: 'GET',
      headers,
      query: { populate: 'favicon' },
    });

    let favicon: StrapiMedia | null = null;
    if (hasDataKey(res)) {
      const d = (res as StrapiSingleRaw | StrapiSingleFlat).data as unknown;
      if (d && hasAttributes<GlobalAttributesRaw>(d)) {
        const attrs = (d as RawEntity<GlobalAttributesRaw>).attributes;
        favicon = mapStrapiMedia(baseUrl, attrs?.favicon ?? null);
      } else {
        const flat = (d || null) as GlobalFlat | null;
        if (flat?.favicon?.url) {
          const fmts = flat.favicon.formats || {};
          const mappedFormats: Record<string, StrapiImageFormat> = {};
          for (const key of Object.keys(fmts)) {
            const fmt = mapImageFormat(baseUrl, fmts[key]);
            if (fmt) mappedFormats[key] = fmt;
          }
          favicon = {
            id: (flat.favicon.id as number) ?? 0,
            url: toAbsoluteUrl(baseUrl, flat.favicon.url),
            alternativeText: null,
            caption: null,
            width: undefined,
            height: undefined,
            formats: mappedFormats,
            mime: undefined,
            size: undefined,
            name: undefined,
            provider: undefined,
            createdAt: undefined,
            updatedAt: undefined,
          };
        }
      }
    }

    return { favicon };
  } catch (err: unknown) {
    throw createError({
      statusCode: getPropAsNumber(err, 'statusCode') ?? 500,
      statusMessage: 'Failed to fetch global settings from Strapi',
      data: {
        message:
          err instanceof Error ? err.message : (getPropAsString(err, 'message') ?? 'Unknown error'),
        details: getProp(err, 'data') ?? null,
      },
    });
  }
});
