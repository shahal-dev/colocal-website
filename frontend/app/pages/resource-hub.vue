<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from '#app';
import type { ResearchPublication, EducationTraining } from '~~/types/content';

useHead({
  title: 'Resource Hub — LUCCC',
});

type HubItem = {
  kind: 'publication' | 'education';
  id: number;
  date: string;
  title: string;
  summary: string;
  authors_text?: string | null;
  tags?: { tag: string }[] | null;
  eduType?: string | null;
};

// Nested route check for /resource-hub/:id
const route = useRoute();
const hasChild = computed(() => Boolean(route.params.id));

// Fetch all publications and education/training entries
const [{ data: publications }, { data: educations }] = await Promise.all([
  useAsyncData<ResearchPublication[]>(
    'hub-publications',
    async () => (await $fetch('/api/publications')) as ResearchPublication[]
  ),
  useAsyncData<EducationTraining[]>(
    'hub-educations',
    async () => (await $fetch('/api/education-trainings')) as EducationTraining[]
  ),
]);

const items = computed<HubItem[]>(() => {
  const pubs = (publications.value ?? []).map<HubItem>((p) => ({
    kind: 'publication',
    id: p.id,
    date: p.date,
    title: p.title,
    summary: p.abstract || '',
    authors_text: p.authors_text ?? null,
    tags: p.tags ?? null,
  }));
  const edus = (educations.value ?? []).map<HubItem>((e) => ({
    kind: 'education',
    id: e.id,
    date: e.date,
    title: e.title,
    summary: e.body || '',
    eduType: e.type?.type ?? null,
  }));
  return [...pubs, ...edus].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
});

// Search
const q = ref('');
const filtered = computed(() => {
  const query = q.value.trim().toLowerCase();
  if (!query) return items.value;
  return items.value.filter((it) => {
    if (it.title.toLowerCase().includes(query)) return true;
    if (it.summary && it.summary.toLowerCase().includes(query)) return true;
    if (it.kind === 'publication' && it.authors_text?.toLowerCase().includes(query)) return true;
    if (it.kind === 'education' && (it.eduType || '').toLowerCase().includes(query)) return true;
    return false;
  });
});

// Pagination
const pageSize = 5;
const page = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const visible = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
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
              <div class="flex items-center gap-2 text-xs mb-2">
                <span
                  class="inline-block px-2 py-0.5 rounded border"
                  :class="
                    item.kind === 'publication'
                      ? 'border-blue-200 text-blue-700 bg-blue-50'
                      : 'border-green-200 text-green-700 bg-green-50'
                  "
                >
                  {{ item.kind === 'publication' ? 'Publication' : 'Education & Training' }}
                </span>
                <span v-if="item.kind === 'education' && item.eduType" class="text-gray-600">
                  • {{ item.eduType }}
                </span>
              </div>
              <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-2">
                {{ item.title }}
              </h3>
              <div
                v-if="item.kind === 'publication' && item.authors_text"
                class="flex items-center text-sm text-gray-600 mb-3"
              >
                <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87" stroke-width="2" />
                  <circle cx="12" cy="7" r="4" stroke-width="2" />
                </svg>
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
