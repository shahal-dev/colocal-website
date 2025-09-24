<script setup>
import { computed } from 'vue';
import { useRoute } from '#app';

const route = useRoute();
const slug = route.params.slug;
const id = Number(route.params.id);

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

// Fetch current publication and more publications for sidebar
const { data: current } = await useAsyncData(
  () => `publication:${slug}:${id}`,
  () => $fetch('/api/publications', { params: { projectSlug: String(slug), id: String(id) } })
);
const item = computed(() => (current.value && current.value[0]) || null);

const { data: moreList } = await useAsyncData(
  () => `publications-more:${slug}`,
  () => $fetch('/api/publications', { params: { projectSlug: String(slug) } })
);
const more = computed(() => (moreList.value || []).filter((n) => n.id !== id).slice(0, 6));

function formatMonthYear(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'Projects & Programmes', href: '/projects' },
        { text: projectName, href: basePath },
        { text: 'Research & Publications', href: `${basePath}/research` },
      ]"
      :page-title="item?.title ? item.title : projectName + ' — Research & Publications'"
    />

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
        <div class="md:col-span-8">
          <div v-if="item">
            <h1 class="text-2xl md:text-3xl font-display font-semibold mb-2">{{ item.title }}</h1>
            <div class="text-sm text-gray-600 flex flex-wrap items-center gap-2 mb-2">
              <span>{{ (item.authors || []).map((a) => a.name).join(' • ') }}</span>
            </div>
            <div class="text-sm text-gray-600 mb-4">
              <span>{{ formatMonthYear(item.date) }}</span>
            </div>
            <div v-if="item.publication_type?.type" class="text-sm mb-1">
              Publisher:
              <span class="text-green-700 font-medium">{{ item.publication_type.type }}</span>
            </div>
            <div v-if="item.url" class="mb-6">
              <NuxtLink :to="item.url" target="_blank" class="text-green-700 hover:underline">{{
                item.url
              }}</NuxtLink>
            </div>

            <h2 class="text-xl font-semibold mb-2">Abstract</h2>
            <p class="text-gray-800 leading-relaxed mb-6">{{ item.abstract }}</p>

            <div v-if="item.file" class="mt-6">
              <a
                :href="item.file.url"
                target="_blank"
                class="inline-flex items-center gap-2 px-4 py-2 rounded bg-green-600 text-white"
              >
                View PDF
              </a>
            </div>
          </div>
        </div>

        <aside class="md:col-span-4">
          <h3 class="text-lg font-semibold mb-4">More Publications</h3>
          <div class="space-y-5">
            <NuxtLink
              v-for="m in more"
              :key="m.id"
              :to="`${basePath}/research/${m.id}`"
              class="group block"
            >
              <p class="text-sm text-green-700 group-hover:underline line-clamp-2">{{ m.title }}</p>
              <div class="text-xs text-gray-600">
                {{ (m.authors || []).map((a) => a.name).join(', ') }}
              </div>
              <div class="text-xs text-gray-500">{{ m.publication_type?.type }}</div>
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
