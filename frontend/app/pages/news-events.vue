<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from '#app';
import type { NewsEvent } from '~~/types/content';

useHead({
  title: 'News & Events — LUCCC',
});

// Route + nested check
const route = useRoute();
const hasChild = computed(() => Boolean(route.params.id));

// Fetch all News & Events
const { data: newsData } = await useAsyncData<NewsEvent[]>(
  'news-events-all',
  async () => (await $fetch('/api/news-events')) as NewsEvent[]
);
const items = computed(() => newsData.value ?? []);

const isColocal = (entry: NewsEvent): boolean =>
  Boolean((entry as unknown as { blog?: boolean }).blog);

const regularItems = computed(() => items.value.filter((entry) => !isColocal(entry)));
const colocalItems = computed(() => items.value.filter((entry) => isColocal(entry)));

// 3x3 grid pagination
const pageSize = 9;
const page = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(regularItems.value.length / pageSize)));
const visible = computed(() => {
  const start = (page.value - 1) * pageSize;
  return regularItems.value.slice(start, start + pageSize);
});

function goTo(p: number) {
  if (p < 1 || p > totalPages.value) return;
  page.value = p;
}

watch(totalPages, (next) => {
  if (page.value > next) page.value = next;
});

function excerpt(text?: string | null, n = 180) {
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
          { text: 'News & Events', href: '/news-events' },
        ]"
        page-title="News & Events"
      />

      <section class="w-full max-w-6xl mx-auto py-10 px-4 md:px-0">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-[26px] md:text-[30px] font-display font-medium mb-6">News & Events</h1>
        </div>

        <!-- Grid (no carousel here) -->
        <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="e in visible"
            :key="e.id"
            :to="`/news-events/${e.id}`"
            class="border border-gray-200 rounded-md bg-white overflow-hidden hover:shadow transition-shadow"
          >
            <div class="w-full h-40 overflow-hidden">
              <img :src="e.cover?.url" :alt="e.title" class="w-full h-full object-cover">
            </div>
            <div class="p-4">
              <h3 class="text-[16px] font-semibold text-green-800 mb-1">{{ e.title }}</h3>
              <p class="text-sm text-gray-700 line-clamp-3">{{ excerpt(e.body) }}</p>
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

        <div v-if="colocalItems.length" class="mt-16">
          <div class="text-center max-w-3xl mx-auto mb-8">
            <h2 class="text-[24px] md:text-[28px] font-display font-medium">COLOCAL Blog</h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink
              v-for="e in colocalItems"
              :key="e.id"
              :to="`/news-events/${e.id}`"
              class="border border-gray-200 rounded-md bg-white overflow-hidden hover:shadow transition-shadow"
            >
              <div class="w-full h-40 overflow-hidden">
                <img :src="e.cover?.url" :alt="e.title" class="w-full h-full object-cover">
              </div>
              <div class="p-4">
                <h3 class="text-[16px] font-semibold text-green-800 mb-1">{{ e.title }}</h3>
                <p class="text-sm text-gray-700 line-clamp-3">{{ excerpt(e.body) }}</p>
              </div>
            </NuxtLink>
          </div>
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
