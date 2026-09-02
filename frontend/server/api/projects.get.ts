import { defineEventHandler, createError, getQuery } from 'h3';
import { useRuntimeConfig } from '#imports';
import type {
  Project,
  ResearchPublication,
  Author,
  Objective,
  Tag,
  StrapiMedia,
  StrapiImageFormat,
  PublicationType,
  Theme,
  Country,
  EducationTraining,
  NewsEvent,
} from '../../types/content';

import type {
  RawProjectAttributes,
  RawPublicationAttributes,
  RawAuthorAttributes,
  RawObjectiveComponent,
  RawTagComponent,
  RawMediaAttributes,
  RawRelationMany,
  _RawEducationTrainingAttributes,
  _RawNewsEventAttributes,
  StrapiListResponseRaw,
  StrapiListResponseFlat,
  StrapiListResponseUnion,
  FlatProject,
  FlatPublication,
  FlatAuthor,
  RawPublicationTypeComponent,
  RawThemeComponent,
  RawCountryComponent,
  RawEntity,
  RawImageFormat,
  RawRelationOne,
  FlatMedia,
} from '../../types/raw-strapi-types';

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

// Narrow helpers to avoid 'any'
function hasDataKey(x: unknown): x is { data: unknown } {
  return typeof x === 'object' && x !== null && 'data' in x;
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

function hasAttributes<T extends object>(x: unknown): x is RawEntity<T> {
  return typeof x === 'object' && x !== null && 'attributes' in x;
}

// Helper: build absolute URLs for media when Strapi returns relative paths
function toAbsoluteUrl(baseUrl: string, url?: string | null): string {
  if (!url) return '';
  // if already absolute or protocol-relative
  if (/^https?:\/\//i.test(url) || url.startsWith('//')) return url;
  return `${baseUrl}${url}`;
}

// Map Strapi media attributes to our StrapiMedia type
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
  // handle both { data } relation and raw entity
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

function mapStrapiMultiMedia(
  baseUrl: string,
  entity: RawRelationMany<RawMediaAttributes> | RawEntity<RawMediaAttributes>[] | null | undefined
): StrapiMedia[] | null {
  const arr = hasDataKey(entity)
    ? (entity as RawRelationMany<RawMediaAttributes>).data
    : (entity as RawEntity<RawMediaAttributes>[] | null | undefined);
  if (!Array.isArray(arr)) return null;
  const out: StrapiMedia[] = [];
  for (const item of arr) {
    const m = mapStrapiMedia(baseUrl, item);
    if (m) out.push(m);
  }
  return out;
}

// Map Education/Training (raw)
function mapEducationTraining(
  baseUrl: string,
  raw: RawEntity<_RawEducationTrainingAttributes> | null | undefined
): EducationTraining | null {
  if (!raw || !raw.id || !raw.attributes) return null;
  const a = raw.attributes;
  return {
    id: raw.id,
    title: a.title,
    date: a.date,
    cover: mapStrapiMedia(baseUrl, a.cover)!,
    body: a.body,
    type: a.type ? { type: a.type.type } : null,
    section: a.section ?? null,
    lla: !!a.lla,
    project: null,
  };
}

function mapEducationTrainings(
  baseUrl: string,
  raw:
    | RawRelationMany<_RawEducationTrainingAttributes>
    | RawEntity<_RawEducationTrainingAttributes>[]
    | null
    | undefined
): EducationTraining[] | null {
  const arr = hasDataKey(raw)
    ? (raw as RawRelationMany<_RawEducationTrainingAttributes>).data
    : (raw as RawEntity<_RawEducationTrainingAttributes>[] | null | undefined);
  if (!Array.isArray(arr)) return null;
  const out: EducationTraining[] = [];
  for (const item of arr) {
    const et = mapEducationTraining(baseUrl, item);
    if (et) out.push(et);
  }
  return out;
}

// Map News/Event (raw)
function mapNewsEvent(
  baseUrl: string,
  raw: RawEntity<_RawNewsEventAttributes> | null | undefined
): NewsEvent | null {
  if (!raw || !raw.id || !raw.attributes) return null;
  const a = raw.attributes;
  return {
    id: raw.id,
    title: a.title,
    date: a.date,
    cover: mapStrapiMedia(baseUrl, a.cover)!,
    body: a.body,
    section: a.section ?? null,
    lla: !!a.lla,
    projects: null,
  };
}

function mapNewsEvents(
  baseUrl: string,
  raw:
    | RawRelationMany<_RawNewsEventAttributes>
    | RawEntity<_RawNewsEventAttributes>[]
    | null
    | undefined
): NewsEvent[] | null {
  const arr = hasDataKey(raw)
    ? (raw as RawRelationMany<_RawNewsEventAttributes>).data
    : (raw as RawEntity<_RawNewsEventAttributes>[] | null | undefined);
  if (!Array.isArray(arr)) return null;
  const out: NewsEvent[] = [];
  for (const item of arr) {
    const ne = mapNewsEvent(baseUrl, item);
    if (ne) out.push(ne);
  }
  return out;
}

// Map flattened media
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

function mapFlatPublications(
  baseUrl: string,
  list?: FlatPublication[] | null
): ResearchPublication[] | null {
  if (!Array.isArray(list)) return null;
  return list.map(
    (p): ResearchPublication => ({
      id: p.id,
      title: p.title,
      abstract: p.abstract,
      date: p.date,
      authors: mapFlatAuthors(baseUrl, p.authors) ?? [],
      tags: mapTags(p.tags),
      url: p.url ?? p.URL ?? '',
      file: mapFlatMedia(baseUrl, p.file ?? null),
      project: null,
      lla: !!p.lla,
      publication_type: mapPublicationType(p.publication_type),
      theme: mapTheme(p.theme ?? null),
      country: mapCountry(p.country ?? null),
    })
  );
}

function mapFlatProject(baseUrl: string, raw: FlatProject): Project {
  return {
    id: raw.id,
    shortTitle: raw.shortTitle,
    longTitle: raw.longTitle,
    slug: raw.slug,
    shortDescription: raw.shortDescription,
    longDescription: raw.longDescription,
    about: raw.about,
    objectives: mapObjectives(raw.objectives),
    cover: mapFlatMedia(baseUrl, raw.cover)!,
    images: Array.isArray(raw.images)
      ? (raw.images.map((m) => mapFlatMedia(baseUrl, m)!).filter(Boolean) as StrapiMedia[])
      : null,
    research_publications: mapFlatPublications(baseUrl, raw.research_publications),
    active: !!raw.active,
    programme: !!raw.programme,
    education_trainings: Array.isArray(raw.education_trainings)
      ? (raw.education_trainings.map((et) => ({
          id: et.id,
          title: et.title,
          date: et.date,
          cover: mapFlatMedia(baseUrl, et.cover)!,
          body: et.body,
          type: et.type ? { type: et.type.type } : null,
          lla: !!et.lla,
          project: null,
        })) as EducationTraining[])
      : null,
    news_events: Array.isArray(raw.news_events)
      ? (raw.news_events.map((ne) => ({
          id: ne.id,
          title: ne.title,
          date: ne.date,
          cover: mapFlatMedia(baseUrl, ne.cover)!,
          body: ne.body,
          lla: !!ne.lla,
          projects: null,
        })) as NewsEvent[])
      : null,
  };
}

// Map components
function mapObjectives(raw: RawObjectiveComponent[] | null | undefined): Objective[] | null {
  if (!Array.isArray(raw)) return null;
  return raw
    .map((o) => ({ objective: o?.objective ?? '' }))
    .filter((o) => o.objective.trim().length > 0);
}

function mapTags(raw: RawTagComponent[] | null | undefined): Tag[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.map((t) => ({ tag: t?.tag ?? '' })).filter((t) => t.tag.trim().length > 0);
}

// Map relations
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
      research_publications: null, // avoid deep recursion. Populate on dedicated endpoints if needed
      colocal: !!a.colocal,
    } as Author;
  });
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
    abstract: a.abstract,
    date: a.date, // ISO string
    string_date: a.string_date ?? null,
    authors: mapAuthors(baseUrl, a.authors) ?? [],
    tags: mapTags(a.tags),
    url: a.url,
    file: mapStrapiMedia(baseUrl, a.file),
    project: null, // avoid cycle here; populate via project mapping
    lla: !!a.lla,
    publication_type: mapPublicationType(a.publication_type),
    theme: mapTheme(a.theme ?? null),
    country: mapCountry(a.country ?? null),
  };
}

function mapPublications(
  baseUrl: string,
  raw:
    | RawRelationMany<RawPublicationAttributes>
    | RawEntity<RawPublicationAttributes>[]
    | null
    | undefined
): ResearchPublication[] | null {
  const arr = hasDataKey(raw)
    ? (raw as RawRelationMany<RawPublicationAttributes>).data
    : (raw as RawEntity<RawPublicationAttributes>[] | null | undefined);
  if (!Array.isArray(arr)) return null;
  const out: ResearchPublication[] = [];
  for (const item of arr) {
    const pub = mapPublication(baseUrl, item);
    if (pub) out.push(pub);
  }
  return out;
}

function mapProject(
  baseUrl: string,
  raw: RawEntity<RawProjectAttributes> | null | undefined
): Project | null {
  if (!raw || !raw.id || !raw.attributes) return null;
  const a = raw.attributes;
  const proj: Project = {
    id: raw.id,
    shortTitle: a.shortTitle,
    longTitle: a.longTitle,
    slug: a.slug,
    shortDescription: a.shortDescription,
    longDescription: a.longDescription,
    about: a.about,
    objectives: mapObjectives(a.objectives),
    cover: mapStrapiMedia(baseUrl, a.cover)!,
    images: mapStrapiMultiMedia(baseUrl, a.images),
    research_publications: null, // filled next to break circular assignment issues
    active: !!a.active,
    programme: !!a.programme,
    education_trainings: mapEducationTrainings(baseUrl, a.education_trainings),
    news_events: mapNewsEvents(baseUrl, a.news_events),
  };
  // Map publications now that project exists (without back-reference to project to avoid cycles)
  proj.research_publications = mapPublications(baseUrl, a.research_publications);
  return proj;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const q = getQuery(event) as { slug?: string; summary?: string };
  const baseUrl =
    (config?.strapi?.url as string) ||
    (config?.public?.strapiUrl as string) ||
    'http://localhost:1337';
  const token = (config?.strapi?.token as string) || '';

  // Build Strapi query params
  const query: Record<string, string> = {
    populate: q.summary === 'true' ? 'cover' : '*',
  };
  if (q.slug) {
    query['filters[slug][$eq]'] = String(q.slug);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await $fetch<StrapiListResponseUnion>(`${baseUrl}/api/projects`, {
      method: 'GET',
      headers,
      query,
    });

    let items: Project[] = [];
    if (Array.isArray(res?.data)) {
      const first: unknown = res.data[0];
      if (first && hasAttributes<RawProjectAttributes>(first)) {
        // Raw entity/attributes shape
        const dataRaw = res as StrapiListResponseRaw<RawProjectAttributes>;
        items = dataRaw.data.map((item) => mapProject(baseUrl, item)).filter(Boolean) as Project[];
      } else {
        // Flattened shape
        const dataFlat = res as StrapiListResponseFlat<FlatProject>;
        items = dataFlat.data.map((p) => mapFlatProject(baseUrl, p));
      }
    }

    // If requesting a single project by slug, return the first match or null
    if (q.slug) {
      return items[0] ?? null;
    }
    if (q.summary === 'true') {
      return items.map((item) => ({
        ...item,
        longDescription: '',
        about: '',
        objectives: null,
        images: null,
        research_publications: null,
        news_events: null,
        education_trainings: null,
      }));
    }
    return items;
  } catch (err: unknown) {
    // Surface Strapi errors nicely
    throw createError({
      statusCode: getPropAsNumber(err, 'statusCode') ?? 500,
      statusMessage: 'Failed to fetch projects from Strapi',
      data: {
        message:
          err instanceof Error ? err.message : (getPropAsString(err, 'message') ?? 'Unknown error'),
        details: getProp(err, 'data') ?? null,
      },
    });
  }
});
