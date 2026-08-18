<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

// Route + derived project name
const route = useRoute();
const slug = route.params.slug;
const hasChild = computed(() => Boolean(route.params.id));
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

useHead(() => ({
  title: `COLOCAL Blog — ${projectName.value}`,
}));
useSeoMeta({
  description: () =>
    `Insights, updates, and stories from the ${projectName.value} COLOCAL project on locally led adaptation to climate change.`,
});

// Use shared project navbar
const basePath = computed(() => `/projects/${slug}`);

// Fetch LLA publications for this project
// const { data: pubsData } = await useAsyncData(
//   () => `lla-publications:${slug}`,
//   () => $fetch('/api/publications', { params: { projectSlug: String(slug) } })
// );
// const llaPublications = computed(() => (pubsData.value || []).filter((p) => p.lla));

// Simple pagination for publications
// const pageSize = 5;
// const page = ref(1);
// const totalPages = computed(() =>
//   Math.max(1, Math.ceil((llaPublications.value?.length || 0) / pageSize))
// );
// const visible = computed(() => {
//   const start = (page.value - 1) * pageSize;
//   return (llaPublications.value || []).slice(start, start + pageSize);
// });

// Fetch LLA news & events for this project
const { data: newsData } = await useAsyncData(
  () => `lla-news-events:${slug}`,
  () => $fetch('/api/news-events', { params: { projectSlug: String(slug) } })
);

// Fetch all authors with avatars
const { data: authorsData } = await useAsyncData('all-authors', () =>
  $fetch('/api/authors', { query: { pageSize: '200' } })
);

// Merge author avatars into news events
const llaNewsEvents = computed(() => {
  const events = (newsData.value || []).filter((n) => n.blog);
  const authorsMap = new Map();

  // Create a map of author ID to full author data (with avatars)
  if (authorsData.value?.data) {
    authorsData.value.data.forEach((author) => {
      authorsMap.set(author.id, author);
    });
  }

  // Merge author avatars into events
  return events.map((event) => {
    if (event.authors && Array.isArray(event.authors)) {
      const enrichedAuthors = event.authors.map((author) => {
        const fullAuthor = authorsMap.get(author.id);
        if (fullAuthor && fullAuthor.avatar) {
          return { ...author, avatar: fullAuthor.avatar };
        }
        return author;
      });
      return { ...event, authors: enrichedAuthors };
    }
    return event;
  });
});

// Pagination for blog posts
const pageSize = 6;
const page = ref(1);
const totalPages = computed(() =>
  Math.max(1, Math.ceil((llaNewsEvents.value?.length || 0) / pageSize))
);
const visiblePosts = computed(() => {
  const start = (page.value - 1) * pageSize;
  return (llaNewsEvents.value || []).slice(start, start + pageSize);
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
      <!-- Breadcrumb -->
      <!-- <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'Projects & Programmes', href: '/projects' },
        { text: projectName, href: basePath },
        { text: 'LLA Hub', href: '' },
      ]"
      :page-title="projectName + ' — LLA Hub'"
    /> -->

      <!-- Secondary navbar (links to sibling pages) -->
      <!-- <ProjectNavbar :project="project" :slug="String(slug)" /> -->

      <!-- Intro/description -->
      <section class="w-full max-w-6xl mx-auto py-10 px-4 md:px-0">
        <h1 class="text-[26px] md:text-[30px] font-display font-medium mb-3">COLOCAL Blog</h1>
        <p class="text-gray-700 leading-relaxed max-w-6xl">
          COLOCAL Blog is a platform for sharing insights, updates, and stories related to our
          collaborative local development initiatives. Here, we explore topics such as community
          engagement, sustainable practices, and innovative solutions that drive positive change at
          the local level.
        </p>
        <BlogSubmissionBanner variant="strip" class="mt-6" />
        <!-- <p class="mt-4 text-gray-700"> -->
        <!--   If you would like to contribute to the COLOCAL Blog, please contact us at: -->
        <!--   <a href="mailto:mail2ena@gmail.com" class="text-green-700 underline" aria-label="Email COLOCAL Blog">mail2ena@gmail.com</a> -->
        <!-- </p> -->
      </section>

      <!-- Publications list (LLA only) -->
      <!-- <section v-if="llaPublications.length > 0" class="w-full max-w-6xl mx-auto px-4 md:px-0 pb-12">
      <h2 class="text-center text-[24px] md:text-[28px] font-display font-medium mb-6">
        Featured Publications
      </h2>
      <div class="space-y-4">
        <article
          v-for="p in visible"
          :key="p.id"
          class="border border-gray-200 rounded-md bg-white p-4 md:p-5"
        >
          <NuxtLink :to="`${basePath}/research/${p.id}`" class="block">
            <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-2 hover:text-green-700">
              {{ p.title }}
            </h3>
            <div class="flex items-center text-sm text-gray-600 mb-3">
              <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87" stroke-width="2" />
                <circle cx="12" cy="7" r="4" stroke-width="2" />
              </svg>
              <span>{{ (p.authors || []).map((a) => a.name).join(' • ') }}</span>
            </div>
            <p class="text-sm text-gray-700 mb-3">{{ p.abstract }}</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(tag, idx) in p.tags || []"
                :key="idx"
                class="inline-block text-xs px-2 py-1 rounded border border-green-200 text-green-700 bg-green-50"
                >{{ tag.tag }}</span
              >
            </div>
          </NuxtLink>
        </article>
      </div> -->

      <!-- Pagination -->
      <!-- <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-2">
        <button
          v-for="i in totalPages"
          :key="i"
          class="min-w-[32px] h-7 px-2 text-sm rounded border"
          :class="
            i === page
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-800 border-gray-300'
          "
          @click="page = i"
        >
          {{ i }}
        </button>
      </div>
    </section> -->

      <!-- Blog Posts -->
      <section v-if="llaNewsEvents.length > 0" class="w-full max-w-6xl mx-auto px-4 md:px-0 pb-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="post in visiblePosts"
            :key="post.id"
            class="border border-gray-200 rounded-lg bg-white overflow-hidden hover:shadow-lg transition-shadow"
          >
            <NuxtLink :to="`${basePath}/blog/${post.documentId || post.id}`" class="block">
              <!-- Featured Image -->
              <div class="w-full h-48 overflow-hidden">
                <img
                  :src="post.cover?.url"
                  :alt="post.title"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <!-- Content -->
              <div class="p-5">
                <!-- Date -->
                <div class="flex items-center text-xs text-gray-500 mb-2">
                  <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                      stroke-width="2"
                    />
                  </svg>
                  <span>{{ formatDate(post.date) }}</span>
                </div>

                <!-- Title -->
                <h3
                  class="text-lg font-semibold text-gray-900 mb-2 hover:text-green-700 line-clamp-2"
                >
                  {{ post.title }}
                </h3>

                <!-- Excerpt -->
                <p class="text-sm text-gray-700 mb-4 line-clamp-3">
                  {{ excerpt(post.body, 120) }}
                </p>

                <!-- Author(s) -->
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

      <!-- Education and Trainings (LLA only) -->
      <!-- <section v-if="llaEduTrainings.length > 0" class="w-full max-w-7xl mx-auto px-4 md:px-0 pb-12">
      <h2 class="text-center text-[24px] md:text-[28px] font-display font-medium mb-6">
        Education and Training
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article
          v-for="e in llaEduTrainings"
          :key="e.id"
          class="border border-gray-200 rounded-md bg-white overflow-hidden flex"
        >
          <NuxtLink :to="`${basePath}/education/${e.documentId || e.id}`" class="flex gap-4 items-start p-3 md:p-4">
            <div class="w-36 h-24 flex-shrink-0 rounded overflow-hidden">
              <img :src="e.cover?.url" :alt="e.title" class="w-full h-full object-cover" />
            </div>
            <div>
              <h3 class="text-[16px] font-semibold text-green-800 mb-1 hover:underline">
                {{ e.title }}
              </h3>
              <p class="text-sm text-gray-700 line-clamp-3">{{ excerpt(e.body) }}</p>
            </div>
          </NuxtLink>
        </article>
      </div>
    </section> -->
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

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
