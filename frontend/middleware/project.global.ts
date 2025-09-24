import { defineNuxtRouteMiddleware, useState, useRequestFetch } from '#app';
import type { RouteLocationNormalized } from 'vue-router';
import type { Project } from '../types/content';

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Only run for project routes: /projects/:slug and any nested paths
  if (!to.path.startsWith('/projects/')) return;

  const slugParam = to.params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  if (!slug) return;

  const key = `project:${slug}`;
  const state = useState<Project | null>(key, () => null);
  // Avoid refetching if already loaded for this slug
  if (state.value && state.value.slug === slug) return;

  try {
    const $f = useRequestFetch();
    const proj = await $f<Project | null>('/api/projects', { query: { slug: String(slug) } });
    state.value = proj ?? null;
  } catch {
    state.value = null;
  }
});
