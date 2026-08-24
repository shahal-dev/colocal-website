import { defineEventHandler, setHeader } from 'h3';
import { useRuntimeConfig } from '#imports';

const SITE_URL = 'https://www.luccc.org';

type Entry = { loc: string; lastmod?: string; changefreq?: string; priority?: string };

type RawEntity<T> = { id?: number | string; documentId?: string; attributes?: T } & Partial<T>;
type StrapiList<T> = { data?: RawEntity<T>[] };

type ProjectAttrs = { slug?: string | null; updatedAt?: string | null };
type ResourceAttrs = {
  updatedAt?: string | null;
  project?: { data?: RawEntity<ProjectAttrs> | null } | RawEntity<ProjectAttrs> | null;
};

function getAttr<T extends object, K extends keyof T>(
  item: RawEntity<T> | null | undefined,
  key: K
): T[K] | undefined {
  if (!item) return undefined;
  if (item.attributes && key in item.attributes) return item.attributes[key];
  return (item as Partial<T>)[key];
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toIsoDate(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function renderSitemap(entries: Entry[]): string {
  const urls = entries
    .map((entry) => {
      const parts = [`    <loc>${xmlEscape(entry.loc)}</loc>`];
      if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      if (entry.priority) parts.push(`    <priority>${entry.priority}</priority>`);
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function fetchList<T extends object>(
  baseUrl: string,
  path: string,
  headers: Record<string, string>
): Promise<RawEntity<T>[]> {
  try {
    const res = await $fetch<StrapiList<T>>(`${baseUrl}${path}`, { headers });
    return Array.isArray(res?.data) ? res.data : [];
  } catch {
    return [];
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const baseUrl =
    (config?.strapi?.url as string) ||
    (config?.public?.strapiUrl as string) ||
    'http://localhost:1337';
  const token = (config?.strapi?.token as string) || '';
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const entries: Entry[] = [];
  const seen = new Set<string>();
  const push = (entry: Entry) => {
    if (seen.has(entry.loc)) return;
    seen.add(entry.loc);
    entries.push(entry);
  };

  // Static routes
  const staticRoutes: Array<Omit<Entry, 'loc'> & { path: string }> = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/about', changefreq: 'monthly', priority: '0.9' },
    { path: '/about/team', changefreq: 'monthly', priority: '0.7' },
    { path: '/about/universities', changefreq: 'monthly', priority: '0.7' },
    { path: '/projects', changefreq: 'weekly', priority: '0.9' },
    { path: '/education-training', changefreq: 'weekly', priority: '0.8' },
    { path: '/research-publications', changefreq: 'weekly', priority: '0.8' },
    { path: '/outreach', changefreq: 'weekly', priority: '0.8' },
    { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  ];
  for (const r of staticRoutes) {
    push({ loc: `${SITE_URL}${r.path}`, changefreq: r.changefreq, priority: r.priority });
  }

  // Dynamic content
  const [projects, publications, newsEvents, educationTrainings] = await Promise.all([
    fetchList<ProjectAttrs>(baseUrl, '/api/projects?pagination[limit]=100', headers),
    fetchList<ResourceAttrs>(
      baseUrl,
      '/api/research-publications?pagination[limit]=1000&populate=project',
      headers
    ),
    fetchList<ResourceAttrs>(
      baseUrl,
      '/api/news-events?pagination[limit]=1000&populate=project',
      headers
    ),
    fetchList<ResourceAttrs>(
      baseUrl,
      '/api/education-trainings?pagination[limit]=1000&populate=project',
      headers
    ),
  ]);

  // Project pages
  const projectSubpages = ['', '/about', '/research', '/outreach', '/education', '/team', '/blog'];
  for (const project of projects) {
    const slug = getAttr(project, 'slug');
    if (typeof slug !== 'string' || !slug) continue;
    const lastmod = toIsoDate(getAttr(project, 'updatedAt'));
    for (const sub of projectSubpages) {
      push({
        loc: `${SITE_URL}/projects/${slug}${sub}`,
        lastmod,
        changefreq: 'weekly',
        priority: sub === '' ? '0.8' : '0.6',
      });
    }
  }

  // Publications: canonical URL is always the research-publications copy — the
  // project-nested copy (when it exists) carries a canonical tag pointing
  // here, so it's deliberately left out of the sitemap.
  for (const pub of publications) {
    const id = pub.documentId || pub.id;
    if (id == null) continue;
    const lastmod = toIsoDate(getAttr(pub, 'updatedAt'));
    push({
      loc: `${SITE_URL}/research-publications/${id}`,
      lastmod,
      changefreq: 'monthly',
      priority: '0.5',
    });
  }

  // News-events: canonical URL is the LUCCC-layer copy — /blog for blog
  // posts, /outreach for everything else. Same reasoning as publications above.
  for (const news of newsEvents) {
    const id = news.documentId || news.id;
    if (id == null) continue;
    const lastmod = toIsoDate(getAttr(news, 'updatedAt'));
    const section = getAttr(news, 'blog') ? 'blog' : 'outreach';
    push({
      loc: `${SITE_URL}/${section}/${id}`,
      lastmod,
      changefreq: 'monthly',
      priority: '0.6',
    });
  }

  // Education/training: canonical URL is always the education-training
  // copy — the project-nested and research-publications copies both canonicalize
  // here, so neither is listed separately.
  for (const edu of educationTrainings) {
    const id = edu.documentId || edu.id;
    if (id == null) continue;
    const lastmod = toIsoDate(getAttr(edu, 'updatedAt'));
    push({
      loc: `${SITE_URL}/education-training/${id}`,
      lastmod,
      changefreq: 'monthly',
      priority: '0.6',
    });
  }

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  setHeader(event, 'Cache-Control', 'public, max-age=3600');
  return renderSitemap(entries);
});
