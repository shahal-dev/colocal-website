<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ResearchPublication } from '~~/types/content';

/**
 * Resource Hub listing, shared by both layers.
 *
 * The LUCCC layer renders it without `projectSlug` (everything); a project
 * layer passes its slug so only publications tagged with that project show.
 */
const props = defineProps<{
  /** Omit for the LUCCC layer (all publications). */
  projectSlug?: string;
  /** Where an item's detail page lives, e.g. `/resource-hub` or `/projects/colocal/research`. */
  basePath: string;
}>();

const { data: publications, status } = await useAsyncData<ResearchPublication[]>(
  () => `resource-hub:${props.projectSlug || 'all'}`,
  async () => {
    const query = props.projectSlug ? { projectSlug: props.projectSlug } : undefined;
    return ((await $fetch('/api/publications', { query })) as ResearchPublication[]) || [];
  }
);

const items = computed(() =>
  [...(publications.value ?? [])].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
);

const tabs = ['Publications', 'Capacity Building Opportunities', 'Funding Opportunities'];
const activeTab = ref('Publications');

function selectTab(tab: string) {
  activeTab.value = tab;
  page.value = 1;
}

// Search
const q = ref('');
const filtered = computed(() => {
  const tabFiltered = items.value.filter((it) => {
    const typeStr = (it.publication_type?.type || '').toLowerCase();
    if (activeTab.value === 'Capacity Building Opportunities') {
      return typeStr.includes('capacity building');
    }
    if (activeTab.value === 'Funding Opportunities') {
      return typeStr.includes('funding');
    }
    // Publications tab: everything else
    return !typeStr.includes('capacity building') && !typeStr.includes('funding');
  });

  const query = q.value.trim().toLowerCase();
  if (!query) return tabFiltered;

  return tabFiltered.filter((it) => {
    if (it.title.toLowerCase().includes(query)) return true;
    if (it.abstract && it.abstract.toLowerCase().includes(query)) return true;
    if (it.authors_text?.toLowerCase().includes(query)) return true;
    if (it.publication_type?.type?.toLowerCase().includes(query)) return true;
    return false;
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

watch(totalPages, (next) => {
  if (page.value > next) page.value = next;
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
</script>

<template>
  <section class="w-full max-w-6xl mx-auto py-10 px-4 md:px-0">
    <div class="text-center max-w-3xl mx-auto">
      <h1 class="text-[26px] md:text-[30px] font-display font-medium mb-2">Resource Hub</h1>
      <p class="text-gray-600 text-sm md:text-base">
        Resource Hub offers publications, training, and funding to support climate research and
        capacity-building in LDCs.
      </p>
    </div>

    <!-- Tabs -->
    <nav
      class="mt-5 flex flex-wrap items-center justify-center gap-2"
      aria-label="Filter resources by type"
    >
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        class="px-4 py-2 rounded-sm border text-sm transition-colors"
        :class="
          activeTab === tab
            ? 'bg-green-600 border-green-600 text-white shadow-sm'
            : 'bg-white border-gray-300 text-gray-700 hover:border-green-400'
        "
        @click="selectTab(tab)"
      >
        {{ tab }}
      </button>
    </nav>

    <!-- Search -->
    <div class="mt-6 relative">
      <input
        v-model="q"
        type="text"
        placeholder="Search resources"
        class="w-full border rounded-md pl-4 pr-10 py-3 outline-none focus:border-green-600"
      />
      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="7" stroke-width="2" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" />
        </svg>
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="status === 'pending'" class="mt-6 space-y-4" aria-busy="true" aria-live="polite">
      <div class="animate-pulse space-y-4">
        <div v-for="i in 5" :key="i" class="border border-gray-200 rounded-md bg-white p-4 md:p-5">
          <div class="h-5 bg-gray-200 rounded w-3/4 mb-3" />
          <div class="flex items-center gap-2 mb-3">
            <div class="w-4 h-4 bg-gray-200 rounded" />
            <div class="h-4 bg-gray-200 rounded w-1/3" />
          </div>
          <div class="space-y-2 mb-3">
            <div class="h-3 bg-gray-200 rounded" />
            <div class="h-3 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    </div>

    <!-- List -->
    <div v-else class="mt-6 space-y-4">
      <NuxtLink
        v-for="item in visible"
        :key="item.documentId || item.id"
        :to="`${basePath}/${item.documentId || item.id}`"
        class="border border-gray-200 rounded-md bg-white p-0 overflow-hidden block hover:shadow transition-shadow"
      >
        <div class="block p-4 md:p-5">
          <div
            v-if="activeTab === 'Publications' && item.publication_type?.type"
            class="flex items-center gap-2 text-xs mb-2"
          >
            <span
              class="inline-block px-2 py-0.5 rounded border border-blue-200 text-blue-700 bg-blue-50"
            >
              {{ item.publication_type.type }}
            </span>
          </div>
          <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-2">
            {{ item.title }}
          </h3>
          <div v-if="item.authors_text" class="flex items-start text-sm text-gray-600 mb-3">
            <img src="~/assets/user.png" alt="Authors" class="w-4 h-4 mr-1 mt-0.5" />
            <span>{{ item.authors_text }}</span>
          </div>

          <p class="text-sm text-gray-700 mb-3">{{ excerpt(item.abstract, 260) }}</p>
          <div v-if="item.tags?.length" class="flex flex-wrap gap-2">
            <span
              v-for="(tag, idx) in item.tags"
              :key="idx"
              class="inline-block text-xs px-2 py-1 rounded border border-green-200 text-green-700 bg-green-50"
              >{{ tag.tag }}</span
            >
          </div>
        </div>
      </NuxtLink>
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
