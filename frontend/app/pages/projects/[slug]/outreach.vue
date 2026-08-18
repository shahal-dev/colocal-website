<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from '#app';
import type { Project, StrapiMedia } from '~~/types/content';

// Route + derived project name
const route = useRoute();
const slug = route.params.slug;
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

useHead(() => ({
  title: `News & Events — ${projectName.value}`,
}));

// Use shared project navbar
const basePath = computed(() => `/projects/${slug}`);
const hasChild = computed(() => Boolean(route.params.id));

// Fetch News & Events for this project
const { data: newsData } = await useAsyncData(
  () => `news-events:${slug}`,
  () => $fetch('/api/news-events', { params: { projectSlug: String(slug) } })
);
const newsEvents = computed(() => (newsData.value ?? []).filter((n) => !n.blog));

// Carousel items for outreach
type CarouselItem = {
  id: string;
  title: string;
  description: string;
  cover: string | StrapiMedia | null | undefined;
  type: 'research' | 'outreach' | 'education';
  slug: string;
};

const carouselItems = computed<CarouselItem[]>(() => {
  const list = Array.isArray(newsEvents.value) ? newsEvents.value : [];
  return list
    .filter((n) => Boolean(n.cover && n.cover.url))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((n) => ({
      id: String(n.documentId || n.id),
      title: n.secondaryTitle || n.title,
      description: excerpt(n.body, 140),
      cover: n.cover,
      slug: basePath.value,
      type: 'outreach' as const,
    }));
});

// Pagination
const pageSize = 6;
const currentPage = ref(1);
const totalPages = computed(() =>
  Math.max(1, Math.ceil((newsEvents.value?.length || 0) / pageSize))
);
const visible = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return (newsEvents.value || []).slice(start, start + pageSize);
});
function goTo(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <NuxtPage v-if="hasChild" />
    <template v-else>
      <!-- Breadcrumb -->
      <!-- <BreadCrumb
        :breadcrumb-items="[
          { text: 'Home', href: '/' },
          { text: 'Projects & Programmes', href: '/projects' },
          { text: projectName, href: basePath },
          { text: 'Outreach', href: '' },
        ]"
        :page-title="projectName + ' — Outreach'"
      /> -->

      <!-- Secondary navbar (links to sibling pages) -->
      <!-- <ProjectNavbar :project="project" :slug="String(slug)" /> -->

      <!-- Carousel -->
      <section v-if="carouselItems.length" class="w-full mx-auto px-0 md:px-0">
        <ResearchOutreachCarousel :items="carouselItems" />
      </section>

      <!-- News and Events -->
      <section class="w-full max-w-6xl mx-auto px-4 md:px-0 pb-14 mt-8">
        <h2 class="text-[22px] md:text-[26px] font-display font-semibold mb-4">News &amp; Events</h2>
        <div class="flex flex-col gap-8">
          <article
            v-for="e in visible"
            :key="e.id"
            class="border border-gray-200 rounded-xl bg-white overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <NuxtLink
              :to="`${basePath}/outreach/${e.documentId || e.id}`"
              class="flex flex-col md:flex-row w-full h-full"
            >
              <div
                class="w-full md:w-2/5 lg:w-1/3 min-h-[14rem] overflow-hidden bg-gray-100 flex-shrink-0 relative"
              >
                <img
                  v-if="e.cover?.url"
                  :src="e.cover.url"
                  :alt="e.title"
                  class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                >
                <div
                  v-else
                  class="absolute inset-0 w-full h-full flex items-center justify-center text-gray-400"
                >
                  <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div class="p-6 md:p-8 flex flex-col justify-center flex-grow">
                <div v-if="e.date" class="text-sm font-medium text-green-600 mb-2">
                  {{
                    new Date(e.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  }}
                </div>
                <h3
                  class="text-xl md:text-2xl font-semibold text-gray-900 mb-3 group-hover:text-green-700 transition-colors line-clamp-2"
                >
                  {{ e.title }}
                </h3>
                <p class="text-gray-600 line-clamp-3 md:line-clamp-4">{{ excerpt(e.body, 250) }}</p>
                <div v-if="e.country?.name" class="flex items-center gap-2 flex-wrap mt-4">
                  <span
                    class="inline-block text-xs px-2 py-1 rounded border border-blue-200 text-blue-700 bg-blue-50"
                  >
                    {{ e.country.name }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-10 flex items-center justify-center gap-2">
          <button
            v-for="page in totalPages"
            :key="page"
            :aria-current="page === currentPage ? 'true' : 'false'"
            class="min-w-[32px] h-7 px-2 text-sm rounded border"
            :class="
              page === currentPage
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-800 border-gray-300'
            "
            @click="goTo(page)"
          >
            {{ page }}
          </button>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.md\:line-clamp-4 {
  @media (min-width: 768px) {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
