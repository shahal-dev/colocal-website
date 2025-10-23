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

const route = useRoute();
const slug = route.params.slug;

function excerpt(text?: string | null, n = 180) {
  if (!text) return '';
  const t = String(text);
  return t.length > n ? t.slice(0, n) + '…' : t;
}

// Fetch the specific project by slug from our Nuxt server endpoint
const { data: project, error: _projectError } = await useAsyncData<Project | null>(
  () => `project-${slug}`,
  async () => {
    const res = await $fetch('/api/projects', { query: { slug: String(slug) } });
    return res as Project | null;
  }
);

useHead({
  title: project.value?.shortTitle
    ? `${project.value.shortTitle}`
    : 'Projects & Programmes — LUCCC',
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

const recent3Publications = computed(() => {
  if (!publications.value || !publications.value.length) return [];
  return publications.value
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
});

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
      id: item.id,
      title: item.title,
      excerpt: excerpt(item.body, 160),
      image,
      to: `${basePath.value}/outreach/${item.id}`,
    } satisfies NewsCard);
  });

  // Add education training items
  educationItems.forEach((item) => {
    const formats = item.cover?.formats || {};
    const image = formats.medium?.url || formats.small?.url || item.cover?.url || '';
    newsCards.push({
      id: item.id,
      title: item.title,
      excerpt: excerpt(item.body, 160),
      image,
      to: `${basePath.value}/education/${item.id}`,
    } satisfies NewsCard);
  });

  return newsCards.length > 0 ? newsCards : fallbackNews;
});
const newsPage = ref(1);
const newsSize = 4;
const newsTotal = computed(() => Math.max(1, Math.ceil(newsItems.value.length / newsSize)));
const newsVisible = computed(() => {
  const start = (newsPage.value - 1) * newsSize;
  return newsItems.value.slice(start, start + newsSize);
});

watchEffect(() => {
  if (newsPage.value > newsTotal.value) {
    newsPage.value = 1;
  }
});

const researchCarouselItems = computed<CarouselItem[]>(() => {
  const list = Array.isArray(publications.value) ? publications.value : [];
  return list
    .filter((p) => {
      const media = p.imageCover;
      return Boolean(media && media.url);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map((p) => ({
      id: String(p.id),
      title: p.secondaryTitle || p.title,
      description: excerpt(p.abstract, 140),
      cover: p.imageCover ?? null,
      type: 'research',
      slug: basePath.value,
    }));
});

const outreachCarouselItems = computed<CarouselItem[]>(() => {
  const list = Array.isArray(newsEvents.value) ? newsEvents.value : [];
  return list
    .filter((n) => Boolean(n.cover && n.cover.url))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map((n) => ({
      id: String(n.id),
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
    .filter((e) => Boolean(e.cover && e.cover.url))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map((e) => ({
      id: String(e.id),
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
        <h2 class="text-[22px] md:text-[26px] font-display font-semibold mb-3">
          {{ project?.longTitle }}
        </h2>
        <div v-if="project?.longDescription" class="space-y-4 text-gray-700 leading-relaxed">
          <MDC :value="project?.longDescription" class="prose max-w-none text-gray-800 space-y-6" />
        </div>
      </section>

      <!-- North Partners -->
      <section class="w-full max-w-6xl mx-auto px-4 md:px-0 pb-8">
        <h2 class="text-center text-[22px] md:text-[26px] font-display font-semibold mb-8">
          North Partners
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          <!-- Norway -->
          <div class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6">
            <div class="w-32 h-24 mb-4 flex items-center justify-center">
              <img
                src="https://flagcdn.com/w320/no.png"
                alt="Norway Flag"
                class="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Norway</h3>
            <p class="text-sm text-gray-600">Norwegian University of Life Science</p>
          </div>
        </div>
      </section>

      <!-- South Partners -->
      <section class="w-full max-w-6xl mx-auto px-4 md:px-0 pb-16">
        <h2 class="text-center text-[22px] md:text-[26px] font-display font-semibold mb-8">
          South Partners
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Bangladesh -->
          <div class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6">
            <div class="w-32 h-24 mb-4 flex items-center justify-center">
              <img
                src="https://flagcdn.com/w320/bd.png"
                alt="Bangladesh Flag"
                class="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Bangladesh</h3>
            <p class="text-sm text-gray-600">Independent University, Bangladesh</p>
          </div>

          <!-- Mozambique -->
          <div class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6">
            <div class="w-32 h-24 mb-4 flex items-center justify-center">
              <img
                src="https://flagcdn.com/w320/mz.png"
                alt="Mozambique Flag"
                class="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Mozambique</h3>
            <p class="text-sm text-gray-600">Eduardo Mondlane University</p>
          </div>

          <!-- Nepal -->
          <div class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6">
            <div class="w-32 h-24 mb-4 flex items-center justify-center">
              <img
                src="https://flagcdn.com/w320/np.png"
                alt="Nepal Flag"
                class="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Nepal</h3>
            <p class="text-sm text-gray-600">Pokhara University</p>
          </div>

          <!-- Uganda -->
          <div class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6">
            <div class="w-32 h-24 mb-4 flex items-center justify-center">
              <img
                src="https://flagcdn.com/w320/ug.png"
                alt="Uganda Flag"
                class="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Uganda</h3>
            <p class="text-sm text-gray-600">University of Makerere</p>
          </div>
        </div>
      </section>

      <!-- Featured Publications -->
      <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-12">
        <h2 class="text-center text-[24px] md:text-[28px] font-display font-medium mb-6">
          Featured Publications
        </h2>
        <div class="space-y-4">
          <article
            v-for="p in recent3Publications"
            :key="p.id"
            class="border border-gray-200 rounded-md bg-white p-4 md:p-5"
          >
            <NuxtLink :to="`${basePath}/research/${p.id}`">
              <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-2">{{ p.title }}</h3>
              <div class="flex items-center text-sm text-gray-600 mb-3">
                <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87" stroke-width="2" />
                  <circle cx="12" cy="7" r="4" stroke-width="2" />
                </svg>
                <span>{{ p.authors.map((a) => a.name).join(' • ') }}</span>
              </div>
              <p class="text-sm text-gray-700 mb-3">{{ excerpt(p.abstract) }}</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(tag, idx) in p.tags"
                  :key="idx"
                  class="inline-block text-xs px-2 py-1 rounded border border-green-200 text-green-700 bg-green-50"
                  >{{ tag.tag }}</span
                >
              </div>
            </NuxtLink>
          </article>
        </div>
        <!-- Publications pagination
      <div v-if="pubTotal > 1" class="mt-6 flex items-center justify-center gap-2">
        <button
          v-for="page in pubTotal"
          :key="page"
          class="min-w-[32px] h-7 px-2 text-sm rounded border"
          :class="
            page === pubPage
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-800 border-gray-300'
          "
          @click="pubPage = page"
        >
          {{ page }}
        </button>
      </div> -->
      </section>

      <!-- Featured News -->
      <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-12">
        <h2 class="text-center text-[24px] md:text-[28px] font-display font-medium mb-6">
          Featured News
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article
            v-for="n in newsVisible"
            :key="n.id"
            class="border border-gray-200 rounded-md bg-white overflow-hidden flex"
          >
            <NuxtLink
              :to="n.to"
              class="flex flex-1 hover:bg-green-50 transition-colors duration-150"
            >
              <div class="w-40 h-28 flex-shrink-0">
                <img :src="n.image" :alt="n.title" class="w-full h-full object-cover" />
              </div>
              <div class="p-4 flex flex-col justify-center">
                <h3 class="text-[15px] font-semibold text-green-700 mb-1">{{ n.title }}</h3>
                <p class="text-sm text-gray-700 line-clamp-2">{{ n.excerpt }}</p>
              </div>
            </NuxtLink>
          </article>
        </div>
        <!-- News pagination -->
        <div v-if="newsTotal > 1" class="mt-6 flex items-center justify-center gap-2">
          <button
            v-for="page in newsTotal"
            :key="page"
            class="min-w-[32px] h-7 px-2 text-sm rounded border"
            :class="
              page === newsPage
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-800 border-gray-300'
            "
            @click="newsPage = page"
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
      <!-- <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="8" r="4" stroke-width="2" />
                <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke-width="2" />
              </svg>
            </div>
            <p class="m-0 font-medium text-gray-900">{{ f.name }}</p>
            <p class="m-0 text-sm text-gray-600 max-w-[220px]">{{ f.affiliation }}</p>
          </div>
        </div>
      </section> -->
    </template>
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
