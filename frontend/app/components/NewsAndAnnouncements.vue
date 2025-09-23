<script setup lang="ts">
import { ref } from 'vue';
import img1 from '~/assets/images/carousel-1.png';
import img2 from '~/assets/images/carousel-2.png';

type NewsItem = {
  id: number;
  title: string;
  date: string; // pre-formatted for now
  image: string;
};

const newsItems = ref<NewsItem[]>([
  {
    id: 1,
    title: 'New Climate Policy Framework Launched in LDCs',
    date: 'Apr 1, 2024',
    image: img1,
  },
  {
    id: 2,
    title: 'Latest Research Findings on Climate Change Impact in Vulnerable Regions',
    date: 'Mar 25, 2024',
    image: img2,
  },
  {
    id: 3,
    title: 'LUCCC Partners with Global Leaders for Climate Education',
    date: 'Mar 25, 2024',
    image: img1,
  },
  {
    id: 4,
    title: 'New Climate Policy Framework Launched in LDCs',
    date: 'Apr 1, 2024',
    image: img2,
  },
]);

function viewAll() {
  // Placeholder: navigate or emit event. Replace with real route.
  console.info('View all news clicked');
}
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
          <button
            type="button"
            class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-sm font-body font-semibold transition-colors"
            @click="viewAll"
          >
            View All
          </button>
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
            <h3 class="m-0 text-[16px] font-semibold text-gray-900 line-clamp-2">
              {{ item.title }}
            </h3>
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
