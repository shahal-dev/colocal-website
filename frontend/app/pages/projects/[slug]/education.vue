<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from '#app';
import type { Project, StrapiMedia } from '~~/types/content';

// Route + derived project name
const route = useRoute();
const slug = route.params.slug;
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

useHead({
  title: projectName.value
    ? `${projectName.value} — Education & Training`
    : 'Education & Training — LUCCC',
});

// Use shared project navbar
const basePath = computed(() => `/projects/${slug}`);
const hasChild = computed(() => Boolean(route.params.id));

// Fetch education/trainings for this project
const { data: eduData } = await useAsyncData(
  () => `education-trainings:${slug}`,
  () => $fetch('/api/education-trainings', { params: { projectSlug: String(slug) } })
);
const items = computed(() => (eduData.value ?? []).filter((e) => !e.lla));

// Carousel items for education
type CarouselItem = {
  id: string;
  title: string;
  description: string;
  cover: string | StrapiMedia | null | undefined;
  type: 'research' | 'outreach' | 'education';
  slug: string;
};

const carouselItems = computed<CarouselItem[]>(() => {
  const list = Array.isArray(items.value) ? items.value : [];
  return list
    .filter((e) => Boolean(e.cover && e.cover.url))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((e) => ({
      id: String(e.documentId || e.id),
      title: e.title,
      description: excerpt(e.body, 140),
      cover: e.cover,
      slug: basePath.value,
      type: 'education' as const,
    }));
});

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

// Pagination — a single flat list, matching the LUCCC layer
const pageSize = 6;
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

watch(q, () => {
  page.value = 1;
});
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <NuxtPage v-if="hasChild" />
    <template v-else>
      <!-- Carousel -->
      <section v-if="carouselItems.length" class="w-full mx-auto px-0 md:px-0">
        <ResearchOutreachCarousel :items="carouselItems" />
      </section>

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
          <article
            v-for="card in visible"
            :key="card.id"
            class="border border-gray-200 rounded-md overflow-hidden bg-white hover:shadow transition-shadow"
          >
            <NuxtLink :to="`${basePath}/education/${card.documentId || card.id}`" class="block">
              <div class="h-44 w-full overflow-hidden">
                <NuxtImg
                  :src="card.cover?.url"
                  :alt="card.title"
                  sizes="100vw sm:50vw lg:380px"
                  format="webp"
                  quality="80"
                  loading="lazy"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="p-4">
                <h3 class="text-[15px] font-semibold text-green-800 mb-1">
                  {{ card.title }}
                </h3>
                <p class="text-sm text-gray-700 line-clamp-3 mb-4">{{ excerpt(card.body) }}</p>
                <div
                  v-if="card.type?.type || card.country?.name"
                  class="flex items-center gap-2 flex-wrap"
                >
                  <span
                    v-if="card.type?.type"
                    class="inline-block text-xs px-2 py-1 rounded border border-green-200 text-green-700 bg-green-50"
                  >
                    {{ card.type.type }}
                  </span>
                  <span
                    v-if="card.country?.name"
                    class="inline-block text-xs px-2 py-1 rounded border border-blue-200 text-blue-700 bg-blue-50"
                  >
                    {{ card.country.name }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>

        <p v-if="!visible.length" class="text-center text-gray-600 py-10">
          No education or training entries match the current search.
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

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
