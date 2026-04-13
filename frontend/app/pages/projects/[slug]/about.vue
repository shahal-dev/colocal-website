<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

// Route + derived project name
const route = useRoute();
const slug = route.params.slug;
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

const hasChild = computed(() => Boolean(route.params.country));

useHead({
  title: projectName.value ? `${projectName.value} — About` : 'About — LUCCC',
});

// Use shared project navbar
const _basePath = computed(() => `/projects/${slug}`);
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <NuxtPage v-if="hasChild" />
    <template v-else>
      <!-- Breadcrumb -->
      <!-- <BreadCrumb
        :breadcrumb-items="[
          { text: 'Home', href: '/' },
          { text: 'Projects & Programmes', href: '/projects' },
          { text: projectName, href: basePath },
          { text: 'About', href: '' },
        ]"
        :page-title="projectName + ' — About'"
      /> -->

      <!-- Secondary navbar (links to sibling pages) -->
      <!-- <ProjectNavbar :project="project" :slug="String(slug)" /> -->

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

      <!-- South Partners -->
      <section class="w-full max-w-6xl mx-auto px-4 md:px-0 pb-16">
        <h2 class="text-center text-[22px] md:text-[26px] font-display font-semibold mb-8">
          South Partners
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Bangladesh -->
          <NuxtLink
            :to="`/projects/${slug}/about/bangladesh`"
            class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div class="w-32 h-24 mb-4 flex items-center justify-center">
              <img
                src="https://flagcdn.com/w320/bd.png"
                alt="Bangladesh Flag"
                class="max-w-full max-h-full object-contain"
              >
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Bangladesh</h3>
            <p class="text-sm text-gray-600">Independent University, Bangladesh</p>
          </NuxtLink>

          <!-- Mozambique -->
          <NuxtLink
            :to="`/projects/${slug}/about/mozambique`"
            class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div class="w-32 h-24 mb-4 flex items-center justify-center">
              <img
                src="https://flagcdn.com/w320/mz.png"
                alt="Mozambique Flag"
                class="max-w-full max-h-full object-contain"
              >
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Mozambique</h3>
            <p class="text-sm text-gray-600">Eduardo Mondlane University</p>
          </NuxtLink>

          <!-- Nepal -->
          <NuxtLink
            :to="`/projects/${slug}/about/nepal`"
            class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div class="w-32 h-24 mb-4 flex items-center justify-center">
              <img
                src="https://flagcdn.com/w320/np.png"
                alt="Nepal Flag"
                class="max-w-full max-h-full object-contain"
              >
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Nepal</h3>
            <p class="text-sm text-gray-600">Pokhara University</p>
          </NuxtLink>

          <!-- Uganda -->
          <NuxtLink
            :to="`/projects/${slug}/about/uganda`"
            class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div class="w-32 h-24 mb-4 flex items-center justify-center">
              <img
                src="https://flagcdn.com/w320/ug.png"
                alt="Uganda Flag"
                class="max-w-full max-h-full object-contain"
              >
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Uganda</h3>
            <p class="text-sm text-gray-600">Makerere University</p>
          </NuxtLink>
        </div>
      </section>

      <!-- North Partners -->
      <section class="w-full max-w-6xl mx-auto px-4 md:px-0 pb-8">
        <h2 class="text-center text-[22px] md:text-[26px] font-display font-semibold mb-8">
          North Partner
        </h2>
        <div class="flex flex-wrap gap-8 items-center justify-center">
          <!-- Norway -->
          <NuxtLink
            :to="`/projects/${slug}/about/norway`"
            class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div class="w-32 h-24 mb-4 flex items-center justify-center">
              <img
                src="https://flagcdn.com/w320/no.png"
                alt="Norway Flag"
                class="max-w-full max-h-full object-contain"
              >
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Norway</h3>
            <p class="text-sm text-gray-600">Norwegian University of Life Sciences</p>
          </NuxtLink>
        </div>
      </section>

      <!-- <section class="w-full">
        <ProjectWorldMap />
      </section> -->
    </template>
  </div>
</template>
