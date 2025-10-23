<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Project } from '~~/types/content';

useHead({
  title: 'Projects & Programmes — LUCCC',
});

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

function prevPage() {
  if (currentPage.value > 1) currentPage.value -= 1;
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value += 1;
}

// helper to generate a small window of pages for desktop pagination
const pageWindow = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const radius = 2;
  const start = Math.max(1, current - radius);
  const end = Math.min(total, current + radius);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <NuxtPage v-if="hasChild" />
    <template v-else>
      <BreadCrumb
        :breadcrumb-items="[
          { text: 'Home', href: '/' },
          { text: 'Projects & Programmes', href: '/projects' },
        ]"
        page-title="Projects & Programmes"
      />

      <section class="w-full max-w-6xl mx-auto py-6 px-4 sm:py-10 sm:px-6">
        <!-- Heading + subtext -->
        <div class="text-center max-w-3xl mx-auto">
          <h1
            class="text-[22px] sm:text-[28px] md:text-[32px] font-display font-medium mb-2 sm:mb-3"
          >
            Projects & Programmes
          </h1>
          <p class="text-gray-600 text-sm sm:text-base">
            Our projects & programmes drive climate action through research, education, and policy
            initiatives. Explore our efforts to build resilience and support sustainable development
            in LDCs.
          </p>
        </div>

        <!-- Tabs (horizontally scrollable on small screens) -->
        <div class="mt-6">
          <div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div class="flex gap-3 w-max min-w-full sm:w-full sm:justify-center">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                class="pb-2 border-b-2 whitespace-nowrap px-3 py-2 rounded-t"
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
          </div>
        </div>

        <!-- Search -->
        <div class="mt-6 relative max-w-2xl mx-auto">
          <input
            v-model="search"
            type="text"
            placeholder="Search for a project/programme"
            class="w-full border rounded-md pl-4 pr-10 py-3 outline-none focus:border-green-600 text-sm"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="7" stroke-width="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" />
            </svg>
          </span>
        </div>

        <!-- Grid -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="card in visible"
            :key="card.id"
            :to="`/projects/${card.slug}`"
            class="border border-gray-200 rounded-md overflow-hidden bg-white hover:shadow transition-shadow flex flex-col h-full"
          >
            <div class="w-full h-36 sm:h-44 md:h-52 overflow-hidden">
              <img
                :src="card.cover?.formats?.large?.url || card.cover?.url || ''"
                :alt="card.shortTitle"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 class="text-sm font-semibold text-green-800 uppercase tracking-wide mb-1">
                  {{ card.shortTitle }}
                </h3>
                <p class="text-sm text-gray-700 line-clamp-3 mb-4">{{ card.shortDescription }}</p>
              </div>
              <div class="flex items-center gap-2 mt-2">
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
          </NuxtLink>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <!-- Mobile: condensed -->
          <div class="sm:hidden flex items-center gap-3">
            <button
              class="px-3 py-1 border rounded text-sm"
              :class="currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'"
              :disabled="currentPage === 1"
              @click="prevPage"
            >
              Prev
            </button>
            <div class="text-sm">Page {{ currentPage }} of {{ totalPages }}</div>
            <button
              class="px-3 py-1 border rounded text-sm"
              :class="
                currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
              "
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              Next
            </button>
          </div>

          <!-- Desktop: windowed numeric pagination -->
          <div class="hidden sm:flex items-center gap-2">
            <button
              class="px-3 py-1 border rounded text-sm"
              :class="currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'"
              :disabled="currentPage === 1"
              aria-label="Previous page"
              @click="prevPage"
            >
              ‹
            </button>

            <button
              v-for="page in pageWindow"
              :key="page"
              class="min-w-[36px] h-8 px-2 text-sm rounded border"
              :class="
                page === currentPage
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
              "
              :aria-current="page === currentPage ? 'true' : 'false'"
              @click="goTo(page)"
            >
              {{ page }}
            </button>

            <button
              class="px-3 py-1 border rounded text-sm"
              :class="
                currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
              "
              :disabled="currentPage === totalPages"
              aria-label="Next page"
              @click="nextPage"
            >
              ›
            </button>
          </div>
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
