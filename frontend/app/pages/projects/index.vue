<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Project } from '~~/types/content';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'ongoing', label: 'Ongoing Projects' },
  { key: 'past', label: 'Past Projects' },
  { key: 'programmes', label: 'Programmes' },
];

const activeTab = ref('all');
const search = ref('');

// Fetch projects from our Nuxt server endpoint
const { data: projects } = await useAsyncData<Project[]>(
  'projects',
  async () => await $fetch('/api/projects')
);

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!projects.value) return [];
  return projects.value.filter((it) => {
    let matchTab = true;
    if (activeTab.value === 'ongoing') matchTab = it.active;
    else if (activeTab.value === 'past') matchTab = !it.active;
    else if (activeTab.value === 'programmes') matchTab = it.programme;
    if (!matchTab) return false;
    if (!q) return true;
    return (
      it.shortTitle.toLowerCase().includes(q) ||
      (it.shortDescription && it.shortDescription.toLowerCase().includes(q))
    );
  });
});

const pageSize = 6;
const currentPage = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const visible = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

function setTab(key: string) {
  if (activeTab.value === key) return;
  activeTab.value = key;
  currentPage.value = 1;
}

function goTo(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'Projects & Programmes', href: '/projects' },
      ]"
      page-title="Projects & Programmes"
    />

    <section class="w-full max-w-6xl mx-auto py-10">
      <!-- Heading + subtext -->
      <div class="text-center max-w-3xl mx-auto">
        <h1 class="text-[28px] md:text-[32px] font-display font-medium mb-3">
          Projects & Programmes
        </h1>
        <p class="text-gray-600 text-sm md:text-base">
          Our projects & programmes drive climate action through research, education, and policy
          initiatives. Explore our efforts to build resilience and support sustainable development
          in LDCs.
        </p>
      </div>

      <!-- Tabs -->
      <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 text-center gap-3 md:gap-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="pb-2 border-b-2"
          :class="
            tab.key === activeTab
              ? 'border-green-600 text-gray-900'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          "
          @click="setTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Search -->
      <div class="mt-8 relative">
        <input
          v-model="search"
          type="text"
          placeholder="Search for a project/programme"
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
          <div class="h-44 w-full overflow-hidden">
            <img
              :src="card.cover?.formats?.large?.url || card.cover?.url || ''"
              :alt="card.shortTitle"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="p-4">
            <h3 class="text-sm font-semibold text-green-800 uppercase tracking-wide mb-1">
              {{ card.shortTitle }}
            </h3>
            <p class="text-sm text-gray-700 line-clamp-3 mb-4">{{ card.shortDescription }}</p>
            <div class="flex items-center gap-2">
              <span
                class="inline-block text-xs px-2 py-1 rounded border border-blue-200 text-blue-700 bg-blue-50"
                >{{ card.programme ? 'Programme' : 'Project' }}</span
              >
              <span
                class="inline-block text-xs px-2 py-1 rounded border"
                :class="
                  card.active
                    ? 'border-green-200 text-green-700 bg-green-50'
                    : 'border-gray-200 text-gray-700 bg-gray-50'
                "
              >
                {{ card.active ? 'Ongoing' : 'Past' }}
              </span>
            </div>
          </div>
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
