<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

// Route + derived project name
const route = useRoute();
const slug = route.params.slug;
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

// Secondary navbar (links to sibling pages under the slug)
const basePath = computed(() => `/projects/${slug}`);
const tabs = computed(() => [
  { key: 'home', label: 'Home', to: basePath.value },
  {
    key: 'about',
    label: 'About ' + (project.value?.shortTitle || 'Project'),
    to: `${basePath.value}/about`,
  },
  { key: 'education', label: 'Education & Training', to: `${basePath.value}/education` },
  { key: 'research', label: 'Research & Publications', to: `${basePath.value}/research` },
  { key: 'outreach', label: 'Outreach', to: `${basePath.value}/outreach` },
  { key: 'lla', label: 'LLA Hub', to: `${basePath.value}/lla` },
]);
const isActive = (to: string) => route.path === to;
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <!-- Breadcrumb -->
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'Projects & Programmes', href: '/projects' },
        { text: projectName, href: basePath },
        { text: 'About', href: '' },
      ]"
      :page-title="projectName + ' — About'"
    />

    <!-- Secondary navbar (links to sibling pages) -->
    <div class="w-full border-b sticky top-0 z-20 bg-white/95 backdrop-blur">
      <nav class="max-w-6xl flex items-center gap-2 px-25 overflow-x-auto hide-scrollbar">
        <NuxtLink
          v-for="t in tabs"
          :key="t.key"
          :to="t.to"
          class="px-4 py-3 text-base font-semibold whitespace-nowrap"
          :class="
            isActive(t.to)
              ? 'bg-green-100 text-green-900 border-b-2 border-green-700'
              : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
          "
        >
          {{ t.label }}
        </NuxtLink>
      </nav>
    </div>

    <!-- About content -->
    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-12">
      <p class="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
        {{ projectName }}
      </p>
      <h1 class="text-[22px] md:text-[26px] font-display font-semibold mb-4">About Us</h1>

      <div v-if="project?.about" class="space-y-4 text-gray-700 leading-relaxed">
        <p>{{ project?.about }}</p>
      </div>
    </section>

    <!-- Objectives -->
    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 pb-16">
      <h2 class="text-center text-[22px] md:text-[26px] font-display font-semibold mb-6">
        Objectives
      </h2>
      <div v-if="project?.objectives" class="space-y-4">
        <div
          v-for="objective in project?.objectives || []"
          :key="project?.objectives.indexOf(objective)"
          class="bg-gray-50 border border-gray-200 rounded-md p-4 md:p-5 text-gray-800"
        >
          {{ objective.objective }}
        </div>
      </div>
    </section>
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
</style>
