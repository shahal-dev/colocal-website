<script setup lang="ts">
import { ref, computed } from 'vue';
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

// Fetch education/trainings for this project
const { data: eduData } = await useAsyncData(
  () => `education-trainings:${slug}`,
  () => $fetch('/api/education-trainings', { params: { projectSlug: String(slug) } })
);
const items = computed(() => eduData.value ?? []);

// Pagination only
const pageSize = 6;
const currentPage = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil((items.value?.length || 0) / pageSize)));
const visible = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return (items.value || []).slice(start, start + pageSize);
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
          { text: 'Education & Training', href: '' },
        ]"
        :page-title="projectName + ' — Education & Training'"
      /> -->

      <!-- Secondary navbar (links to sibling pages) -->
      <!-- <ProjectNavbar :project="project" :slug="String(slug)" /> -->

      <section class="w-full max-w-6xl mx-auto py-10 px-4 md:px-0">
        <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="card in visible"
            :key="card.id"
            class="border border-gray-200 rounded-md overflow-hidden bg-white hover:shadow transition-shadow"
          >
            <NuxtLink :to="`${basePath}/education/${card.id}`" class="block">
              <div class="h-44 w-full overflow-hidden">
                <img :src="card.cover?.url" :alt="card.title" class="w-full h-full object-cover" />
              </div>
              <div class="p-4">
                <h3 class="text-[15px] font-semibold text-green-800 mb-1">
                  {{ card.title }}
                </h3>
                <p class="text-sm text-gray-700 line-clamp-3 mb-4">{{ card.body }}</p>
                <div v-if="card.type?.type" class="flex items-center gap-2">
                  <span
                    class="inline-block text-xs px-2 py-1 rounded border border-green-200 text-green-700 bg-green-50"
                  >
                    {{ card.type.type }}
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
