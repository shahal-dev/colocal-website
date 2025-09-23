<script setup>
import { ref, computed } from 'vue';
import { useRoute } from '#app';
import img1 from '~/assets/images/carousel-1.png';
import img2 from '~/assets/images/carousel-2.png';

// Route + derived project name
const route = useRoute();
const slug = route.params.slug;
const projectName = (() => {
  const map = {
    colocal: 'COLOCAL',
    'mangrove-restoration': 'Mangrove Restoration',
  };
  return map[String(slug).toLowerCase()] || 'Project';
})();

// Secondary navbar (links to sibling pages under the slug)
const basePath = computed(() => `/projects/${slug}`);
const tabs = computed(() => [
  { key: 'home', label: 'Home', to: basePath.value },
  { key: 'about', label: 'About ' + projectName, to: `${basePath.value}/about` },
  { key: 'education', label: 'Education & Training', to: `${basePath.value}/education` },
  { key: 'research', label: 'Research & Publications', to: `${basePath.value}/research` },
  { key: 'outreach', label: 'Outreach', to: `${basePath.value}/outreach` },
  { key: 'lla', label: 'LLA Hub', to: `${basePath.value}/lla` },
]);
const isActive = (to) => route.path === to;

// Filters & items (reuse Projects index grid layout)
const categories = [
  { key: 'all', label: 'All' },
  { key: 'degree', label: 'Degree Programmes' },
  { key: 'resource', label: 'Resources' },
  { key: 'short', label: 'Short Courses' },
  { key: 'webinar', label: 'Webinars' },
];

const activeCategory = ref('all');
const search = ref('');

const items = ref([
  {
    id: 1,
    title: 'UNI-Lead Mini Workshop',
    description:
      'Building the capacity of universities in the Global South, to work towards climate change adaptation through education and research.',
    category: 'degree',
    image: img1,
  },
  {
    id: 2,
    title: 'Climate Literacy Toolkit',
    description:
      'A practical resource to integrate climate risk and adaptation planning in curricula.',
    category: 'resource',
    image: img2,
  },
  {
    id: 3,
    title: 'Adaptation Planning 101',
    description: 'A four-week short course on community-centric adaptation planning and design.',
    category: 'short',
    image: img1,
  },
  {
    id: 4,
    title: 'Policy Dialogue Webinar',
    description: 'Webinar on bridging research and policy for climate adaptation.',
    category: 'webinar',
    image: img2,
  },
  {
    id: 5,
    title: 'Masters in Climate Studies',
    description: 'Degree programme focusing on resilience, justice, and adaptation pathways.',
    category: 'degree',
    image: img1,
  },
  {
    id: 6,
    title: 'Co-creation Methods',
    description: 'Resource pack for bottom-up knowledge co-creation with vulnerable communities.',
    category: 'resource',
    image: img2,
  },
]);

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return items.value.filter((it) => {
    const matchCategory =
      activeCategory.value === 'all' ? true : it.category === activeCategory.value;
    if (!matchCategory) return false;
    if (!q) return true;
    return (
      it.title.toLowerCase().includes(q) ||
      (it.description && it.description.toLowerCase().includes(q))
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

function setCategory(key) {
  if (activeCategory.value === key) return;
  activeCategory.value = key;
  currentPage.value = 1;
}
function clearFilters() {
  activeCategory.value = 'all';
  search.value = '';
  currentPage.value = 1;
}
function goTo(page) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
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

    <!-- Heading + subtext -->
    <section class="w-full max-w-6xl mx-auto py-10 px-4 md:px-0">
      <div class="text-center max-w-3xl mx-auto">
        <h1 class="text-[26px] md:text-[30px] font-display font-medium mb-3">
          Education & Training
        </h1>
        <p class="text-gray-600 text-sm md:text-base">
          Our Education & Training programs equip individuals and institutions with climate
          knowledge and skills through specialized workshops, courses, and learning opportunities
          focused on resilience and sustainability.
        </p>
      </div>

      <!-- Search -->
      <div class="mt-8 relative">
        <input
          v-model="search"
          type="text"
          placeholder="Search for education/training opportunities"
          class="w-full border rounded-md pl-4 pr-10 py-3 outline-none focus:border-green-600"
        />
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="7" stroke-width="2" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" />
          </svg>
        </span>
      </div>

      <!-- Category chips -->
      <div class="mt-5 flex flex-wrap items-center gap-2">
        <button
          v-for="c in categories"
          :key="c.key"
          class="px-3 py-2 text-sm rounded border"
          :class="
            c.key === activeCategory
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-800 border-gray-300 hover:border-green-300'
          "
          @click="setCategory(c.key)"
        >
          {{ c.label }}
        </button>
        <button
          class="ml-1 px-3 py-2 text-sm rounded border border-red-200 text-red-700 bg-red-50"
          @click="clearFilters"
        >
          Clear All
        </button>
      </div>

      <!-- Grid -->
      <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="card in visible"
          :key="card.id"
          class="border border-gray-200 rounded-md overflow-hidden bg-white hover:shadow transition-shadow"
        >
          <div class="h-44 w-full overflow-hidden">
            <img :src="card.image" :alt="card.title" class="w-full h-full object-cover" />
          </div>
          <div class="p-4">
            <h3 class="text-[15px] font-semibold text-green-800 mb-1">
              {{ card.title }}
            </h3>
            <p class="text-sm text-gray-700 line-clamp-3 mb-4">{{ card.description }}</p>
            <div class="flex items-center gap-2">
              <span
                class="inline-block text-xs px-2 py-1 rounded border"
                :class="
                  {
                    degree: 'border-blue-200 text-blue-700 bg-blue-50',
                    resource: 'border-amber-200 text-amber-700 bg-amber-50',
                    short: 'border-purple-200 text-purple-700 bg-purple-50',
                    webinar: 'border-pink-200 text-pink-700 bg-pink-50',
                  }[card.category]
                "
              >
                {{
                  {
                    degree: 'Degree Programme',
                    resource: 'Resource',
                    short: 'Short Course',
                    webinar: 'Webinar',
                  }[card.category]
                }}
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
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
