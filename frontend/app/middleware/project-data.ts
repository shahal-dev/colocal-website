import { defineNuxtRouteMiddleware, useState, useAsyncData } from '#app';
import type { Project } from '~~/types/content';

export default defineNuxtRouteMiddleware(async (to) => {
  const param = to.params.slug;
  const slug = typeof param === 'string' ? param : Array.isArray(param) ? (param[0] ?? '') : '';
  if (!slug) return;

  const shared = useState<Project | null>(`project:${slug}`, () => null);
  const { data } = await useAsyncData<Project | null>(`project-${slug}`, async () => {
    const res = await $fetch('/api/projects', { query: { slug } });
    return (res as Project | null) ?? null;
  });
  shared.value = data.value ?? null;
});
