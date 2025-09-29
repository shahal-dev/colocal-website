<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

interface Props {
  project?: Partial<Project> | null;
  slug: string;
}

const props = defineProps<Props>();
const route = useRoute();

// Compute project name from props or fallback
const projectName = computed(() => props.project?.shortTitle || 'Project');

// Secondary navbar (links to sibling pages under the slug)
const basePath = computed(() => `/projects/${props.slug}`);
const tabs = computed(() => [
  { key: 'home', label: 'Home', to: basePath.value },
  { key: 'about', label: 'About ' + projectName.value, to: `${basePath.value}/about` },
  { key: 'education', label: 'Education & Training', to: `${basePath.value}/education` },
  { key: 'research', label: 'Research & Publications', to: `${basePath.value}/research` },
  { key: 'outreach', label: 'Outreach', to: `${basePath.value}/outreach` },
  { key: 'lla', label: 'LLA Hub', to: `${basePath.value}/lla` },
]);

// Check if current route matches the tab
const isActive = (to: string) => {
  // For exact match on home page
  if (to === basePath.value) {
    return route.path === to;
  }
  // For other pages, check if route starts with the path
  return route.path.startsWith(to);
};
</script>

<template>
  <div class="w-full sticky top-0 z-20 bg-white/95 backdrop-blur mb-8">
    <nav
      class="max-w-6xl mx-auto flex items-center gap-2 px-4 md:px-6 lg:px-8 overflow-x-auto hide-scrollbar"
    >
      <NuxtLink
        v-for="t in tabs"
        :key="t.key"
        :to="t.to"
        class="px-4 py-3 text-sm md:text-base font-semibold whitespace-nowrap transition-colors duration-200"
        :class="
          isActive(t.to)
            ? 'bg-green-100 text-green-900 border-b-2 border-green-700'
            : 'bg-white text-gray-700 border-gray-300 hover:border-green-300 hover:text-green-700'
        "
      >
        {{ t.label }}
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Responsive improvements */
@media (max-width: 640px) {
  nav {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 480px) {
  nav {
    gap: 0.25rem;
  }

  .nav-link {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
