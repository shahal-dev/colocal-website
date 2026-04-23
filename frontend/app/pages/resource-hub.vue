<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from '#app';
import type { ResearchPublication } from '~~/types/content';

useHead({
  title: 'Resource Hub — LUCCC',
});

type HubItem = {
  kind: 'publication' | 'education';
  id: number | string;
  date: string;
  title: string;
  summary: string;
  authors_text?: string | null;
  tags?: { tag: string }[] | null;
  eduType?: string | null;
  pubType?: string | null;
};

// Nested route check for /resource-hub/:id
const route = useRoute();
const hasChild = computed(() => Boolean(route.params.id));

// Fetch all publications and education/training entries
const { data: publications } = await useAsyncData<ResearchPublication[]>(
  'hub-publications',
  async () => (await $fetch('/api/publications')) as ResearchPublication[]
);

const items = computed<HubItem[]>(() => {
  const pubs = (publications.value ?? []).map<HubItem>((p) => ({
    kind: 'publication',
    id: p.documentId || p.id,
    date: p.date,
    title: p.title,
    summary: p.abstract || '',
    authors_text: p.authors_text ?? null,
    tags: p.tags ?? null,
    pubType: p.publication_type?.type ?? null,
  }));
  return pubs.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
});

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
    const typeStr = (it.pubType || '').toLowerCase();
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
    if (it.summary && it.summary.toLowerCase().includes(query)) return true;
    if (it.kind === 'publication' && it.authors_text?.toLowerCase().includes(query)) return true;
    if (it.kind === 'education' && (it.eduType || '').toLowerCase().includes(query)) return true;
    if (it.pubType && it.pubType.toLowerCase().includes(query)) return true;
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

function excerpt(text?: string | null, n = 260) {
  if (!text) return '';
  const t = String(text);
  return t.length > n ? t.slice(0, n) + '…' : t;
}
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <NuxtPage v-if="hasChild" />
    <template v-else>
      <BreadCrumb
        :breadcrumb-items="[
          { text: 'Home', href: '/' },
          { text: 'Resource Hub', href: '/resource-hub' },
        ]"
        page-title="Resource Hub"
      />

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
          >
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="7" stroke-width="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" />
            </svg>
          </span>
        </div>

        <!-- Combined list -->
        <div class="mt-6 space-y-4">
          <NuxtLink
            v-for="item in visible"
            :key="`${item.kind}-${item.id}`"
            :to="`/resource-hub/${item.id}`"
            class="border border-gray-200 rounded-md bg-white p-0 overflow-hidden block hover:shadow transition-shadow"
          >
            <div class="block p-4 md:p-5">
              <div
                v-if="activeTab === 'Publications' && item.pubType"
                class="flex items-center gap-2 text-xs mb-2"
              >
                <span
                  class="inline-block px-2 py-0.5 rounded border border-blue-200 text-blue-700 bg-blue-50"
                >
                  {{ item.pubType }}
                </span>
              </div>
              <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-2">
                {{ item.title }}
              </h3>
              <div
                v-if="item.kind === 'publication' && item.authors_text"
                class="flex items-start text-sm text-gray-600 mb-3"
              >
                <img src="~/assets/user.png" alt="Authors" class="w-4 h-4 mr-1 mt-0.5" >
                <span>{{ item.authors_text }}</span>
              </div>

              <p class="text-sm text-gray-700 mb-3">{{ excerpt(item.summary) }}</p>
              <div
                v-if="item.kind === 'publication' && item.tags?.length"
                class="flex flex-wrap gap-2"
              >
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
  </div>
</template>
