<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

// Route + derived project name
const route = useRoute();
const slug = route.params.slug;
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

// Use shared project navbar
const basePath = computed(() => `/projects/${slug}`);
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
    <ProjectNavbar :project="project" :slug="String(slug)" />

    <!-- About content -->
    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-12">
      <p class="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
        {{ projectName }}
      </p>
      <h1 class="text-[22px] md:text-[26px] font-display font-semibold mb-4">About Us</h1>

      <div v-if="project?.about" class="space-y-4 text-gray-700 leading-relaxed">
        <MDC :value="project?.about" class="prose max-w-none text-gray-800 space-y-6" />
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
