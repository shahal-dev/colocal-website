<script setup>
import { computed } from 'vue';
import { useRoute } from '#app';

const route = useRoute();
const id = String(route.params.id);

// Fetch current news/event and more for sidebar (no project filter)
const { data: current } = await useAsyncData(
  () => `blog-post:${id}`,
  () => $fetch('/api/news-events', { params: { id } })
);
const item = computed(() => (current.value && current.value[0]) || null);

usePageSeo(() => {
  const i = item.value;
  return {
    title: i?.title ? `${i.title} — Blog Post` : 'Blog Post — LUCCC',
    ogTitle: i?.title,
    description: i?.body,
    images: [i?.cover, ...(i?.images || [])],
  };
});

const { data: moreList } = await useAsyncData('blog-posts:all', () => $fetch('/api/news-events'));
const more = computed(() =>
  (moreList.value || [])
    .filter((n) => n.blog && String(n.documentId || n.id) !== id)
    .slice(0, 6)
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
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

const formattedBody = computed(() => {
  if (typeof item.value?.body !== 'string') return item.value?.body || '';
  return item.value.body.replace(/([^\r\n])\r?\n(?!\r?\n)/g, '$1  \n');
});

const youtubeEmbedUrl = computed(() => {
  const url = item.value?.youtubeUrl;
  if (!url) return null;
  try {
    const u = new URL(url);
    let id = '';
    if (u.hostname === 'youtu.be') id = u.pathname.slice(1);
    else id = u.searchParams.get('v') || u.pathname.split('/').pop() || '';
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
});
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'Blog Post', href: '/blog' },
      ]"
      :page-title="item?.title ? item.title : 'Blog Post'"
    />

    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-8">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div class="md:col-span-8 mr-8 md:mr-12">
          <div v-if="item">
            <div v-if="carouselImages.length" class="mb-5">
              <GalleryCarousel :images="carouselImages" :title="item.title" />
            </div>
            <div v-else-if="item.cover?.url" class="w-full rounded-lg overflow-hidden mb-5">
              <img :src="item.cover?.url" :alt="item.title" class="w-full h-full object-cover" />
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
            <MDC
              :value="formattedBody"
              class="mdc-body prose max-w-none text-gray-800 space-y-6 text-justify"
            />
            <div v-if="youtubeEmbedUrl" class="mt-6 aspect-video">
              <iframe
                :src="youtubeEmbedUrl"
                class="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                frameborder="0"
              />
            </div>
          </div>
        </div>

        <aside class="md:col-span-4">
          <div class="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 sticky top-24">
            <h3
              class="text-xl font-display font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200"
            >
              More Blog Posts
            </h3>
            <div class="space-y-6">
              <NuxtLink
                v-for="m in more"
                :key="m.documentId || m.id"
                :to="`/blog/${m.documentId || m.id}`"
                class="flex gap-4 items-start group"
              >
                <div
                  class="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 shadow-sm"
                >
                  <img
                    v-if="m.cover?.url"
                    :src="m.cover?.url"
                    :alt="m.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <h4
                    class="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors leading-tight mb-1"
                    style="
                      display: -webkit-box;
                      -webkit-line-clamp: 2;
                      line-clamp: 2;
                      -webkit-box-orient: vertical;
                      overflow: hidden;
                    "
                  >
                    {{ m.title }}
                  </h4>
                  <p v-if="m.date" class="text-xs text-gray-500">{{ formatDate(m.date) }}</p>
                </div>
              </NuxtLink>
            </div>
            <div class="mt-8 pt-5 border-t border-gray-200">
              <NuxtLink
                to="/blog"
                class="text-sm font-semibold text-green-700 hover:text-green-800 flex items-center gap-1.5 group w-fit"
              >
                View all blog posts
                <svg
                  class="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </NuxtLink>
            </div>
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
