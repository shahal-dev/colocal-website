<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from '#app';
import type { Project, ResearchPublication } from '~~/types/content';

// Route + derived project name
const route = useRoute();
const slug = route.params.slug;
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

// Use shared project navbar
const basePath = computed(() => `/projects/${slug}`);
const hasChild = computed(() => Boolean(route.params.id));

// Publications data (fetch via server endpoint filtered by project slug)
const { data: publications } = await useAsyncData<ResearchPublication[]>(
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

const types = ['Journal Article', 'Report', 'Policy Brief', 'Guide'];
const years = [2024, 2023, 2022, 2021];
const themes = ['Finance', 'Resilience', 'Health', 'LLA', 'Ecosystems'];
const countries = ['Bangladesh', 'Nepal', 'Mozambique', 'Regional'];

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase();
  return allPublications.value.filter((p) => {
    if (type.value && p.publication_type.type !== type.value) return false;
    if (year.value) {
      const pubYear = new Date(p.date).getFullYear();
      if (String(pubYear) !== String(year.value)) return false;
    }
    if (theme.value && p.theme?.theme !== theme.value) return false;
    if (country.value && p.country?.name !== country.value) return false;
    if (!query) return true;
    return (
      p.title.toLowerCase().includes(query) ||
      p.authors
        .map((a) => a.name)
        .join(' ')
        .toLowerCase()
        .includes(query) ||
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

function resetFilters() {
  q.value = '';
  type.value = '';
  year.value = '';
  theme.value = '';
  country.value = '';
  page.value = 1;
}
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <NuxtPage v-if="hasChild" />
    <template v-else>
      <!-- Breadcrumb -->
      <BreadCrumb
        :breadcrumb-items="[
          { text: 'Home', href: '/' },
          { text: 'Projects & Programmes', href: '/projects' },
          { text: projectName, href: basePath },
          { text: 'Research & Publications', href: '' },
        ]"
        :page-title="projectName + ' — Research & Publications'"
      />

      <!-- Secondary navbar (links to sibling pages) -->
      <ProjectNavbar :project="project" :slug="String(slug)" />

      <!-- Heading + controls -->
      <section class="w-full max-w-6xl mx-auto py-10 px-4 md:px-0">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-[26px] md:text-[30px] font-display font-medium mb-3">
            Research & Publications
          </h1>
        </div>

        <!-- Search -->
        <div class="mt-6 relative">
          <input
            v-model="q"
            type="text"
            placeholder="Search for Publications"
            class="w-full border rounded-md pl-4 pr-10 py-3 outline-none focus:border-green-600"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="7" stroke-width="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" />
            </svg>
          </span>
        </div>

        <!-- Dropdown filters -->
        <div class="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <select v-model="type" class="w-full border rounded-md px-3 py-2">
              <option value="">Publication Type</option>
              <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <select v-model="year" class="w-full border rounded-md px-3 py-2">
              <option value="">Year</option>
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
          <div>
            <select v-model="theme" class="w-full border rounded-md px-3 py-2">
              <option value="">Theme</option>
              <option v-for="th in themes" :key="th" :value="th">{{ th }}</option>
            </select>
          </div>
          <div>
            <select v-model="country" class="w-full border rounded-md px-3 py-2">
              <option value="">Country</option>
              <option v-for="c in countries" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
        </div>

        <div class="mt-3 text-right">
          <button class="text-sm text-green-700 hover:underline" @click="resetFilters">
            Reset filters
          </button>
        </div>

        <!-- Publications list (reuse card layout) -->
        <div class="mt-6 space-y-4">
          <article
            v-for="p in visible"
            :key="p.id"
            class="border border-gray-200 rounded-md bg-white p-0 overflow-hidden"
          >
            <NuxtLink
              :to="`${basePath}/research/${p.id}`"
              class="block p-4 md:p-5 hover:bg-gray-50"
            >
              <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-2">{{ p.title }}</h3>
              <div class="flex items-center text-sm text-gray-600 mb-3">
                <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87" stroke-width="2" />
                  <circle cx="12" cy="7" r="4" stroke-width="2" />
                </svg>
                <span>{{ p.authors.map((a) => a.name).join(' • ') }}</span>
              </div>
              <p class="text-sm text-gray-700 mb-3">{{ p.abstract }}</p>
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
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
