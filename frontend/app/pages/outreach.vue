<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from '#app';
import type { NewsEvent, StrapiMedia } from '~~/types/content';

useHead({
  title: 'Outreach — LUCCC',
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

// Blog posts live on /blog — outreach only covers news and events.
const outreachItems = computed(() => items.value.filter((entry) => !entry.blog));

// Project filter
const projectSlug = ref('');
const filtered = computed(() => {
  if (!projectSlug.value) return outreachItems.value;
  return outreachItems.value.filter((entry) =>
    (entry.projectRefs ?? []).some((ref) => ref.slug === projectSlug.value)
  );
});

// Carousel items (latest five with a cover image)
type CarouselItem = {
  id: string;
  title: string;
  description: string;
  cover: string | StrapiMedia | null | undefined;
  type: 'research' | 'outreach' | 'education';
  slug: string;
  to: string;
};

const carouselItems = computed<CarouselItem[]>(() =>
  filtered.value
    .filter((e) => Boolean(e.cover && e.cover.url))
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((e) => ({
      id: String(e.documentId || e.id),
      title: e.secondaryTitle || e.title,
      description: excerpt(e.body, 140),
      cover: e.cover,
      slug: '',
      type: 'outreach' as const,
      to: `/outreach/${e.documentId || e.id}`,
    }))
);

// 3x3 grid pagination
const pageSize = 9;
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

watch(projectSlug, () => {
  page.value = 1;
});

watch(totalPages, (next) => {
  if (page.value > next) page.value = next;
});
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <NuxtPage v-if="hasChild" />
    <template v-else>
      <BreadCrumb
        :breadcrumb-items="[
          { text: 'Home', href: '/' },
          { text: 'Outreach', href: '/outreach' },
        ]"
        page-title="Outreach"
      />

      <!-- Carousel -->
      <section v-if="carouselItems.length" class="w-full mx-auto px-0 md:px-0">
        <ResearchOutreachCarousel :items="carouselItems" />
      </section>

      <section class="w-full max-w-6xl mx-auto py-10 px-4 md:px-0">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-[26px] md:text-[30px] font-display font-medium mb-6">Outreach</h1>
        </div>

        <!-- Project filter -->
        <ProjectFilter v-model="projectSlug" :items="outreachItems" class="mb-6" />

        <!-- Grid -->
        <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="e in visible"
            :key="e.id"
            :to="`/outreach/${e.documentId || e.id}`"
            class="border border-gray-200 rounded-md bg-white overflow-hidden hover:shadow transition-shadow"
          >
            <div class="w-full h-40 overflow-hidden">
              <NuxtImg
                :src="e.cover?.url"
                :alt="e.title"
                sizes="100vw sm:50vw lg:380px"
                format="webp"
                quality="80"
                loading="lazy"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-4">
              <h3 class="text-[16px] font-semibold text-green-800 mb-1">{{ e.title }}</h3>
              <p class="text-sm text-gray-700 line-clamp-3">{{ excerpt(e.body, 180) }}</p>
            </div>
          </NuxtLink>
        </div>

        <p v-if="!visible.length" class="text-center text-gray-600 py-10">
          No outreach activities match the current filter.
        </p>

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
