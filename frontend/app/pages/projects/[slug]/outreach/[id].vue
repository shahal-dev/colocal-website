<script setup>
import { computed } from 'vue';
import { useRoute } from '#app';

const route = useRoute();
const slug = route.params.slug;
const id = Number(route.params.id);

// Map slug to display name (fallback to 'Project')
const projectName = (() => {
  const map = { colocal: 'COLOCAL', 'mangrove-restoration': 'Mangrove Restoration' };
  return map[String(slug).toLowerCase()] || 'Project';
})();

const basePath = computed(() => `/projects/${slug}`);
const tabs = computed(() => [
  { key: 'home', label: 'Home', to: basePath.value },
  { key: 'about', label: 'About ' + projectName, to: `${basePath.value}/about` },
  { key: 'education', label: 'Education & Training', to: `${basePath.value}/education` },
  { key: 'research', label: 'Research & Publications', to: `${basePath.value}/research` },
  { key: 'outreach', label: 'Outreach', to: `${basePath.value}/outreach` },
  { key: 'lla', label: 'LLA Hub', to: `${basePath.value}/lla` },
]);
const isActive = (to) => route.path.startsWith(to);

// Fetch current news/event and more activities for sidebar
const { data: current } = await useAsyncData(
  () => `news-event:${slug}:${id}`,
  () => $fetch('/api/news-events', { params: { projectSlug: String(slug), id: String(id) } })
);
const item = computed(() => (current.value && current.value[0]) || null);

const { data: moreList } = await useAsyncData(
  () => `news-events-more:${slug}`,
  () => $fetch('/api/news-events', { params: { projectSlug: String(slug) } })
);
const more = computed(() => (moreList.value || []).filter((n) => n.id !== id).slice(0, 6));

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
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
        { text: 'Outreach', href: `${basePath}/outreach` },
      ]"
      :page-title="item?.title ? item.title : projectName + ' — Outreach'"
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

    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-8">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <!-- Main -->
        <div class="md:col-span-8">
          <div v-if="item">
            <div class="w-full h-64 md:h-72 rounded-lg overflow-hidden mb-5">
              <img :src="item.cover?.url" :alt="item.title" class="w-full h-full object-cover" />
            </div>
            <h1 class="text-2xl md:text-3xl font-display font-semibold mb-2">{{ item.title }}</h1>
            <div class="text-sm text-gray-600 flex items-center gap-2 mb-4">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                  stroke-width="2"
                />
              </svg>
              <span>{{ formatDate(item.date) }}</span>
            </div>
            <div class="prose max-w-none text-gray-800 space-y-6">
              <p v-for="(para, idx) in (item.body || '').split('\n\n')" :key="idx">{{ para }}</p>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="md:col-span-4">
          <h3 class="text-lg font-semibold mb-4">More Activities</h3>
          <div class="space-y-4">
            <NuxtLink
              v-for="m in more"
              :key="m.id"
              :to="`${basePath}/outreach/${m.id}`"
              class="flex gap-3 items-center group"
            >
              <div class="w-20 h-14 rounded overflow-hidden flex-shrink-0">
                <img :src="m.cover?.url" :alt="m.title" class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0">
                <p class="text-sm text-green-700 group-hover:underline truncate">{{ m.title }}</p>
              </div>
            </NuxtLink>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
