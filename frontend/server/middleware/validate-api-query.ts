import { createError, defineEventHandler, getQuery, getRequestURL } from 'h3';

const ALLOWED_QUERY_PARAMS: Record<string, Set<string>> = {
  '/api/projects': new Set(['slug', 'summary']),
  '/api/publications': new Set([
    'project',
    'projectSlug',
    'projectId',
    'id',
    'pageSize',
    'summary',
  ]),
  '/api/news-events': new Set([
    'project',
    'projectSlug',
    'projectId',
    'id',
    'blog',
    'pageSize',
    'summary',
  ]),
  '/api/education-trainings': new Set([
    'project',
    'projectSlug',
    'projectId',
    'id',
    'pageSize',
    'summary',
  ]),
  '/api/authors': new Set(['colocal', 'team', 'pageSize', 'sort']),
  '/api/about': new Set(),
  '/api/global': new Set(),
};

function isValidValue(key: string, value: string): boolean {
  if (key === 'summary') return value === 'true';
  if (key === 'blog' || key === 'colocal' || key === 'team') {
    return value === 'true' || value === 'false';
  }
  if (key === 'pageSize') {
    return /^[1-9]\d{0,2}$/.test(value) && Number(value) <= 500;
  }
  if (key === 'projectId') return /^[1-9]\d*$/.test(value);
  if (key === 'sort') return value === 'name:asc' || value === 'name:desc';
  if (key === 'slug' || key === 'project' || key === 'projectSlug') {
    return value.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(value);
  }
  if (key === 'id') return value.length <= 128 && /^[a-z0-9_-]+$/i.test(value);
  return false;
}

/**
 * Prevent arbitrary cache-busting query parameters from turning otherwise
 * cacheable public endpoints into unlimited Strapi requests.
 */
export default defineEventHandler((event) => {
  const pathname = getRequestURL(event).pathname;
  const allowed = ALLOWED_QUERY_PARAMS[pathname];
  if (!allowed) return;

  const query = getQuery(event);
  const unknown = Object.keys(query).filter((key) => !allowed.has(key));
  if (unknown.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unsupported query parameter: ${unknown[0]}`,
    });
  }

  for (const [key, rawValue] of Object.entries(query)) {
    if (Array.isArray(rawValue) || !isValidValue(key, String(rawValue))) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid query parameter: ${key}`,
      });
    }
  }
});
