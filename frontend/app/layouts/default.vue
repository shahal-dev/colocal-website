<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

const route = useRoute();
const slug = route.params.slug as string;
const hideNavbar = computed(() => route.path.startsWith('/projects/'));
const project = useState<Project | null>(`project:${slug}`, () => null);
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <AppNavbar v-if="!hideNavbar" />
    <ProjectNavbar v-if="hideNavbar" :project="project" :slug="String(slug)" />
    <main class="flex-1"><slot /></main>
    <AppFooter />
  </div>
</template>
