<script setup lang="ts">
import { ref, computed } from 'vue';
import type { NewsEvent, Project, ResearchPublication } from '../../types/content';

useHead({
  title: 'LUCCC - Least Developed Countries Universities Consortium on Climate Change',
});
const config = useRuntimeConfig();

type HomeType = {
  About?: string;
  country_affiliations?: number;
  projects?: number;
  members?: number;
  years?: number;
  phone?: string;
  email?: string;
  address?: string;
};

type StrapiV5Single<T> = { data: { id?: number; attributes: T } };
type StrapiV4Single<T> = { data: T };

function hasKey<T extends string>(obj: unknown, key: T): obj is Record<T, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}

const { data: _home, error } = await useAsyncData<HomeType>('home', async () => {
  const url = `${config.strapi.url}/api/home`;
  const res: unknown = await $fetch(url, {
    headers: config.strapi.token ? { Authorization: `Bearer ${config.strapi.token}` } : {},
  });
  // Adapt to Strapi v4/v5 response shapes
  if (hasKey(res, 'data')) {
    const data = res.data;
    if (hasKey(data, 'attributes')) {
      return (data as StrapiV5Single<HomeType>['data']).attributes;
    }
    return data as StrapiV4Single<HomeType>['data'];
  }
  return res as HomeType;
});

if (error.value) {
  console.error('Failed to fetch home content from Strapi:', error.value);
}

// Fetch projects from our Nuxt server endpoint
const { data: projects } = await useAsyncData<Project[]>(
  'projects',
  async () => await $fetch('/api/projects')
);

// Fetch all News & Events
const { data: newsData } = await useAsyncData<NewsEvent[]>(
  'news-events-all',
  async () => (await $fetch('/api/news-events')) as NewsEvent[]
);

// Fetch all Publications
const { data: publications } = await useAsyncData<ResearchPublication[]>(
  'publications-all',
  async () => {
    const res = await $fetch('/api/publications');
    return (res as ResearchPublication[]) || [];
  }
);

const recentPublications = computed(() => {
  if (!publications.value || !publications.value.length) return [];
  return publications.value
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);
});

type PubItem = {
  isSeeMore?: boolean;
  id: string | number;
  title: string;
  abstract: string;
  date?: string;
  documentId?: string;
  tags?: { tag: string }[];
  publication_type?: { type: string };
};

const pubItems = computed<PubItem[]>(() => {
  const items: PubItem[] = [...recentPublications.value].map((p) => ({
    ...p,
    id: p.documentId || p.id,
    abstract: p.abstract || '',
  }));

  items.push({
    isSeeMore: true,
    id: 'see-more-card',
    title: 'Explore All Resources',
    abstract:
      'Discover more publications, training materials, and funding opportunities in our comprehensive Resource Hub.',
  });
  return items;
});

const pubPageSize = 3;
const currentPubPage = ref(1);
const totalPubPages = computed(() => Math.max(1, Math.ceil(pubItems.value.length / pubPageSize)));
const visiblePubs = computed(() => {
  const start = (currentPubPage.value - 1) * pubPageSize;
  return pubItems.value.slice(start, start + pubPageSize);
});
function goToPubPage(page: number) {
  if (page < 1 || page > totalPubPages.value) return;
  currentPubPage.value = page;
}

function excerpt(text?: string | null, n = 220) {
  if (!text) return '';
  const t = String(text);
  return t.length > n ? t.slice(0, n) + '…' : t;
}

// News items logic
const homeNewsItems = computed(() => {
  const items: (NewsEvent & { isSeeMore?: boolean; body?: string })[] = (newsData.value || [])
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8)
    .map((e) => ({ ...e, isSeeMore: false }));

  items.push({
    id: 'see-more-news',
    isSeeMore: true,
    title: 'Explore All News & Events',
    body: 'Stay updated with the latest activities, workshops, and news from our consortium.',
  });

  return items;
});

const newsPageSize = 3;
const currentNewsPage = ref(1);
const totalNewsPages = computed(() =>
  Math.max(1, Math.ceil(homeNewsItems.value.length / newsPageSize))
);
const visibleNews = computed(() => {
  const start = (currentNewsPage.value - 1) * newsPageSize;
  return homeNewsItems.value.slice(start, start + newsPageSize);
});
function goToNewsPage(page: number) {
  if (page < 1 || page > totalNewsPages.value) return;
  currentNewsPage.value = page;
}
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <HomeProjectCarousel :projects="projects || []" />
    <AboutUsSection :title="'About'" />

    <!-- Objectives -->
    <section class="w-full bg-white py-16">
      <div class="max-w-6xl mx-auto px-4 md:px-0">
        <h3 class="text-[22px] md:text-[26px] font-display font-semibold mb-6 text-green-700">
          Objectives
        </h3>
        <ul
          class="list-disc pl-6 space-y-4 text-gray-700 leading-relaxed marker:text-green-600 text-lg"
        >
          <li>
            To foster a South-South collaborative network for promoting education and skills,
            research capacity and developing multi-dimensional expertise in climate change.
          </li>
          <li>
            To enhance the capacity of LDC universities through joint research programmes and
            implement teaching and demand-driven training programs in various climate change issues.
          </li>
          <li>
            To develop capacity and work with the most vulnerable countries and communities to
            foster two-way collaborative learning and capacity-building – blending action &amp;
            scientific research.
          </li>
          <li>
            To enable LDC universities &amp; affiliated research/training institutes to serve as
            repositories of knowledge and generators-suppliers of capacity.
          </li>
          <li>
            To provide policy support to governments in handling climate change impacts, both
            nationally &amp; internationally.
          </li>
        </ul>
      </div>
    </section>

    <!-- LUCCC Partners -->
    <section class="w-full bg-gray-50 py-16 border-t border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 md:px-0">
        <h3 class="text-[22px] md:text-[26px] font-display font-semibold mb-4 text-green-700">
          LUCCC Partners
        </h3>
        <p class="text-gray-700 text-lg leading-relaxed mb-10 max-w-3xl">
          The Consortium is managed at the moment by the International Centre for Climate Change and
          Development (ICCCAD) at Independent University, Bangladesh (IUB) in Dhaka. A Governing
          Board as well as an Executive Committee will be formed soon to collectively run LUCCC.
        </p>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <LucccPartnerMap />
        </div>
      </div>
    </section>

    <!-- Featured Publications -->
    <section class="w-full bg-white py-16">
      <div class="max-w-6xl mx-auto px-4 md:px-0">
        <h2
          class="text-center text-[28px] md:text-[32px] font-display font-semibold mb-10 text-gray-900"
        >
          Featured Publications
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article
            v-for="p in visiblePubs"
            :key="p.id"
            class="flex flex-col border border-gray-200 rounded-xl bg-white p-6 hover:shadow-md transition-shadow h-full"
          >
            <NuxtLink
              v-if="!p.isSeeMore"
              :to="`/resource-hub/${p.documentId || p.id}`"
              class="flex flex-col h-full"
            >
              <h3
                class="text-lg md:text-xl font-semibold text-green-800 mb-3 line-clamp-3 hover:underline"
              >
                {{ p.title }}
              </h3>
              <p class="text-sm text-gray-600 mb-4 flex-grow">{{ excerpt(p.abstract, 160) }}</p>

              <div class="mt-auto pt-4 border-t border-gray-100">
                <div
                  class="flex items-center justify-between mb-3 text-xs text-gray-500 font-medium"
                >
                  <span v-if="p.date" class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                        stroke-width="2"
                      />
                    </svg>
                    {{
                      new Date(p.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                      })
                    }}
                  </span>
                  <span v-if="p.publication_type?.type" class="text-green-600">{{
                    p.publication_type.type
                  }}</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="(tag, idx) in (p.tags || []).slice(0, 3)"
                    :key="idx"
                    class="inline-block text-[11px] px-2 py-0.5 rounded-full border border-green-200 text-green-700 bg-green-50/50 truncate max-w-[120px]"
                  >
                    {{ tag.tag }}
                  </span>
                </div>
              </div>
            </NuxtLink>

            <!-- Final "See More" Card -->
            <NuxtLink
              v-else
              to="/resource-hub"
              class="flex flex-col h-full items-center justify-center text-center group"
            >
              <div
                class="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors"
              >
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-green-800 mb-3 group-hover:underline">
                {{ p.title }}
              </h3>
              <p class="text-sm text-gray-600">{{ p.abstract }}</p>
            </NuxtLink>
          </article>
        </div>

        <!-- Pagination for Publications -->
        <div v-if="totalPubPages > 1" class="mt-12 flex items-center justify-center gap-2">
          <button
            v-for="page in totalPubPages"
            :key="'pub-' + page"
            :aria-current="page === currentPubPage ? 'true' : 'false'"
            class="min-w-[36px] h-9 px-3 text-sm font-medium rounded-md border transition-colors"
            :class="
              page === currentPubPage
                ? 'bg-green-600 text-white border-green-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            "
            @click="goToPubPage(page)"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </section>

    <!-- News and Events -->
    <section class="w-full bg-green-50/30 py-16 border-t border-gray-100">
      <div class="max-w-6xl mx-auto px-4 md:px-0">
        <h2
          class="text-center text-[28px] md:text-[32px] font-display font-semibold mb-10 text-gray-900"
        >
          News and Events
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article
            v-for="e in visibleNews"
            :key="e.id"
            class="border border-gray-200 rounded-xl bg-white overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col"
          >
            <NuxtLink
              v-if="!e.isSeeMore"
              :to="`/news-events/${e.documentId || e.id}`"
              class="flex flex-col h-full group"
            >
              <div class="w-full h-48 flex-shrink-0 bg-gray-100">
                <img
                  v-if="e.cover?.url"
                  :src="e.cover.url"
                  :alt="e.title"
                  class="w-full h-full object-cover"
                >
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div class="p-5 flex flex-col justify-center flex-grow">
                <div class="text-xs text-green-600 font-medium mb-2">
                  {{ e.date ? new Date(e.date).toLocaleDateString() : 'News' }}
                </div>
                <h3
                  class="text-[17px] font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors line-clamp-2"
                >
                  {{ e.title }}
                </h3>
                <p class="text-sm text-gray-600 line-clamp-2">{{ excerpt(e.body, 120) }}</p>
              </div>
            </NuxtLink>

            <!-- Final "See More" Card -->
            <NuxtLink
              v-else
              to="/news-events"
              class="flex flex-col h-full items-center justify-center text-center group p-6"
            >
              <div
                class="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors"
              >
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-green-800 mb-3 group-hover:underline">
                {{ e.title }}
              </h3>
              <p class="text-sm text-gray-600">{{ e.body }}</p>
            </NuxtLink>
          </article>
        </div>
        <!-- Pagination -->
        <div v-if="totalNewsPages > 1" class="mt-12 flex items-center justify-center gap-2">
          <button
            v-for="page in totalNewsPages"
            :key="page"
            :aria-current="page === currentNewsPage ? 'true' : 'false'"
            class="min-w-[36px] h-9 px-3 text-sm font-medium rounded-md border transition-colors"
            :class="
              page === currentNewsPage
                ? 'bg-green-600 text-white border-green-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            "
            @click="goToNewsPage(page)"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </section>

    <!-- Contact Information -->
    <section class="w-full bg-white py-16">
      <div class="max-w-6xl mx-auto px-4 md:px-0">
        <div
          class="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-8 md:p-10 border border-green-100 shadow-sm"
        >
          <h3 class="text-2xl font-bold text-green-900 mb-8 text-center">Contact Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left h-full">
            <div class="bg-white/60 p-5 rounded-xl backdrop-blur-sm flex flex-col h-full">
              <p class="text-lg font-bold text-green-900 mb-1">Prof. Mizan R. Khan</p>
              <p class="text-sm text-gray-700 mb-3">Programme Director (LUCCC), ICCCAD at IUB.</p>
              <a
                href="mailto:mizan.khan@icccad.org"
                class="inline-flex items-center gap-2 text-green-700 hover:text-green-800 hover:underline transition-colors text-sm font-medium mt-auto"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                mizan.khan@icccad.org
              </a>
            </div>
            <div class="bg-white/60 p-5 rounded-xl backdrop-blur-sm flex flex-col h-full">
              <p class="text-lg font-bold text-green-900 mb-1">Md Fahad Hossain</p>
              <a
                href="mailto:fahad.hossain@icccad.org"
                class="inline-flex items-center gap-2 text-green-700 hover:text-green-800 hover:underline transition-colors text-sm font-medium mt-auto"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                fahad.hossain@icccad.org
              </a>
            </div>
            <div class="bg-white/60 p-5 rounded-xl backdrop-blur-sm flex flex-col h-full">
              <p class="text-lg font-bold text-green-900 mb-1">Fahmid Mohtasin</p>
              <a
                href="mailto:fahmid.mohtasin@icccad.org"
                class="inline-flex items-center gap-2 text-green-700 hover:text-green-800 hover:underline transition-colors text-sm font-medium mt-auto"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                fahmid.mohtasin@icccad.org
              </a>
            </div>
          </div>
        </div>
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
</style>
