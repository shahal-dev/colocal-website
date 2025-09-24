<script setup lang="ts">
import type { NewsEvent } from '~~/types/content';

type NewsItem = {
  id: number;
  title: string;
  date: string; // pre-formatted for now
  image: string;
};

const props = defineProps<{ newsEvents: NewsEvent[] | null | undefined }>();
const newsItems = computed<NewsItem[]>(() => {
  if (!Array.isArray(props.newsEvents)) return [];
  return props.newsEvents.map((p) => ({
    id: p.id,
    title: p.title,
    date: p.date
      ? new Date(p.date).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '',
    image: p.cover?.formats?.medium?.url || p.cover?.url || '',
  }));
});
</script>

<template>
  <section class="flex justify-center items-center w-full max-w-6xl mx-auto h-[484px]">
    <div class="grid grid-cols-12 gap-10">
      <!-- Left rail -->
      <div class="col-span-12 md:col-span-4 flex md:block items-start gap-6">
        <div>
          <h2 class="text-[32] md:text-[32px] font-display font-medium mb-6 md:mb-8">
            News & Announcements
          </h2>
          <NuxtLink
            to="/news-events"
            class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-sm font-body font-semibold transition-colors"
          >
            View All
          </NuxtLink>
        </div>
      </div>

      <!-- News grid -->
      <div class="col-span-12 md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-14 gap-y-9">
        <article v-for="item in newsItems" :key="item.id" class="flex items-start gap-4">
          <img
            :src="item.image"
            :alt="item.title"
            class="w-[102px] h-[102px] object-cover rounded"
          />
          <div class="flex-1">
            <NuxtLink :to="`/news-events/${item.id}`">
              <h3 class="m-0 text-[16px] font-semibold text-gray-900 line-clamp-2">
                {{ item.title }}
              </h3>
            </NuxtLink>
            <div class="mt-2 flex items-center text-gray-500 text-sm">
              <svg
                class="w-4 h-4 mr-2 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="2" />
                <line x1="16" y1="2" x2="16" y2="6" stroke-width="2" />
                <line x1="8" y1="2" x2="8" y2="6" stroke-width="2" />
                <line x1="3" y1="10" x2="21" y2="10" stroke-width="2" />
              </svg>
              <span>{{ item.date }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}
</style>
