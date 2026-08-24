<script setup lang="ts">
import type { NewsEvent } from '~~/types/content';

type NewsItem = {
  id: number | string;
  title: string;
  date: string; // pre-formatted for now
  image: string;
};

const props = defineProps<{ newsEvents: NewsEvent[] | null | undefined }>();
const newsItems = computed<NewsItem[]>(() => {
  if (!Array.isArray(props.newsEvents)) return [];
  return props.newsEvents.map((p) => ({
    id: p.documentId || p.id,
    title: p.title,
    date: p.date
      ? new Date(p.date).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '',
    image: p.cover?.url || p.cover?.formats?.large?.url || '',
  }));
});
</script>

<template>
  <section class="w-full max-w-6xl mx-auto py-8 px-4">
    <div class="grid grid-cols-12 gap-6 md:gap-10">
      <!-- Left rail -->
      <div class="col-span-12 md:col-span-4 flex items-center justify-between md:block gap-4">
        <div>
          <h2 class="text-2xl md:text-[32px] font-display font-medium mb-4 md:mb-6">
            News & Announcements
          </h2>
        </div>
        <NuxtLink
          to="/outreach"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-sm font-body font-semibold transition-colors whitespace-nowrap"
        >
          View All
        </NuxtLink>
      </div>

      <!-- News grid -->
      <div
        class="col-span-12 md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-6"
      >
        <article v-for="item in newsItems" :key="item.id" class="flex items-start gap-4 sm:gap-5">
          <template v-if="item.image">
            <NuxtImg
              :src="item.image"
              :alt="item.title"
              sizes="80px sm:96px md:102px"
              format="webp"
              quality="80"
              loading="lazy"
              class="w-20 h-20 sm:w-24 sm:h-24 md:w-[102px] md:h-[102px] object-cover rounded flex-shrink-0"
            />
          </template>
          <template v-else>
            <div
              class="w-20 h-20 sm:w-24 sm:h-24 md:w-[102px] md:h-[102px] bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-400 text-sm"
              aria-hidden="true"
            >
              No Image
            </div>
          </template>

          <div class="flex-1 min-w-0">
            <NuxtLink :to="`/outreach/${item.id}`" class="block">
              <h3
                class="m-0 text-sm sm:text-[16px] md:text-[16px] font-semibold text-gray-900 line-clamp-2"
              >
                {{ item.title }}
              </h3>
            </NuxtLink>
            <div class="mt-2 flex items-center text-gray-500 text-xs sm:text-sm">
              <svg
                class="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
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
  overflow: hidden;
}
</style>
