<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useRoute } from '#app';
import type {
  EducationTraining,
  Project,
  ResearchPublication,
  NewsEvent,
  StrapiMedia,
} from '~~/types/content';
import img1 from '~/assets/images/carousel-1.png';
import img2 from '~/assets/images/carousel-2.png';
// Served from public/ so @nuxt/image (IPX) can resolve & optimize it.
const researchPlaceholder = '/research-placeholder.jpg';

const route = useRoute();
const slug = route.params.slug;

// Fetch the specific project by slug from our Nuxt server endpoint
const { data: project, error: _projectError } = await useAsyncData<Project | null>(
  () => `project-${slug}`,
  async () => {
    const res = await $fetch('/api/projects', { query: { slug: String(slug) } });
    return res as Project | null;
  }
);

useHead(() => {
  const p = project.value;
  const canonicalUrl = `https://www.luccc.org/projects/${slug}`;
  const pageTitle = p?.shortTitle
    ? `${p.shortTitle} — Co-creating Knowledge for Local Climate Adaptation | LUCCC`
    : 'Projects & Programmes — LUCCC';
  const metaDesc =
    p?.shortDescription ||
    `${p?.shortTitle || 'COLOCAL'} is a NORHED-II funded programme for locally led climate change adaptation with universities in Bangladesh, Mozambique, Nepal, Uganda and Norway.`;

  const ogImage = p?.cover?.url || 'https://www.luccc.org/og-image.jpg';
  const ogImageAlt = p?.longTitle || p?.shortTitle || 'COLOCAL project';

  return {
    title: pageTitle,
    meta: [
      { name: 'description', content: metaDesc.slice(0, 160) },
      {
        name: 'keywords',
        content: `${p?.shortTitle || 'COLOCAL'}, LUCCC, locally led adaptation, climate change adaptation, NORHED-II, Global South universities, Bangladesh, Mozambique, Nepal, Uganda, Norway`,
      },
      { property: 'og:title', content: p?.longTitle || p?.shortTitle || 'COLOCAL' },
      { property: 'og:description', content: metaDesc.slice(0, 200) },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: ogImage },
      { property: 'og:image:alt', content: ogImageAlt },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: p?.longTitle || p?.shortTitle || 'COLOCAL' },
      { name: 'twitter:description', content: metaDesc.slice(0, 200) },
      { name: 'twitter:image', content: ogImage },
      { name: 'twitter:image:alt', content: ogImageAlt },
    ],
    link: [{ rel: 'canonical', href: canonicalUrl }],
    script: p
      ? [
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ResearchProject',
              name: p.longTitle || p.shortTitle,
              alternateName: p.shortTitle,
              url: canonicalUrl,
              description: metaDesc.slice(0, 300),
              funder: { '@type': 'Organization', name: 'NORAD / NORHED-II' },
              parentOrganization: {
                '@type': 'Organization',
                name: 'LUCCC',
                url: 'https://www.luccc.org',
              },
            }),
          },
        ]
      : [],
  };
});

// Share project in state so sibling pages under this slug can access it easily
const projectKey = `project:${slug}`;
const sharedProject = useState<Project | null>(projectKey, () => null);
watchEffect(() => {
  sharedProject.value = project.value ?? null;
});

// Use shared project navbar
const basePath = computed(() => `/projects/${slug}`);
const hasChild = computed(() => Boolean(route.params.id));

// Publications data (fetch via server endpoint filtered by project slug)
const { data: publications } = await useAsyncData<ResearchPublication[]>(
  () => `publications-${slug}`,
  async () => {
    const res = await $fetch('/api/publications', { query: { projectSlug: String(slug) } });
    return (res as ResearchPublication[]) || [];
  }
);

const recentPublications = computed(() => {
  if (!publications.value || !publications.value.length) return [];
  return publications.value
    .slice()
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 8);
});

const pubItems = computed(() => {
  if (!recentPublications.value.length) {
    return [
      {
        id: 'see-more-card',
        isSeeMore: true,
        title: 'Explore All Resources',
        abstract:
          'Discover more publications, training materials, and research outputs in our comprehensive repository.',
      },
    ];
  }

  const items: (ResearchPublication & { isSeeMore?: boolean })[] = recentPublications.value.map(
    (p) => ({ ...p, isSeeMore: false })
  );

  items.push({
    id: 'see-more-card',
    isSeeMore: true,
    title: 'Explore All Resources',
    abstract:
      'Discover more publications, training materials, and research outputs in our comprehensive repository.',
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

// // Featured publications (sample data + pagination)
// const publications = ref([
//   {
//     id: 1,
//     title: 'Integrating Gender Equality and Social Inclusion (GESI) in Climate Finance',
//     authors: ['Ranjana Bhatta', 'Laxmi Chinnal', 'Ajay Bhakta Mathema', 'Mariama Camara'],
//     excerpt:
//       'Climate change disproportionately affects vulnerable and marginalized communities, exacerbating existing inequalities. Integrating Gender Equality and Social Inclusion (GESI) into climate finance is crucial to ensuring that adaptation and mitigation efforts are fair, inclusive, and effective.',
//     tags: ['Integrating', 'Gender Equality', 'Social Inclusion', 'Climate Finance'],
//   },
//   {
//     id: 2,
//     title: 'Integrating Gender Equality and Social Inclusion (GESI) in Climate Finance',
//     authors: ['Ranjana Bhatta', 'Laxmi Chinnal', 'Ajay Bhakta Mathema', 'Mariama Camara'],
//     excerpt:
//       'Climate change disproportionately affects vulnerable and marginalized communities, exacerbating existing inequalities. Integrating Gender Equality and Social Inclusion (GESI) into climate finance is crucial to ensuring that adaptation and mitigation efforts are fair, inclusive, and effective.',
//     tags: ['Integrating', 'Gender Equality', 'Social Inclusion', 'Climate Finance'],
//   },
//   {
//     id: 3,
//     title: 'Community Resilience Pathways',
//     authors: ['Alex Karim', 'Rifat Hasan'],
//     excerpt:
//       'Pathways for building community resilience through inclusive adaptation planning and multi-stakeholder collaboration.',
//     tags: ['Resilience', 'Adaptation'],
//   },
// ]);
// const pubPage = ref(1);
// const pubSize = 2;
// const pubTotal = computed(() => Math.max(1, Math.ceil(publications?.value.length / pubSize)));
// const pubVisible = computed(() => {
//   const start = (pubPage.value - 1) * pubSize;
//   return publications.value.slice(start, start + pubSize);
// });

type NewsCard = {
  id: number | string;
  title: string;
  excerpt: string;
  image: string;
  to: string;
};

type CarouselItem = {
  id: string;
  title: string;
  description: string;
  cover: StrapiMedia | string | null | undefined;
  type: 'research' | 'outreach' | 'education';
  slug: string;
};

const fallbackNews: NewsCard[] = [
  {
    id: 1,
    title: 'LLA Seminar at IUB',
    excerpt: 'Lorem ipsum dolor sit amet consectetur. Id id cursus iaculis duis.',
    image: img1,
    to: '#',
  },
  {
    id: 2,
    title: 'UNI-Lead Mini Workshop',
    excerpt: 'Pretium quam lectus magna convallis. Sed at venenatis porta.',
    image: img2,
    to: '#',
  },
  {
    id: 3,
    title: 'Community Resilience Dialogue',
    excerpt: 'A venenatis nunc senectus arcu sem.',
    image: img1,
    to: '#',
  },
  {
    id: 4,
    title: 'COLOCAL Workshop Series',
    excerpt: 'Lorem ipsum dolor sit amet consectetur.',
    image: img2,
    to: '#',
  },
];

const { data: newsEvents } = await useAsyncData<NewsEvent[] | null>(
  () => `news-events-${slug}`,
  async () => {
    const res = await $fetch('/api/news-events', { query: { projectSlug: String(slug) } });
    return (res as NewsEvent[]) || [];
  }
);

const { data: educationTraining } = await useAsyncData<EducationTraining[] | null>(
  () => `education-training-${slug}`,
  async () => {
    const res = await $fetch('/api/education-trainings', { query: { projectSlug: String(slug) } });
    return (res as EducationTraining[]) || [];
  }
);

// const educationItems = computed(() => {
//   const items = educationTraining.value;
//   if (Array.isArray(items) && items.length) {
//     return items.map((item) => ({
//       id: item.id,
//       title: item.title,
//       excerpt: excerpt(item.body, 160),
//       image: item.cover?.url || '',
//       to: `${basePath.value}/education/${item.id}`,
//     }));
//   }
//   return [];
// });

const newsItems = computed<NewsCard[]>(() => {
  const newsEventItems = Array.isArray(newsEvents.value) ? newsEvents.value : [];
  const educationItems = Array.isArray(educationTraining.value) ? educationTraining.value : [];

  console.log('educationItems', educationItems);

  const newsCards: NewsCard[] = [];

  // Add news events
  newsEventItems.forEach((item) => {
    const formats = item.cover?.formats || {};
    const image = formats.medium?.url || formats.small?.url || item.cover?.url || '';
    newsCards.push({
      id: item.documentId || item.id,
      title: item.title,
      excerpt: excerpt(item.body, 160),
      image,
      to: `${basePath.value}/outreach/${item.documentId || item.id}`,
    } satisfies NewsCard);
  });

  // Add education training items
  educationItems.forEach((item) => {
    const formats = item.cover?.formats || {};
    const image = formats.medium?.url || formats.small?.url || item.cover?.url || '';
    newsCards.push({
      id: item.documentId || item.id,
      title: item.title,
      excerpt: excerpt(item.body, 160),
      image,
      to: `${basePath.value}/education/${item.documentId || item.id}`,
    } satisfies NewsCard);
  });

  return newsCards.length > 0 ? newsCards : fallbackNews;
});

const homeNewsItems = computed(() => {
  const items: (NewsCard & { isSeeMore?: boolean })[] = newsItems.value
    .slice(0, 8)
    .map((n) => ({ ...n, isSeeMore: false }));

  items.push({
    id: 'see-more-news',
    isSeeMore: true,
    title: 'Explore All News & Events',
    excerpt: 'Stay updated with the latest activities, workshops, and news from our project.',
    image: '',
    to: '',
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

const researchCarouselItems = computed<CarouselItem[]>(() => {
  const list = Array.isArray(publications.value) ? publications.value : [];
  const validList = list
    .filter((p) => p !== null) // keep all items, even without cover
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  const journalPubs = validList
    .filter((p) => p.publication_type?.type?.toLowerCase().includes('journal'))
    .slice(0, 2);
  const policyBriefs = validList
    .filter((p) => p.publication_type?.type?.toLowerCase().includes('policy'))
    .slice(0, 1);

  let selectedPubs = [...journalPubs, ...policyBriefs];

  if (selectedPubs.length < 3) {
    const remaining = validList.filter((p) => !selectedPubs.includes(p));
    selectedPubs = [...selectedPubs, ...remaining].slice(0, 3);
  }

  return selectedPubs.map((p) => ({
    id: String(p.documentId || p.id),
    title: p.secondaryTitle || p.title,
    description: excerpt(p.abstract, 140),
    cover: p.imageCover?.url ? p.imageCover : researchPlaceholder,
    type: 'research',
    slug: basePath.value,
  }));
});

const outreachCarouselItems = computed<CarouselItem[]>(() => {
  const list = Array.isArray(newsEvents.value) ? newsEvents.value : [];
  const validList = list
    .filter((n) => n !== null) // keep all items
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  const blogs = validList.filter((n) => n.blog).slice(0, 2);
  const nonBlogs = validList.filter((n) => !n.blog).slice(0, 2);

  return [...blogs, ...nonBlogs].map((n) => ({
    id: String(n.documentId || n.id),
    title: n.secondaryTitle || n.title,
    description: excerpt(n.body, 140),
    cover: n.cover,
    slug: basePath.value,
    type: 'outreach',
  }));
});

const educationCarouselItems = computed<CarouselItem[]>(() => {
  const list = Array.isArray(educationTraining.value) ? educationTraining.value : [];
  return list
    .filter((e) => e !== null) // keep all items
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 2)
    .map((e) => ({
      id: String(e.documentId || e.id),
      title: e.title,
      description: excerpt(e.body, 140),
      cover: e.cover,
      slug: basePath.value,
      type: 'education',
    }));
});

const carouselItems = computed<CarouselItem[]>(() => [
  ...researchCarouselItems.value,
  ...outreachCarouselItems.value,
  ...educationCarouselItems.value,
]);

// Fellows (static grid)
const _fellows = ref([
  { id: 1, name: 'António Guterres', affiliation: 'Universidade Eduardo Mondlane' },
  { id: 2, name: 'Rafia Anjum Rimi', affiliation: 'Independent University, Bangladesh' },
  { id: 3, name: 'Tenzing Norgay', affiliation: 'Pokhara University' },
  { id: 4, name: 'Celia', affiliation: 'Makerere University' },
  { id: 5, name: 'António Guterres', affiliation: 'Universidade Eduardo Mondlane' },
  { id: 6, name: 'Rafia Anjum Rimi', affiliation: 'Independent University, Bangladesh' },
  { id: 7, name: 'Tenzing Norgay', affiliation: 'Pokhara University' },
  { id: 8, name: 'Celia', affiliation: 'Makerere University' },
]);
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <NuxtPage v-if="hasChild" />
    <template v-else>
      <!-- Breadcrumb-->
      <!-- <BreadCrumb
        :breadcrumb-items="[
          { text: 'Home', href: '/' },
          { text: 'Projects & Programmes', href: '/projects' },
          { text: project?.shortTitle || 'Project', href: '' },
        ]"
        :page-title="project?.shortTitle || 'Project'"
      /> -->
      <!-- Secondary navbar (links to sibling pages) -->
      <!-- <ProjectNavbar :project="project" :slug="String(slug)" /> -->

      <section v-if="carouselItems.length" class="w-full mx-auto px-0 md:px-0">
        <ResearchOutreachCarousel :items="carouselItems" />
      </section>

      <!-- HERO/CAROUSEL (reuse home carousel) -->
      <!-- <section id="home" class="w-full scroll-mt-24">
        <HomeCarousel />
      </section> -->

      <!-- About section: bind to project data -->
      <section id="about" class="w-full max-w-6xl mx-auto px-4 md:px-0 py-12 scroll-mt-24">
        <p class="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
          {{ project?.shortTitle }}
        </p>
        <h1 class="text-[22px] md:text-[26px] font-display font-semibold mb-3">
          {{ project?.longTitle }}
        </h1>
        <div v-if="project?.longDescription" class="space-y-4 text-gray-700 leading-relaxed">
          <MDC :value="project?.longDescription" class="prose max-w-none text-gray-800 space-y-6" />
        </div>
      </section>

      <!-- South Partners -->
      <section class="w-full max-w-6xl mx-auto px-4 md:px-0 pb-16">
        <h2 class="text-center text-[22px] md:text-[26px] font-display font-semibold mb-8">
          South Partners
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Bangladesh -->
          <NuxtLink
            :to="`/projects/${slug}/about/bangladesh`"
            class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div class="w-32 h-24 mb-4 flex items-center justify-center">
              <img
                src="https://flagcdn.com/w320/bd.png"
                alt="Bangladesh Flag"
                class="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Bangladesh</h3>
            <p class="text-sm text-gray-600">Independent University, Bangladesh</p>
          </NuxtLink>

          <!-- Mozambique -->
          <NuxtLink
            :to="`/projects/${slug}/about/mozambique`"
            class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div class="w-32 h-24 mb-4 flex items-center justify-center">
              <img
                src="https://flagcdn.com/w320/mz.png"
                alt="Mozambique Flag"
                class="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Mozambique</h3>
            <p class="text-sm text-gray-600">Eduardo Mondlane University</p>
          </NuxtLink>

          <!-- Nepal -->
          <NuxtLink
            :to="`/projects/${slug}/about/nepal`"
            class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div class="w-32 h-24 mb-4 flex items-center justify-center">
              <img
                src="https://flagcdn.com/w320/np.png"
                alt="Nepal Flag"
                class="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Nepal</h3>
            <p class="text-sm text-gray-600">Pokhara University</p>
          </NuxtLink>

          <!-- Uganda -->
          <NuxtLink
            :to="`/projects/${slug}/about/uganda`"
            class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div class="w-32 h-24 mb-4 flex items-center justify-center">
              <img
                src="https://flagcdn.com/w320/ug.png"
                alt="Uganda Flag"
                class="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Uganda</h3>
            <p class="text-sm text-gray-600">Makerere University</p>
          </NuxtLink>
        </div>
      </section>

      <!-- North Partners -->
      <section class="w-full max-w-6xl mx-auto px-4 md:px-0 pb-8">
        <h2 class="text-center text-[22px] md:text-[26px] font-display font-semibold mb-8">
          North Partner
        </h2>
        <div class="flex flex-wrap gap-8 items-center justify-center">
          <!-- Norway -->
          <NuxtLink
            :to="`/projects/${slug}/about/norway`"
            class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div class="w-32 h-24 mb-4 flex items-center justify-center">
              <img
                src="https://flagcdn.com/w320/no.png"
                alt="Norway Flag"
                class="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Norway</h3>
            <p class="text-sm text-gray-600">Norwegian University of Life Sciences</p>
          </NuxtLink>
        </div>
      </section>

      <!-- Featured Publications -->
      <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-12">
        <h2 class="text-center text-[24px] md:text-[28px] font-display font-medium mb-6">
          Featured Publications
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article
            v-for="p in visiblePubs"
            :key="p.id"
            class="flex flex-col border border-gray-200 rounded-md bg-white p-4 md:p-5 h-full hover:shadow-md transition-shadow"
          >
            <NuxtLink
              v-if="!p.isSeeMore"
              :to="`${basePath}/research/${p.documentId || p.id}`"
              class="flex flex-col h-full"
            >
              <h3
                class="text-base md:text-lg font-semibold text-gray-900 mb-2 line-clamp-3 hover:underline"
              >
                {{ p.title }}
              </h3>
              <div v-if="p.authors_text" class="flex items-start text-sm text-gray-600 mb-3">
                <img
                  src="~/assets/user.png"
                  alt="Authors"
                  class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                />
                <span class="line-clamp-2">{{ p.authors_text }}</span>
              </div>
              <p class="text-sm text-gray-700 mb-3 flex-grow">{{ excerpt(p.abstract, 160) }}</p>
              <div class="flex flex-wrap gap-2 mt-auto">
                <span
                  v-for="(tag, idx) in (p.tags || []).slice(0, 3)"
                  :key="idx"
                  class="inline-block text-[11px] px-2 py-0.5 rounded border border-green-200 text-green-700 bg-green-50 truncate max-w-[120px]"
                  >{{ tag.tag }}</span
                >
              </div>
            </NuxtLink>

            <NuxtLink
              v-else
              :to="`${basePath}/research`"
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
      </section>

      <!-- Featured News -->
      <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-12">
        <h2 class="text-center text-[24px] md:text-[28px] font-display font-medium mb-6">
          Featured News
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article
            v-for="n in visibleNews"
            :key="n.id"
            class="border border-gray-200 rounded-xl bg-white overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col"
          >
            <NuxtLink v-if="!n.isSeeMore" :to="n.to" class="flex flex-col h-full group">
              <div class="w-full h-48 flex-shrink-0 bg-gray-100">
                <img :src="n.image" :alt="n.title" class="w-full h-full object-cover" />
              </div>
              <div class="p-5 flex flex-col justify-center flex-grow">
                <h3
                  class="text-[17px] font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors line-clamp-2"
                >
                  {{ n.title }}
                </h3>
                <p class="text-sm text-gray-600 line-clamp-2">{{ n.excerpt }}</p>
              </div>
            </NuxtLink>

            <NuxtLink
              v-else
              :to="`${basePath}/outreach`"
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
                {{ n.title }}
              </h3>
              <p class="text-sm text-gray-600">{{ n.excerpt }}</p>
            </NuxtLink>
          </article>
        </div>

        <!-- Pagination for News -->
        <div v-if="totalNewsPages > 1" class="mt-12 flex items-center justify-center gap-2">
          <button
            v-for="page in totalNewsPages"
            :key="'news-' + page"
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
      </section>

      <!-- Our Fellows -->
      <!-- <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-12">
        <h2 class="text-center text-[24px] md:text-[28px] font-display font-medium mb-8">
          Our Fellows
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="f in fellows"
            :key="f.id"
            class="bg-blue-gray-50 border border-gray-200 rounded-md p-8 flex flex-col items-center text-center"
          >
            <div
              class="w-16 h-16 rounded-full border-4 border-blue-300 text-blue-500 flex items-center justify-center mb-4"
            > -->
      <!-- Simple person icon -->
      <!--               <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="8" r="4" stroke-width="2" />
                <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke-width="2" />
              </svg>
            </div>
            <p class="m-0 font-medium text-gray-900">{{ f.name }}</p>
            <p class="m-0 text-sm text-gray-600 max-w-[220px]">{{ f.affiliation }}</p>
          </div>
        </div>
      </section> -->

      <section class="w-full max-w-6xl mx-auto my-12">
        <ProjectWorldMap />
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

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

<style>
/* Markdown list styles for MDC rendered content */
.prose ul {
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 1.25rem;
}

.prose ul li {
  margin-bottom: 0.25rem;
}

.prose ol {
  list-style-type: decimal;
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 1.25rem;
}

.prose ol li {
  margin-bottom: 0.25rem;
}
</style>
