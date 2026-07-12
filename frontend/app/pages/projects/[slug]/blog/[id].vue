<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

const route = useRoute();
const slug = route.params.slug;
const id = String(route.params.id);
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

const basePath = computed(() => `/projects/${slug}`);

// Fetch current blog post
const { data: current } = await useAsyncData(
  () => `news-event:${slug}:${id}`,
  () => $fetch('/api/news-events', { params: { projectSlug: String(slug), id: String(id) } })
);

// Fetch all authors with avatars
const { data: authorsData } = await useAsyncData('all-authors', () =>
  $fetch('/api/authors', { query: { pageSize: '200' } })
);

const item = computed(() => {
  const currentItem = (current.value && current.value[0]) || null;
  if (!currentItem) return null;

  const authorsMap = new Map();
  if (authorsData.value?.data) {
    (authorsData.value.data as Record<string, unknown>[]).forEach((author) => {
      authorsMap.set(author.id, author);
    });
  }

  if (currentItem.authors && Array.isArray(currentItem.authors)) {
    const enrichedAuthors = currentItem.authors.map((author: Record<string, unknown>) => {
      const fullAuthor = authorsMap.get(author.id);
      if (fullAuthor && fullAuthor.avatar) {
        return { ...author, avatar: fullAuthor.avatar };
      }
      return author;
    });
    return { ...currentItem, authors: enrichedAuthors };
  }

  return currentItem;
});

const formattedBody = computed(() => {
  if (typeof item.value?.body !== 'string') return item.value?.body || '';
  return item.value.body.replace(/([^\r\n])\r?\n(?!\r?\n)/g, '$1  \n');
});

console.log(item.value?.body);
useHead(() => {
  const i = item.value;
  const ogImage = ogImageMeta(i?.cover, ...(Array.isArray(i?.images) ? i.images : []));
  const ogTitle = i?.title || `${projectName.value} — Blog`;
  const rawDesc = typeof i?.body === 'string' ? i.body.replace(/[#*_`[\]()>]/g, '').replace(/\n+/g, ' ').trim().slice(0, 160) : '';
  return {
    title: i?.title ? `${i.title} — COLOCAL Blog` : `${projectName.value} — COLOCAL Blog`,
    meta: [
      { property: 'og:title', content: ogTitle },
      { property: 'og:description', content: rawDesc },
      ...ogImageTags(ogImage, ogTitle),
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: ogTitle },
      { name: 'twitter:description', content: rawDesc },
    ],
  };
});

const carouselImages = computed(() => {
  const extras: string[] = [];
  if (Array.isArray(item.value?.images)) {
    for (const entry of item.value.images) {
      if (!entry) continue;
      const candidate = typeof entry === 'string' ? entry : entry.url;
      if (!candidate) continue;
      const normalized = candidate.trim();
      if (!normalized || extras.includes(normalized)) continue;
      extras.push(normalized);
    }
  }

  if (!extras.length) {
    return [];
  }

  const urls: string[] = [];
  const seen = new Set<string>();
  const cover = item.value?.cover?.url ? item.value.cover.url.trim() : '';
  if (cover) {
    seen.add(cover);
    urls.push(cover);
  }

  for (const img of extras) {
    if (seen.has(img)) continue;
    seen.add(img);
    urls.push(img);
  }

  return urls;
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
      .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
      .map((name) => name.trim());
    if (names.length) return names.join(' • ');
  }

  const source = item.value as Record<string, unknown> | null;
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

// Sidebar: other blog posts only
const { data: moreList } = await useAsyncData(
  () => `blog-posts-more:${slug}`,
  () => $fetch('/api/news-events', { params: { projectSlug: String(slug) } })
);
const more = computed(() =>
  (moreList.value || [])
    .filter((n) => n.documentId !== id && String(n.id) !== id && n.blog)
    .slice(0, 6)
);

function formatDate(iso: string) {
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

function formatAuthorLine(authors: unknown[]) {
  if (Array.isArray(authors)) {
    const names = authors
      .map((entry) =>
        typeof entry === 'string' ? entry : (entry as Record<string, unknown>)?.name
      )
      .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
      .map((name) => name.trim());
    if (names.length) return names.join(' • ');
  }
  return '';
}
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-8">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <!-- Main -->
        <div class="md:col-span-8">
          <div v-if="item">
            <div v-if="carouselImages.length" class="mb-5">
              <GalleryCarousel :images="carouselImages" :title="item.title" />
            </div>
            <div
              v-else-if="item.cover?.url"
              class="w-full h-[24rem] md:h-[30rem] rounded-lg overflow-hidden mb-5"
            >
              <img :src="item.cover.url" :alt="item.title" class="w-full h-full object-cover" />
            </div>

            <h1 class="text-2xl md:text-3xl font-display font-semibold mb-2">{{ item.title }}</h1>
            <div v-if="secondaryTitle" class="text-lg text-gray-700 font-display mb-2">
              {{ secondaryTitle }}
            </div>

            <!-- Author(s) with initials -->
            <div
              v-if="item.authors && item.authors.length > 0"
              class="flex items-center gap-3 mb-3 py-3 border-y border-gray-200"
            >
              <div class="flex -space-x-3">
                <div
                  v-for="(author, idx) in item.authors.slice(0, 3)"
                  :key="idx"
                  class="w-12 h-12 rounded-full bg-green-100 text-green-700 font-semibold border-2 border-white flex items-center justify-center overflow-hidden"
                  :title="author.name"
                >
                  <img
                    v-if="author.avatar?.url"
                    :src="author.avatar.url"
                    :alt="author.name"
                    class="w-full h-full object-cover"
                  />
                  <template v-else>
                    {{ author.name ? author.name.charAt(0).toUpperCase() : 'A' }}
                  </template>
                </div>
              </div>
              <div class="flex flex-col">
                <div class="text-sm text-gray-700">
                  <span v-if="item.authors.length === 1" class="font-semibold text-base">{{
                    item.authors[0]?.name
                  }}</span>
                  <span v-else-if="item.authors.length === 2" class="font-medium"
                    >{{ item.authors[0]?.name }} & {{ item.authors[1]?.name }}</span
                  >
                  <span v-else class="font-medium"
                    >{{ item.authors[0]?.name }} +{{ item.authors.length - 1 }} more</span
                  >
                </div>
              </div>
            </div>

            <!-- Fallback for old authorLine format -->
            <div
              v-else-if="authorLine"
              class="text-sm text-gray-600 flex items-center gap-2 mb-3 py-3 border-y border-gray-200"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-3.866 0-7 3.134-7 7 0 .552.448 1 1 1h12c.552 0 1-.448 1-1 0-3.866-3.134-7-7-7z"
                />
              </svg>
              <span class="font-medium">{{ authorLine }}</span>
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
              class="mdc-body prose text-justify max-w-none text-gray-800 space-y-6"
            />
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="md:col-span-4">
          <div class="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 sticky top-24">
            <h3
              class="text-xl font-display font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200"
            >
              More Posts
            </h3>
            <div class="space-y-6">
              <NuxtLink
                v-for="m in more"
                :key="m.documentId || m.id"
                :to="`${basePath}/blog/${m.documentId || m.id}`"
                class="flex gap-4 items-start group"
              >
                <div
                  class="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 shadow-sm"
                >
                  <img
                    v-if="m.cover?.url"
                    :src="m.cover.url"
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
                  <p v-if="m.authors" class="text-xs text-gray-500">
                    {{ formatAuthorLine(m.authors) }}
                  </p>
                </div>
              </NuxtLink>
            </div>
            <div class="mt-8 pt-5 border-t border-gray-200">
              <NuxtLink
                :to="`${basePath}/blog`"
                class="text-sm font-semibold text-green-700 hover:text-green-800 flex items-center gap-1.5 group w-fit"
              >
                View all posts
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
</style>
