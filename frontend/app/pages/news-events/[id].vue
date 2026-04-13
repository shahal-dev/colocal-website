<script setup>
import { computed } from 'vue';
import { useRoute } from '#app';

const route = useRoute();
const id = String(route.params.id);

// Fetch current news/event and more for sidebar (no project filter)
const { data: current } = await useAsyncData(
  () => `news-event:${id}`,
  () => $fetch('/api/news-events', { params: { id } })
);
const item = computed(() => (current.value && current.value[0]) || null);

useHead({
  title: item.value?.title ? `${item.value.title} — News & Events` : 'News & Events — LUCCC',
});

const { data: moreList } = await useAsyncData('news-events:all', () => $fetch('/api/news-events'));
const more = computed(() =>
  (moreList.value || []).filter((n) => String(n.documentId || n.id) !== id).slice(0, 6)
);

const carouselImages = computed(() => {
  const extras = [];
  if (Array.isArray(item.value?.images)) {
    item.value.images.forEach((entry) => {
      if (!entry) return;
      const src = typeof entry === 'string' ? entry : entry.url;
      const normalized = src?.trim?.() ?? '';
      if (!normalized || extras.includes(normalized)) return;
      extras.push(normalized);
    });
  }

  if (!extras.length) {
    return [];
  }

  const list = [];
  const seen = new Set();
  const cover = item.value?.cover?.url?.trim?.();
  if (cover) {
    seen.add(cover);
    list.push(cover);
  }

  extras.forEach((img) => {
    if (seen.has(img)) return;
    seen.add(img);
    list.push(img);
  });

  return list;
});

const secondaryTitle = computed(() => {
  const raw = item.value?.secondaryTitle;
  return typeof raw === 'string' ? raw.trim() : '';
});

const authorLine = computed(() => {
  const authors = item.value?.authors;
  if (Array.isArray(authors)) {
    const names = authors
      .map((entry) => (typeof entry === 'string' ? entry : entry?.name))
      .filter((name) => typeof name === 'string' && name.trim().length > 0)
      .map((name) => name.trim());
    if (names.length) return names.join(' • ');
  }

  const source = item.value && typeof item.value === 'object' ? item.value : null;
  if (source) {
    for (const key of ['author', 'authorName', 'byline']) {
      const value = source[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
  }

  return '';
});

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
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'News & Events', href: '/news-events' },
      ]"
      :page-title="item?.title ? item.title : 'News & Events'"
    />

    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-8">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div class="md:col-span-8 mr-8 md:mr-12">
          <div v-if="item">
            <div v-if="carouselImages.length" class="mb-5">
              <GalleryCarousel :images="carouselImages" :title="item.title" />
            </div>
            <div v-else-if="item.cover?.url" class="w-full rounded-lg overflow-hidden mb-5">
              <img :src="item.cover?.url" :alt="item.title" class="w-full h-full object-cover" >
            </div>
            <h1 class="text-2xl md:text-3xl font-display font-semibold mb-2">{{ item.title }}</h1>
            <div v-if="secondaryTitle" class="text-lg text-gray-700 font-display mb-2">
              {{ secondaryTitle }}
            </div>
            <div v-if="authorLine" class="text-sm text-gray-600 flex items-center gap-2 mb-2">
              {{ authorLine }}
            </div>
            <div class="text-sm text-gray-600 flex items-center gap-2 mb-4">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                  stroke-width="2"
                />
              </svg>
              <span>{{ formatDate(item.date) }}</span>
            </div>
            <MDC :value="item.body" class="mdc-body prose max-w-none text-gray-800 space-y-6" />
          </div>
        </div>

        <aside class="md:col-span-4">
          <h3 class="text-lg font-semibold mb-4">More Activities</h3>
          <div class="space-y-4">
            <NuxtLink
              v-for="m in more"
              :key="m.documentId || m.id"
              :to="`/news-events/${m.documentId || m.id}`"
              class="flex gap-3 items-center group"
            >
              <div class="w-20 h-14 rounded overflow-hidden flex-shrink-0">
                <img :src="m.cover?.url" :alt="m.title" class="w-full h-full object-cover" >
              </div>
              <div class="min-w-0">
                <p
                  class="text-sm text-green-700 group-hover:underline"
                  style="
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                  "
                >
                  {{ m.title }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
:deep(.mdc-body a) {
  color: rgb(4 120 87);
  font-weight: 500;
  text-decoration: none;
  transition: text-decoration-color 0.15s ease;
}

:deep(.mdc-body a:hover),
:deep(.mdc-body a:focus-visible) {
  text-decoration: underline;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
