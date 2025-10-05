<script setup>
import { computed } from 'vue';
import { useRoute } from '#app';

const route = useRoute();
const id = Number(route.params.id);

// Try both: publications and education-trainings
const { data: pubData } = await useAsyncData(
  () => `resource-hub:publication:${id}`,
  () => $fetch('/api/publications', { params: { id: String(id) } })
);
const publication = computed(() => (pubData.value && pubData.value[0]) || null);

const { data: eduData } = await useAsyncData(
  () => `resource-hub:education:${id}`,
  () => $fetch('/api/education-trainings', { params: { id: String(id) } })
);
const education = computed(() => (eduData.value && eduData.value[0]) || null);

// Fallback resolution: if neither returned, item is null
const item = computed(() => publication.value || education.value || null);
const kind = computed(() =>
  publication.value ? 'publication' : education.value ? 'education' : null
);

// Side lists for "More ..."
const { data: allPubs } = await useAsyncData('resource-hub:all-pubs', () =>
  $fetch('/api/publications')
);
const { data: allEdus } = await useAsyncData('resource-hub:all-edus', () =>
  $fetch('/api/education-trainings')
);

const morePublications = computed(() =>
  (allPubs.value || []).filter((p) => p.id !== id).slice(0, 6)
);
const moreEducations = computed(() => (allEdus.value || []).filter((e) => e.id !== id).slice(0, 6));

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
        { text: 'Resource Hub', href: '/resource-hub' },
      ]"
      :page-title="item?.title ? item.title : 'Resource Hub'"
    />

    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-8">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div class="md:col-span-8">
          <div v-if="item">
            <!-- Publication layout -->
            <template v-if="kind === 'publication'">
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
              <MDC :value="item.abstract" class="prose max-w-none text-gray-800 space-y-6" />

              <div v-if="item.file" class="mt-6">
                <a
                  :href="item.file.url"
                  target="_blank"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded bg-green-600 text-white"
                >
                  View PDF
                </a>
              </div>
            </template>

            <!-- Education layout -->
            <template v-else-if="kind === 'education'">
              <div class="w-full h-64 md:h-72 rounded-lg overflow-hidden mb-5">
                <img :src="item.cover?.url" :alt="item.title" class="w-full h-full object-cover" >
              </div>
              <h1 class="text-2xl md:text-3xl font-display font-semibold mb-2">{{ item.title }}</h1>
              <div class="text-sm text-gray-600 flex items-center gap-2 mb-4">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                    stroke-width="2"
                  />
                </svg>
                <span>{{ new Date(item.date).toLocaleDateString() }}</span>
                <span v-if="item.type?.type">• {{ item.type.type }}</span>
              </div>
              <div class="prose max-w-none text-gray-800 space-y-6">
                <p v-for="(para, idx) in (item.body || '').split('\n\n')" :key="idx">{{ para }}</p>
              </div>
            </template>
          </div>
        </div>

        <!-- Sidebars -->
        <aside class="md:col-span-4">
          <template v-if="kind === 'publication'">
            <h3 class="text-lg font-semibold mb-4">More Publications</h3>
            <div class="space-y-5">
              <NuxtLink
                v-for="m in morePublications"
                :key="m.id"
                :to="`/resource-hub/${m.id}`"
                class="group block"
              >
                <p class="text-sm text-green-700 group-hover:underline line-clamp-2">
                  {{ m.title }}
                </p>
                <div class="text-xs text-gray-600">
                  {{ (m.authors || []).map((a) => a.name).join(', ') }}
                </div>
                <div class="text-xs text-gray-500">{{ m.publication_type?.type }}</div>
              </NuxtLink>
            </div>
          </template>
          <template v-else-if="kind === 'education'">
            <h3 class="text-lg font-semibold mb-4">More Activities</h3>
            <div class="space-y-4">
              <NuxtLink
                v-for="m in moreEducations"
                :key="m.id"
                :to="`/resource-hub/${m.id}`"
                class="flex gap-3 items-center group"
              >
                <div class="w-20 h-14 rounded overflow-hidden flex-shrink-0">
                  <img :src="m.cover?.url" :alt="m.title" class="w-full h-full object-cover" >
                </div>
                <div class="min-w-0">
                  <p class="text-sm text-green-700 group-hover:underline truncate">{{ m.title }}</p>
                </div>
              </NuxtLink>
            </div>
          </template>
        </aside>
      </div>
    </section>
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
</style>
