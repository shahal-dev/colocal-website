<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

// Route + derived project name
const route = useRoute();
const slug = String(route.params.slug ?? '');
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

useHead(() => ({
  title: `Resource Hub — ${projectName.value}`,
}));

const basePath = computed(() => `/projects/${slug}`);
const hasChild = computed(() => Boolean(route.params.id));
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <NuxtPage v-if="hasChild" />
    <template v-else>
      <!-- Project layer: same Resource Hub, filtered to this project's tag -->
      <ResourceHubList :project-slug="slug" :base-path="`${basePath}/research`" />
    </template>
  </div>
</template>
