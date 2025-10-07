<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

// Route + derived project name
const route = useRoute();
const slug = route.params.slug;
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

// Use shared project navbar
const basePath = computed(() => `/projects/${slug}`);
const hasChild = computed(() => Boolean(route.params.id));

// Fetch News & Events for this project
const { data: newsData } = await useAsyncData(
  () => `news-events:${slug}`,
  () => $fetch('/api/news-events', { params: { projectSlug: String(slug) } })
);
const newsEvents = computed(() => newsData.value ?? []);

function excerpt(text?: string | null, n = 220) {
  if (!text) return '';
  const t = String(text);
  return t.length > n ? t.slice(0, n) + '…' : t;
}

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

      <!-- HERO/CAROUSEL -->
      <!-- <section class="w-full">
        <HomeCarousel />
      </section> -->

      <!-- News and Events -->
      <section class="w-full max-w-6xl mx-auto px-4 md:px-0 pb-14 mt-8">
        <h2 class="text-[22px] md:text-[26px] font-display font-semibold mb-4">News and Events</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article
            v-for="e in visible"
            :key="e.id"
            class="border border-gray-200 rounded-md bg-white p-0 overflow-hidden"
          >
            <NuxtLink
              :to="`${basePath}/outreach/${e.id}`"
              class="flex gap-4 items-start p-3 md:p-4 group"
            >
              <div class="w-36 h-24 flex-shrink-0 rounded overflow-hidden">
                <img :src="e.cover?.url" :alt="e.title" class="w-full h-full object-cover" />
              </div>
              <div>
                <h3 class="text-[16px] font-semibold text-green-800 mb-1 group-hover:underline">
                  {{ e.title }}
                </h3>
                <p class="text-sm text-gray-700 line-clamp-3">{{ excerpt(e.body) }}</p>
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
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
