<script setup lang="ts">
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

definePageMeta({
  middleware: 'project-data',
});

const route = useRoute();
const slug = route.params.slug;

// Fetch and store the project in shared state for nested pages
const { data } = await useAsyncData<Project | null>(
  () => `project-${slug}`,
  async () => {
    const res = await $fetch('/api/projects', { query: { slug: String(slug) } });
    return (res as Project | null) ?? null;
  }
);
const projectKey = `project:${slug}`;
const shared = useState<Project | null>(projectKey, () => null);
shared.value = data.value ?? null;
</script>

<template>
  <!-- Parent wrapper to provide project state to all nested pages under /projects/[slug] -->
  <NuxtPage />
</template>
