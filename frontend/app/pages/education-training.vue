<script setup lang="ts">
import { ref, computed } from 'vue';
import type { EducationTraining } from '~~/types/content';

useHead({
  title: 'Education & Training — LUCCC',
});

// Fetch all Education & Training items
const { data: eduData } = await useAsyncData<EducationTraining[]>(
  'education-trainings-all',
  async () => (await $fetch('/api/education-trainings')) as EducationTraining[]
);
const route = useRoute();
const items = computed(() => eduData.value ?? []);
const hasChild = computed(() => Boolean(route.params.id));

// Search
const q = ref('');
const filtered = computed(() => {
  const query = q.value.trim().toLowerCase();
  if (!query) return items.value;
  return items.value.filter((it) => {
    if (it.title.toLowerCase().includes(query)) return true;
    if (it.body && it.body.toLowerCase().includes(query)) return true;
    if (it.type?.type && it.type.type.toLowerCase().includes(query)) return true;
    return false;
  });
});

// Pagination
const pageSize = 6; // 3x2 grid per page
const page = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const visible = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

function goTo(p: number) {
  if (p < 1 || p > totalPages.value) return;
  page.value = p;
}

function excerpt(text?: string | null, n = 200) {
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
          { text: 'Education & Training', href: '/education-training' },
        ]"
        page-title="Education & Training"
      />

      <section class="w-full max-w-6xl mx-auto py-10 px-4 md:px-0">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-[26px] md:text-[30px] font-display font-medium mb-3">
            Education & Training
          </h1>
        </div>

        <!-- Search -->
        <div class="mt-6 relative">
          <input
            v-model="q"
            type="text"
            placeholder="Search education or training"
            class="w-full border rounded-md pl-4 pr-10 py-3 outline-none focus:border-green-600"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="7" stroke-width="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" />
            </svg>
          </span>
        </div>

        <!-- Grid -->
        <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="card in visible"
            :key="card.id"
            :to="`/education-training/${card.id}`"
            class="border border-gray-200 rounded-md overflow-hidden bg-white hover:shadow transition-shadow"
          >
            <div class="h-44 w-full overflow-hidden">
              <img :src="card.cover?.url" :alt="card.title" class="w-full h-full object-cover" />
            </div>
            <div class="p-4">
              <h3 class="text-[15px] font-semibold text-green-800 mb-1">
                {{ card.title }}
              </h3>
              <p class="text-sm text-gray-700 line-clamp-3 mb-4">{{ excerpt(card.body) }}</p>
              <div v-if="card.type?.type" class="flex items-center gap-2">
                <span
                  class="inline-block text-xs px-2 py-1 rounded border border-green-200 text-green-700 bg-green-50"
                >
                  {{ card.type.type }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-10 flex items-center justify-center gap-2">
          <button
            v-for="i in totalPages"
            :key="i"
            :aria-current="i === page ? 'true' : 'false'"
            class="min-w-[32px] h-7 px-2 text-sm rounded border"
            :class="
              i === page
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-800 border-gray-300'
            "
            @click="goTo(i)"
          >
            {{ i }}
          </button>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
