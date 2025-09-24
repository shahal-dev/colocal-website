<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

// Route + derived project name
const route = useRoute();
const slug = route.params.slug;
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

// Secondary navbar (links to sibling pages under the slug)
const basePath = computed(() => `/projects/${slug}`);
const tabs = computed(() => [
  { key: 'home', label: 'Home', to: basePath.value },
  { key: 'about', label: 'About ' + projectName.value, to: `${basePath.value}/about` },
  { key: 'education', label: 'Education & Training', to: `${basePath.value}/education` },
  { key: 'research', label: 'Research & Publications', to: `${basePath.value}/research` },
  { key: 'outreach', label: 'Outreach', to: `${basePath.value}/outreach` },
  { key: 'lla', label: 'LLA Hub', to: `${basePath.value}/lla` },
]);
const isActive = (to: string) => route.path.startsWith(to);
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
      <BreadCrumb
        :breadcrumb-items="[
          { text: 'Home', href: '/' },
          { text: 'Projects & Programmes', href: '/projects' },
          { text: projectName, href: basePath },
          { text: 'Education & Training', href: '' },
        ]"
        :page-title="projectName + ' — Education & Training'"
      />

      <!-- Secondary navbar (links to sibling pages) -->
      <div class="w-full border-b sticky top-0 z-20 bg-white/95 backdrop-blur">
        <nav class="max-w-6xl flex items-center gap-2 px-25 overflow-x-auto hide-scrollbar">
          <NuxtLink
            v-for="t in tabs"
            :key="t.key"
            :to="t.to"
            class="px-4 py-3 text-base font-semibold whitespace-nowrap"
            :class="
              isActive(t.to)
                ? 'bg-green-100 text-green-900 border-b-2 border-green-700'
                : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
            "
          >
            {{ t.label }}
          </NuxtLink>
        </nav>
      </div>

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
