import type { ProjectRef } from '../../types/content';

/**
 * Strapi hands back project relations in several shapes depending on whether the
 * response is raw (`{ data: { id, attributes } }`) or flattened (`{ id, slug, ... }`),
 * and one-to-many relations arrive as arrays. Normalise all of them to a flat list
 * of lightweight refs so pages can filter entries by project.
 */
export function mapProjectRefs(value: unknown): ProjectRef[] | null {
  const entries = collectEntries(value);
  const refs: ProjectRef[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const ref = toRef(entry);
    if (!ref || seen.has(ref.slug)) continue;
    seen.add(ref.slug);
    refs.push(ref);
  }

  return refs.length ? refs : null;
}

function collectEntries(value: unknown): unknown[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== 'object') return [];
  if ('data' in value) return collectEntries((value as { data: unknown }).data);
  return [value];
}

function toRef(entry: unknown): ProjectRef | null {
  if (!entry || typeof entry !== 'object') return null;
  const raw = entry as Record<string, unknown>;
  const source =
    raw.attributes && typeof raw.attributes === 'object'
      ? (raw.attributes as Record<string, unknown>)
      : raw;

  const slug = typeof source.slug === 'string' ? source.slug : '';
  if (!slug) return null;

  const id = typeof raw.id === 'number' ? raw.id : 0;
  const documentId =
    typeof raw.documentId === 'string'
      ? raw.documentId
      : typeof source.documentId === 'string'
        ? source.documentId
        : String(id);
  const shortTitle = typeof source.shortTitle === 'string' ? source.shortTitle : slug;

  return { id, documentId, shortTitle, slug };
}
