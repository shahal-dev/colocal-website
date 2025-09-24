import { useRoute, useState } from '#imports';
import type { Project } from '~~/types/content';

/**
 * Access the shared Project state for the current dynamic project slug route.
 * Parent page sets this state; children (e.g. /projects/[slug]/about) can read it.
 */
export function useProject() {
  const route = useRoute();
  const slug = String(route.params.slug || '');
  const key = `project:${slug}`;
  const state = useState<Project | null>(key, () => null);
  return state;
}
