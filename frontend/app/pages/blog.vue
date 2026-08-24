<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from '#app';
import type { NewsEvent, StrapiMedia } from '~~/types/content';

useHead({
  title: 'Blog Post — LUCCC',
});
useSeoMeta({
  description:
    'Insights, updates, and stories from across the LUCCC consortium on locally led adaptation to climate change.',
});

// Route + nested check
const route = useRoute();
const hasChild = computed(() => Boolean(route.params.id));

// Blog posts are News & Events flagged as blog
const { data: newsData } = await useAsyncData<NewsEvent[]>(
  'news-events-all',
  async () => (await $fetch('/api/news-events')) as NewsEvent[]
);

// Author avatars are only returned by the authors endpoint
const { data: authorsData } = await useAsyncData('all-authors', () =>
  $fetch('/api/authors', { query: { pageSize: '200' } })
);

const posts = computed(() => {
  const entries = (newsData.value ?? []).filter((n) => n.blog);
  const authorsMap = new Map<number, { avatar?: unknown }>();
  if (authorsData.value?.data) {
    authorsData.value.data.forEach((author) => {
      authorsMap.set(author.id, author);
    });
  }
  return entries.map((entry) => {
    if (!Array.isArray(entry.authors)) return entry;
    const enrichedAuthors = entry.authors.map((author) => {
      const fullAuthor = authorsMap.get(author.id);
      if (fullAuthor && fullAuthor.avatar) {
        return { ...author, avatar: fullAuthor.avatar };
      }
      return author;
    });
    return { ...entry, authors: enrichedAuthors };
  });
});

// Project filter
const projectSlug = ref('');
const filtered = computed(() => {
  if (!projectSlug.value) return posts.value;
  return posts.value.filter((entry) =>
    (entry.projectRefs ?? []).some((ref) => ref.slug === projectSlug.value)
  );
});

// Carousel: the five most recent blog posts with a cover image
type CarouselItem = {
  id: string;
  title: string;
  description: string;
  cover: string | StrapiMedia | null | undefined;
  type: 'research' | 'outreach' | 'education';
  slug: string;
  to: string;
};

const carouselItems = computed<CarouselItem[]>(() =>
  filtered.value
    .filter((p) => Boolean(p.cover && p.cover.url))
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((p) => ({
      id: String(p.documentId || p.id),
      title: p.secondaryTitle || p.title,
      description: excerpt(p.body, 140),
      cover: p.cover,
      slug: '',
      type: 'outreach' as const,
      to: `/blog/${p.documentId || p.id}`,
    }))
);

// Pagination
const pageSize = 9;
const page = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const visible = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

watch(projectSlug, () => {
  page.value = 1;
});

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
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <NuxtPage v-if="hasChild" />
    <template v-else>
      <BreadCrumb
        :breadcrumb-items="[
          { text: 'Home', href: '/' },
          { text: 'Blog Post', href: '/blog' },
        ]"
        page-title="Blog Post"
      />

      <!-- Carousel -->
      <section v-if="carouselItems.length" class="w-full mx-auto px-0 md:px-0">
        <ResearchOutreachCarousel :items="carouselItems" />
      </section>

      <section class="w-full max-w-6xl mx-auto py-10 px-4 md:px-0">
        <h1 class="text-[26px] md:text-[30px] font-display font-medium mb-3">Blog Post</h1>
        <p class="text-gray-700 leading-relaxed max-w-6xl">
          The LUCCC blog is a platform for sharing insights, updates, and stories from across the
          consortium — community engagement, sustainable practices, and innovative solutions that
          drive positive change at the local level.
        </p>
        <!-- Project filter -->
        <ProjectFilter v-model="projectSlug" :items="posts" class="mt-6" />

        <!-- Grid -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="post in visible"
            :key="post.id"
            class="border border-gray-200 rounded-lg bg-white overflow-hidden hover:shadow-lg transition-shadow"
          >
            <NuxtLink :to="`/blog/${post.documentId || post.id}`" class="block">
              <div class="w-full h-48 overflow-hidden">
                <NuxtImg
                  :src="post.cover?.url"
                  :alt="post.title"
                  sizes="100vw sm:50vw lg:380px"
                  format="webp"
                  quality="80"
                  loading="lazy"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div class="p-5">
                <div class="flex items-center text-xs text-gray-500 mb-2">
                  <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                      stroke-width="2"
                    />
                  </svg>
                  <span>{{ formatDate(post.date) }}</span>
                </div>

                <h3
                  class="text-lg font-semibold text-gray-900 mb-2 hover:text-green-700 line-clamp-2"
                >
                  {{ post.title }}
                </h3>

                <p class="text-sm text-gray-700 mb-4 line-clamp-3">
                  {{ excerpt(post.body, 120) }}
                </p>

                <div v-if="post.authors && post.authors.length > 0" class="flex items-center gap-2">
                  <div class="flex -space-x-2">
                    <div
                      v-for="(author, idx) in post.authors.slice(0, 3)"
                      :key="idx"
                      class="w-8 h-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center overflow-hidden text-green-700 text-xs font-bold"
                      :title="author.name"
                    >
                      <img
                        v-if="author.avatar?.url"
                        :src="author.avatar.url"
                        :alt="author.name"
                        class="w-full h-full object-cover"
                      />
                      <span v-else>{{
                        author.name ? author.name.charAt(0).toUpperCase() : 'U'
                      }}</span>
                    </div>
                  </div>
                  <div class="text-xs text-gray-600">
                    <span v-if="post.authors.length === 1">{{ post.authors[0]?.name }}</span>
                    <span v-else-if="post.authors.length === 2"
                      >{{ post.authors[0]?.name }} & {{ post.authors[1]?.name }}</span
                    >
                    <span v-else
                      >{{ post.authors[0]?.name }} +{{ post.authors.length - 1 }} more</span
                    >
                  </div>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>

        <p v-if="!visible.length" class="text-center text-gray-600 py-10">
          No blog posts match the current filter.
        </p>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-10 flex items-center justify-center gap-2">
          <button
            v-for="i in totalPages"
            :key="i"
            :aria-label="`Go to page ${i}`"
            class="min-w-[32px] h-8 px-3 text-sm rounded border transition-colors"
            :class="
              i === page
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-800 border-gray-300 hover:border-green-400'
            "
            @click="page = i"
          >
            {{ i }}
          </button>
        </div>
      </section>

      <!-- Blog submission banner -->
      <section class="w-full max-w-4xl mx-auto px-4 md:px-0 pb-14">
        <a
          href="https://forms.gle/YyzkQuzEQAW5ZVgx9"
          target="_blank"
          rel="noopener noreferrer"
          class="block rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          <img
            src="/images/blog-banner.svg"
            alt="Submit a blog post — opens the submission form"
            width="1600"
            height="400"
            loading="lazy"
            class="w-full h-auto"
          />
        </a>
      </section>
    </template>
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

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
