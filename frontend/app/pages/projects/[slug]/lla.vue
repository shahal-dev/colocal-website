<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

// Route + derived project name
const route = useRoute();
const slug = route.params.slug;
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

// Use shared project navbar
const basePath = computed(() => `/projects/${slug}`);

// Fetch LLA publications for this project
const { data: pubsData } = await useAsyncData(
  () => `lla-publications:${slug}`,
  () => $fetch('/api/publications', { params: { projectSlug: String(slug) } })
);
const llaPublications = computed(() => (pubsData.value || []).filter((p) => p.lla));

// Simple pagination for publications
const pageSize = 5;
const page = ref(1);
const totalPages = computed(() =>
  Math.max(1, Math.ceil((llaPublications.value?.length || 0) / pageSize))
);
const visible = computed(() => {
  const start = (page.value - 1) * pageSize;
  return (llaPublications.value || []).slice(start, start + pageSize);
});

// Fetch LLA news & events for this project
const { data: newsData } = await useAsyncData(
  () => `lla-news-events:${slug}`,
  () => $fetch('/api/news-events', { params: { projectSlug: String(slug) } })
);
const llaNewsEvents = computed(() => (newsData.value || []).filter((n) => n.lla));
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <!-- Breadcrumb -->
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'Projects & Programmes', href: '/projects' },
        { text: projectName, href: basePath },
        { text: 'LLA Hub', href: '' },
      ]"
      :page-title="projectName + ' — LLA Hub'"
    />

    <!-- Secondary navbar (links to sibling pages) -->
    <ProjectNavbar :project="project" :slug="String(slug)" />

    <!-- Intro/description -->
    <section class="w-full max-w-6xl mx-auto py-10 px-4 md:px-0">
      <h1 class="text-[26px] md:text-[30px] font-display font-medium mb-3">LLA Hub</h1>
      <p class="text-gray-700 leading-relaxed max-w-3xl">
        The LLA Hub curates practices, knowledge, and tools that support Locally Led Adaptation.
        Explore guidance, case studies, and publications that help operationalize LLA across
        universities and communities.
      </p>
    </section>

    <!-- Publications list (LLA only) -->
    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 pb-12">
      <div class="mt-6 space-y-4">
        <article
          v-for="p in visible"
          :key="p.id"
          class="border border-gray-200 rounded-md bg-white p-4 md:p-5"
        >
          <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-2">{{ p.title }}</h3>
          <div class="flex items-center text-sm text-gray-600 mb-3">
            <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87" stroke-width="2" />
              <circle cx="12" cy="7" r="4" stroke-width="2" />
            </svg>
            <span>{{ (p.authors || []).map((a) => a.name).join(' • ') }}</span>
          </div>
          <p class="text-sm text-gray-700 mb-3">{{ p.abstract }}</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(tag, idx) in p.tags || []"
              :key="idx"
              class="inline-block text-xs px-2 py-1 rounded border border-green-200 text-green-700 bg-green-50"
              >{{ tag.tag }}</span
            >
          </div>
        </article>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-2">
        <button
          v-for="i in totalPages"
          :key="i"
          class="min-w-[32px] h-7 px-2 text-sm rounded border"
          :class="
            i === page
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-800 border-gray-300'
          "
          @click="page = i"
        >
          {{ i }}
        </button>
      </div>
    </section>

    <!-- News and Events (LLA only) -->
    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 pb-12">
      <h2 class="text-[22px] md:text-[26px] font-display font-semibold mb-4">News and Events</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article
          v-for="e in llaNewsEvents"
          :key="e.id"
          class="border border-gray-200 rounded-md bg-white p-3 md:p-4 flex gap-4 items-start"
        >
          <div class="w-36 h-24 flex-shrink-0 rounded overflow-hidden">
            <img :src="e.cover?.url" :alt="e.title" class="w-full h-full object-cover" >
          </div>
          <div>
            <h3 class="text-[16px] font-semibold text-green-800 mb-1">{{ e.title }}</h3>
            <p class="text-sm text-gray-700 line-clamp-3">{{ e.body }}</p>
          </div>
        </article>
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
