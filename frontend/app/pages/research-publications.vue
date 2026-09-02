<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from '#app';
import type { ResearchPublication } from '~~/types/content';

useHead({
  title: 'Research & Publications — LUCCC',
});

// Nested route check for /research-publications/:id
const route = useRoute();
const hasChild = computed(() => Boolean(route.params.id));

// Fetch all publications across the consortium
const { data: publications, status } = await useAsyncData<ResearchPublication[]>(
  'all-publications',
  async () =>
    (await $fetch('/api/publications', { query: { summary: 'true' } })) as ResearchPublication[]
);
const allPublications = computed(() => publications.value ?? []);

// Type tabs mirror the project layer: everything that is not a known type falls
// under "Others" — which is where capacity building and funding opportunities live.
const types = ['Journal Publications', 'Policy Brief', 'Thesis', 'Others'];
const knownTypes = ['journal publications', 'policy brief', 'thesis'];
const typeTabs = computed(() => ['All', ...types]);

const type = ref('');
const projectSlug = ref('');
const q = ref('');

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase();
  return allPublications.value.filter((p) => {
    if (type.value) {
      const pubType = p.publication_type?.type?.toLowerCase() || '';
      if (type.value === 'Others') {
        if (knownTypes.includes(pubType)) return false;
      } else if (pubType !== type.value.toLowerCase()) {
        return false;
      }
    }
    if (projectSlug.value) {
      const refs = p.projectRefs ?? [];
      if (!refs.some((ref) => ref.slug === projectSlug.value)) return false;
    }
    if (!query) return true;
    return (
      p.title.toLowerCase().includes(query) ||
      (p.authors_text ? p.authors_text.toLowerCase().includes(query) : false) ||
      (p.abstract ? p.abstract.toLowerCase().includes(query) : false) ||
      (p.publication_type?.type ? p.publication_type.type.toLowerCase().includes(query) : false)
    );
  });
});

// Pagination
const pageSize = 15;
const page = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const visible = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

watch([type, projectSlug, q], () => {
  page.value = 1;
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = page.value;
  const delta = 2; // Number of pages to show before and after the current page

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let left = Math.max(2, current - delta);
  let right = Math.min(total - 1, current + delta);

  if (current - 1 <= delta) {
    right = Math.min(total - 1, 1 + delta * 2);
  }
  if (total - current <= delta) {
    left = Math.max(2, total - delta * 2);
  }

  const pages: (number | string)[] = [];

  pages.push(1);

  if (left > 2) {
    pages.push('...');
  }

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  if (right < total - 1) {
    pages.push('...');
  }

  pages.push(total);

  return pages;
});

function selectType(tab: string) {
  type.value = tab === 'All' ? '' : tab;
}

function isActiveType(tab: string) {
  return tab === 'All' ? type.value === '' : type.value === tab;
}
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <NuxtPage v-if="hasChild" />
    <template v-else>
      <BreadCrumb
        :breadcrumb-items="[
          { text: 'Home', href: '/' },
          { text: 'Research & Publications', href: '/research-publications' },
        ]"
        page-title="Research & Publications"
      />

      <section class="w-full max-w-6xl mx-auto py-10 px-4 md:px-0">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-[26px] md:text-[30px] font-display font-medium mb-2">
            Research & Publications
          </h1>
          <p class="text-gray-600 text-sm md:text-base">
            Publications, capacity building and funding opportunities supporting climate research
            across the LUCCC consortium.
          </p>
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

        <!-- Project filter -->
        <ProjectFilter v-model="projectSlug" :items="allPublications" class="mt-4" />

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

        <!-- Loading state -->
        <div v-if="status === 'pending'" class="mt-6 space-y-4" aria-busy="true" aria-live="polite">
          <div class="animate-pulse space-y-4">
            <div
              v-for="i in 5"
              :key="i"
              class="border border-gray-200 rounded-md bg-white p-4 md:p-5"
            >
              <div class="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div class="space-y-2 mb-3">
                <div class="h-3 bg-gray-200 rounded" />
                <div class="h-3 bg-gray-200 rounded w-5/6" />
              </div>
              <div class="flex gap-2">
                <div class="h-6 w-16 bg-gray-200 rounded" />
                <div class="h-6 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>

        <!-- Publications list -->
        <div v-else class="mt-6 space-y-4">
          <NuxtLink
            v-for="p in visible"
            :key="p.id"
            :to="`/research-publications/${p.documentId || p.id}`"
            class="border border-gray-200 rounded-md bg-white p-0 overflow-hidden block hover:shadow transition-shadow"
          >
            <div class="block p-4 md:p-5">
              <div v-if="p.publication_type?.type" class="flex items-center gap-2 text-xs mb-2">
                <span
                  class="inline-block px-2 py-0.5 rounded border border-blue-200 text-blue-700 bg-blue-50"
                >
                  {{ p.publication_type.type }}
                </span>
              </div>
              <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-2">
                {{ p.title }}
              </h3>
              <div v-if="p.authors_text" class="flex items-start text-sm text-gray-600 mb-3">
                <img src="~/assets/user.png" alt="Authors" class="w-4 h-4 mr-1 mt-0.5" />
                <span>{{ p.authors_text }}</span>
              </div>

              <p class="text-sm text-gray-700 mb-3">{{ excerpt(p.abstract, 260) }}</p>
              <div v-if="p.tags?.length" class="flex flex-wrap gap-2">
                <span
                  v-for="(tag, idx) in p.tags"
                  :key="idx"
                  class="inline-block text-xs px-2 py-1 rounded border border-green-200 text-green-700 bg-green-50"
                  >{{ tag.tag }}</span
                >
              </div>
            </div>
          </NuxtLink>

          <p v-if="!visible.length" class="text-center text-gray-600 py-10">
            No publications match the current filters.
          </p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-2">
          <!-- Previous Button -->
          <button
            type="button"
            class="min-w-[32px] h-7 px-2 text-sm rounded border bg-white text-gray-800 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="page === 1"
            @click="page > 1 && page--"
          >
            &laquo;
          </button>

          <template v-for="(p, idx) in visiblePages" :key="idx">
            <span v-if="p === '...'" class="text-gray-500 px-1">...</span>
            <button
              v-else
              type="button"
              class="min-w-[32px] h-7 px-2 text-sm rounded border transition-colors"
              :class="
                p === page
                  ? 'bg-green-600 text-white border-green-600 shadow-sm'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-green-400'
              "
              @click="page = Number(p)"
            >
              {{ p }}
            </button>
          </template>

          <!-- Next Button -->
          <button
            type="button"
            class="min-w-[32px] h-7 px-2 text-sm rounded border bg-white text-gray-800 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="page === totalPages"
            @click="page < totalPages && page++"
          >
            &raquo;
          </button>
        </div>
      </section>
    </template>
  </div>
</template>
