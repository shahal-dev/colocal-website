<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from '#app';
import type { Project, ResearchPublication } from '~~/types/content';

// Route + derived project name
const route = useRoute();
const slug = route.params.slug;
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

useHead({
  title: projectName.value
    ? `${projectName.value} — Research & Publications`
    : 'Research & Publications — LUCCC',
});

function excerpt(text?: string | null, n = 180) {
  if (!text) return '';
  const t = String(text);
  return t.length > n ? t.slice(0, n) + '…' : t;
}

// Use shared project navbar
const basePath = computed(() => `/projects/${slug}`);
const hasChild = computed(() => Boolean(route.params.id));

// Publications data (fetch via server endpoint filtered by project slug)
const { data: publications, status } = await useAsyncData<ResearchPublication[]>(
  () => `publications-${slug}`,
  async () => {
    const res = await $fetch('/api/publications', { query: { projectSlug: String(slug) } });
    return (res as ResearchPublication[]) || [];
  }
);
const allPublications = computed(() => publications.value ?? []);

// Filters
const q = ref('');
const type = ref('');
const year = ref('');
const theme = ref('');
const country = ref('');

const types = ['Journal Publications', 'Policy Brief', 'Thesis', 'Others'];
const typeTabs = computed(() => ['All', ...types]);
// const years = [2024, 2023, 2022, 2021];
// const themes = ['Finance', 'Resilience', 'Health', 'LLA', 'Ecosystems'];
// const countries = ['Bangladesh', 'Nepal', 'Mozambique', 'Regional'];

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase();
  return allPublications.value.filter((p) => {
    if (type.value) {
      const pubType = p.publication_type?.type?.toLowerCase() || '';
      if (type.value === 'Others') {
        const knownTypes = ['journal publications', 'policy brief', 'thesis'];
        if (knownTypes.includes(pubType)) return false;
      } else if (pubType !== type.value.toLowerCase()) {
        return false;
      }
    }
    if (year.value) {
      const pubYear = new Date(p.date).getFullYear();
      if (String(pubYear) !== String(year.value)) return false;
    }
    if (theme.value && p.theme?.theme !== theme.value) return false;
    if (country.value && p.country?.name !== country.value) return false;
    if (!query) return true;
    return (
      p.title.toLowerCase().includes(query) ||
      (p.authors_text && p.authors_text.toLowerCase().includes(query)) ||
      (p.abstract && p.abstract.toLowerCase().includes(query))
    );
  });
});

const pageSize = 5;
const page = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const visible = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

// function resetFilters() {
//   q.value = '';
//   type.value = '';
//   year.value = '';
//   theme.value = '';
//   country.value = '';
//   page.value = 1;
// }

function selectType(tab: string) {
  type.value = tab === 'All' ? '' : tab;
  page.value = 1;
}

function isActiveType(tab: string) {
  return tab === 'All' ? type.value === '' : type.value === tab;
}
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
          { text: 'Research & Publications', href: '' },
        ]"
        :page-title="projectName + ' — Research & Publications'"
      /> -->

      <!-- Secondary navbar (links to sibling pages) -->
      <!-- <ProjectNavbar :project="project" :slug="String(slug)" /> -->

      <!-- Heading + controls -->
      <section class="w-full max-w-6xl mx-auto py-10 px-4 md:px-0">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-[26px] md:text-[30px] font-display font-medium mb-3">
            Research & Publications
          </h1>
        </div>

        <!-- Type tabs -->
        <nav
          class="mt-5 flex flex-wrap items-center justify-center gap-2"
          aria-label="Filter publications by type"
        >
          <button
            v-for="tab in typeTabs"
            :key="tab"
            type="button"
            class="px-4 py-2 rounded-sm border text-sm transition-colors"
            :class="
              isActiveType(tab)
                ? 'bg-green-600 border-green-600 text-white shadow-sm'
                : 'bg-white border-gray-300 text-gray-700 hover:border-green-400'
            "
            @click="selectType(tab)"
          >
            {{ tab }}
          </button>
        </nav>

        <!-- Search -->
        <div class="mt-6 relative">
          <input
            v-model="q"
            type="text"
            placeholder="Search for Publications"
            class="w-full border rounded-md pl-4 pr-10 py-3 outline-none focus:border-green-600"
          >
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="7" stroke-width="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" />
            </svg>
          </span>
        </div>

        <!-- <div class="mt-3 text-right">
          <button class="text-sm text-green-700 hover:underline" @click="resetFilters">
            Reset filters
          </button>
        </div> -->

        <!-- Loading State -->
        <div v-if="status === 'pending'" class="mt-6 space-y-4" aria-busy="true" aria-live="polite">
          <div class="flex items-center justify-center py-6">
            <svg
              class="animate-spin h-6 w-6 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span class="sr-only">Loading</span>
          </div>

          <div class="animate-pulse space-y-4">
            <!-- Skeleton Publication Cards -->
            <div
              v-for="i in 5"
              :key="i"
              class="border border-gray-200 rounded-md bg-white p-4 md:p-5"
            >
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div class="flex items-center gap-2 mb-3">
                <div class="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
              <div class="space-y-2 mb-3">
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
              </div>
              <div class="flex gap-2">
                <div class="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div class="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div class="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </div>

        <!-- Publications list (reuse card layout) -->
        <div v-else class="mt-6 space-y-4">
          <article
            v-for="p in visible"
            :key="p.id"
            class="border border-gray-200 rounded-md bg-white p-0 overflow-hidden"
          >
            <NuxtLink
              :to="`${basePath}/research/${p.documentId || p.id}`"
              class="block p-4 md:p-5 hover:bg-gray-50"
            >
              <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-2">{{ p.title }}</h3>
              <div v-if="p.authors_text" class="flex items-start text-sm text-gray-600 mb-3">
                <img
                  src="~/assets/user.png"
                  alt="Authors"
                  class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                >
                <span class="line-clamp-2">{{ p.authors_text }}</span>
              </div>
              <p class="text-sm text-gray-700 mb-3">{{ excerpt(p.abstract, 300) }}</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(tag, idx) in p.tags"
                  :key="idx"
                  class="inline-block text-xs px-2 py-1 rounded border border-green-200 text-green-700 bg-green-50"
                  >{{ tag.tag }}</span
                >
              </div>
            </NuxtLink>
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
    </template>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
