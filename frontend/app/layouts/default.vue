<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from '#app';

const route = useRoute();
const slug = computed(() => {
  const param = route.params.slug;
  if (typeof param === 'string') return param;
  if (Array.isArray(param)) return param[0] ?? '';
  return '';
});
const isProjectRoute = computed(() => route.path.startsWith('/projects/'));
const showProjectNavbar = computed(() => isProjectRoute.value && Boolean(slug.value));
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <AppNavbar v-if="!isProjectRoute" />
    <ProjectNavbar v-else-if="showProjectNavbar" :slug="slug" />
    <AppNavbar v-else />
    <main class="flex-1"><slot /></main>
    <AppFooter />
  </div>
</template>
