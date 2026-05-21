<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useAsyncData } from '#app';
import type {
  Project,
  Author,
  ResearchPublication,
  NewsEvent,
  EducationTraining,
} from '~~/types/content';
import bdSvg from '~/assets/bd.svg';
import mzSvg from '~/assets/mz.svg';
import noSvg from '~/assets/no.svg';
import npSvg from '~/assets/np.svg';
import ugSvg from '~/assets/ug.svg';

type CountryData = {
  id: string;
  name: string;
  iso: string;
  selectors: string[];
  partner: string;
  description: string;
};

const route = useRoute();
const slug = route.params.slug as string;
const basePath = computed(() => `/projects/${slug}`);

const countryParam = (route.params.country as string)?.toLowerCase();

const project = useState<Project | null>(`project:${slug}`, () => null);

const svgMap: Record<string, string> = {
  bd: bdSvg,
  mz: mzSvg,
  no: noSvg,
  np: npSvg,
  ug: ugSvg,
};

// Glob import for country images
const countryImagesRaw = import.meta.glob('~/assets/*/*.{jpg,jpeg,png,webp,svg}', {
  eager: true,
  import: 'default',
});

// Build a map of country iso to array of image URLs
const countryImagesMap = computed(() => {
  const map: Record<string, string[]> = {
    bd: [],
    mz: [],
    no: [],
    np: [],
    ug: [],
  };

  for (const [path, url] of Object.entries(countryImagesRaw)) {
    const parts = path.split('/');
    if (parts.length >= 3) {
      // path looks like /app/assets/bd/1.jpg or similar depending on glob resolution
      // Let's extract the folder name safely
      const match = path.match(/\/assets\/([^/]+)\//);
      if (match && match[1]) {
        const folder = match[1].toLowerCase();
        if (map[folder]) {
          map[folder].push(url as string);
        }
      }
    }
  }

  // Fallback to the SVG map if no images exist for the country
  for (const iso of Object.keys(map)) {
    if (map[iso].length === 0 && svgMap[iso]) {
      map[iso].push(svgMap[iso]);
    }
  }

  return map;
});
const countryDataRecord: Record<string, CountryData> = {
  bangladesh: {
    id: 'bangladesh',
    name: 'Bangladesh',
    iso: 'BD',
    selectors: ['#BD'],
    partner: 'ICCCAD at Independent University, Bangladesh',
    description: `The Department of Environmental Science and Management (DESM) at Independent University Bangladesh (IUB), together with the International Centre for Climate Change and Development (ICCCAD), are acting as a global south partner for the COLOCAL project.

Established in 1993, DESM at IUB has achieved a reputation as one of the best institutions providing environmental education in Bangladesh. Having an interdisciplinary and holistic approach, the department integrates science, management, law, economics, public health and governance with an aim to create professionals for environmental problem-solving.

The Department offers two undergraduate degrees: Land and Water Resource Management, and Environmental Management. It also offers a minor in Environmental Science and Environmental Management. At the graduate level, it offers an MSc in Environmental Management and an MSc in Climate Change and Development, the latter being supported by the COLOCAL project. All these programs of the Department focus on current and future environmental challenges including climate change, environmental pollution, resource management, urbanization and energy towards sustainable development at both local and global scale. DESM develops researchers and professionals who become capable of addressing these issues and therefore, satisfying human needs.

Also at IUB, ICCCAD is one of the leading research and capacity building organisations working on climate change and development in Bangladesh, where Climate Change has a significant impact. As a global Centre of Excellence on Climate Change and Development, ICCCAD also wants to build and lead a network of Global South partner institutes, collaboratively building the knowledge base and overall capacity of developing countries. ICCCAD has a strong focus on the adaptation and the loss and damage streams of climate change, allowing international participants to gain deeper insights of these issues through real-world experiences. Through the expertise of ICCCAD and its local and international partners gain exposure to relevant and grounded knowledge that can be shared and transmitted around the world for the benefit of other LDC institutions, governments, donors and international NGOs.
`,
  },
  nepal: {
    id: 'nepal',
    name: 'Nepal',
    iso: 'NP',
    selectors: ['#NP'],
    partner:
      'The School of Environmental Science and Management of Pokhara University (PU-SchESM) is acting as an implementing partner of the COLOCAL project.',
    description: `School of Environmental Science and Management (SchEMS) College, affiliated with Pokhara University, Nepal, serves as a key Global South partner for the COLOCAL project.

Established in 1999 has built a strong reputation as one of Nepal's leading institutions for environmental education. With an interdisciplinary and holistic approach, the department blends science, management, policy, economics, public health, and governance to train professionals equipped to tackle environmental challenges.

SchEMS offers undergraduate programs including Bachelor of Environmental Management, Bachelor in Business Administration (BBA), and Bachelor in Computer Application (BCA). At the graduate level, the department delivers an MSc in Environmental Management and an MSc in Climate Change, the latter bolstered by the COLOCAL project. These programs address pressing issues like climate change, flood hazards, pollution, water resource management, urbanization, and renewable energy, promoting sustainable development at local, national, and global scales. SchEMS cultivates researchers and professionals who can effectively meet human needs amid Nepal's vulnerability to Himalayan climate impacts.

SchEMS leverages Pokhara University's networks and Nepal's frontline experience with climate risks such as glacial lake outburst floods and monsoon extremes to foster innovation. As a hub for Global South collaboration, SchEMS builds partnerships with institutes worldwide, emphasizing adaptation, loss and damage, and resilience. Through hands-on projects and expertise shared with local and international partners, it equips participants with practical insights applicable to least developed countries (LDCs), governments, donors, and NGOs.`,
  },
  mozambique: {
    id: 'mozambique',
    name: 'Mozambique',
    iso: 'MZ',
    selectors: ['#MZ'],
    partner: 'Eduardo Mondlane University',
    description: `Mozambique is a country of multiple opportunities and challenges. Rich in natural resources such as gas, gold, iron, heavy sands, coal, graphite, paradisiac beaches, fertile soils and unexploited forests, the country is, yet, a global reference of complex disasters emerging out of armed conflicts, climate-change induced disasters and institutionalized governance failures to a point that disasters are, to say, a part of everyday life of millions of people. With about 30 million inhabitants and a GDP of 15 billion, Mozambique ranks as one of the poorest countries in the world – Bottom 10 on the UNDP human development index (UNDP, 2020) and has been under continuous conflicts and disasters over his history.

Established in 1962, Eduardo Mondlane University (Universidade Eduardo Mondlane-UEM) is the oldest, number one, and most prestigious university in Mozambique. By 2024 it was ranked by Edurank, amongst the 32 best African universities. UEM offers 204 different programs (104 BSc; 85 MSc and 15 PhD) across its 11 faculties and 6 high education schools. It has an annual intake of around 5,000 students with a global of around 50.000 students. The university vision is to become an international, regional and national reference on scientific knowledge production, innovation and dissemination putting research as the backbone for teaching and outreach.

Within the UEM, COLOCAL sits within the Faculty of Agronomy and Forestry Engineering (FAEF), one of the 11 faculties. FAEF provides teaching research and extension activities related to food systems, forest and environment management. It has around 1,000 students across 3 BSc programs, 11 MSc and 3 PhD programs. FAEF is number 2 in terms of publications within the UEM and one of the most prestigious around the country being engaged in policy formulation, training highly qualified cadre of experts including ministers, directors and reputable managers within and outside the country.`,
  },
  uganda: {
    id: 'uganda',
    name: 'Uganda',
    iso: 'UG',
    selectors: ['#UG'],
    partner: 'Makerere University',
    description:
      'Makerere University leads research on community adaptation and climate policy integration.',
  },
  norway: {
    id: 'norway',
    name: 'Norway',
    iso: 'NO',
    selectors: ['.Norway'],
    partner: 'Norwegian University of Life Sciences',
    description:
      'The Norwegian University of Life Sciences provides north-south research leadership.',
  },
};

const countryData = computed(() => countryDataRecord[countryParam] || null);

const currentCountryImages = computed(() => {
  if (!countryData.value) return [];
  return countryImagesMap.value[countryData.value.iso.toLowerCase()] || [];
});

const isFallbackSvg = computed(() => {
  if (!countryData.value) return false;
  const iso = countryData.value.iso.toLowerCase();
  const images = currentCountryImages.value;
  return images.length === 1 && images[0] === svgMap[iso];
});

// Fetch all necessary data
const { data: authorsRes } = await useAsyncData<{ data: Author[] }>('authors', () =>
  $fetch('/api/authors')
);
const { data: publications } = await useAsyncData<ResearchPublication[]>('publications', () =>
  $fetch('/api/publications', { query: { projectSlug: slug } })
);
const { data: newsEvents } = await useAsyncData<NewsEvent[]>('news-events', () =>
  $fetch('/api/news-events')
);
const { data: educationTrainings } = await useAsyncData<EducationTraining[]>(
  'education-trainings',
  () => $fetch('/api/education-trainings')
);

const teamMembers = computed(() => {
  return (
    authorsRes.value?.data?.filter(
      (a) => a.country?.toLowerCase() === countryParam.toLowerCase() && a.admin
    ) || []
  );
});

const countryPublications = computed(() => {
  return publications.value
    ?.filter((p) => p.country?.name.toLowerCase() === countryData.value?.name.toLowerCase())
    .slice()
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 3);
});

const countryNewsEvents = computed(() => {
  return (
    newsEvents.value
      ?.filter((e) => e.country?.name.toLowerCase() === countryData.value?.name.toLowerCase())
      .slice()
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 3) || []
  );
});

const countryEducationTrainings = computed(() => {
  return (
    educationTrainings.value
      ?.filter((e) => e.country?.name.toLowerCase() === countryData.value?.name.toLowerCase())
      .slice()
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 3) || []
  );
});

useHead({
  title: countryData.value
    ? `${countryData.value.name} — ${project.value?.shortTitle || 'Project'}`
    : 'Country Not Found',
});
</script>

<template>
  <div
    v-if="countryData"
    class="w-full flex justify-center py-8 px-4 md:px-0 bg-gray-50 min-h-[calc(100vh-80px)]"
  >
    <div class="w-full max-w-[920px] bg-white rounded-xl shadow-sm p-6 md:p-12">
      <!-- Back button -->
      <NuxtLink
        :to="`/projects/${slug}`"
        class="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium mb-6 transition-colors"
        aria-label="Go back to project"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        Back to Project
      </NuxtLink>

      <!-- Carousel -->
      <div
        v-if="currentCountryImages.length > 0"
        :class="[
          'mb-8 w-full rounded-xl overflow-hidden flex items-center justify-center min-h-[400px]',
          isFallbackSvg ? 'bg-[#041b18] p-8' : '',
        ]"
      >
        <GalleryCarousel
          :images="currentCountryImages"
          :title="`Map of ${countryData.name}`"
          large
        />
      </div>

      <!-- Text Content Area -->
      <div class="w-full mb-12">
        <h1 class="text-[32px] md:text-[40px] font-display font-semibold text-gray-900 mb-4">
          {{ countryData.name }}
        </h1>

        <p
          class="text-[16px] md:text-[18px] font-medium text-green-800 mb-8 leading-relaxed pb-6 border-b border-gray-100"
        >
          Partner: {{ countryData.partner }}
        </p>

        <div
          class="space-y-6 text-[16px] md:text-[17px] text-gray-700 leading-relaxed whitespace-pre-wrap"
        >
          {{ countryData.description }}
        </div>
      </div>

      <!-- Team Members -->
      <div v-if="teamMembers.length > 0" class="w-full mb-16">
        <h2
          class="text-[22px] md:text-[26px] font-display font-semibold mb-6 text-gray-900 border-b border-gray-100 pb-4"
        >
          Team Members
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div
            v-for="member in teamMembers"
            :key="member.id"
            class="flex flex-col items-center text-center bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-100"
          >
            <div
              class="w-24 h-24 mb-4 rounded-full overflow-hidden bg-white shadow-sm flex items-center justify-center"
            >
              <img
                v-if="member.avatar?.url"
                :src="member.avatar.url"
                :alt="member.name"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full bg-green-100 flex items-center justify-center text-green-600 text-2xl font-bold"
              >
                {{ member.name.charAt(0) }}
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ member.name }}</h3>
            <p v-if="member.title" class="text-sm text-gray-600">{{ member.title }}</p>
          </div>
        </div>
      </div>

      <!-- Publications -->
      <div v-if="countryPublications.length > 0" class="w-full mb-16">
        <h2
          class="text-[22px] md:text-[26px] font-display font-semibold mb-6 text-gray-900 border-b border-gray-100 pb-4"
        >
          Publications from {{ countryData.name }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article
            v-for="p in countryPublications"
            :key="p.id"
            class="flex flex-col border border-gray-200 rounded-xl bg-white p-6 hover:shadow-md transition-shadow h-full"
          >
            <NuxtLink :to="`/resource-hub/${p.documentId || p.id}`" class="flex flex-col h-full">
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
          </article>
          <!-- Final "See More" Card -->
          <NuxtLink
            :to="`${basePath}/research`"
            class="flex flex-col border border-gray-200 rounded-xl bg-white p-6 hover:shadow-md transition-shadow h-full items-center justify-center text-center group"
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
              Explore More Publications
            </h3>
            <p class="text-sm text-gray-600">
              Discover more publications, training materials, and funding opportunities in our
              comprehensive Resource Hub.
            </p>
          </NuxtLink>
        </div>
      </div>

      <!-- News and Events -->
      <div v-if="countryNewsEvents.length > 0" class="w-full mb-16">
        <h2
          class="text-[22px] md:text-[26px] font-display font-semibold mb-6 text-gray-900 border-b border-gray-100 pb-4"
        >
          News and Events
        </h2>
        <div class="grid grid-cols-1 gap-6">
          <article
            v-for="e in countryNewsEvents"
            :key="e.id"
            class="border border-gray-200 rounded-xl bg-white p-0 overflow-hidden hover:shadow-md transition-shadow"
          >
            <NuxtLink
              :to="`/projects/${e.projects?.[0]?.slug || slug || 'global'}/outreach/${e.documentId || e.id}`"
              class="flex flex-col sm:flex-row h-full group"
            >
              <div class="w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-gray-100">
                <img
                  v-if="e.cover?.url"
                  :src="e.cover.url"
                  :alt="e.title"
                  class="w-full h-full object-cover"
                />
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
          </article>
          <!-- Final "See More" Card -->
          <NuxtLink
            :to="`${basePath}/outreach`"
            class="flex flex-col border border-gray-200 rounded-xl bg-white p-6 hover:shadow-md transition-shadow h-full items-center justify-center text-center group"
          >
            <h3 class="text-xl font-semibold text-green-800 mb-3 group-hover:underline">
              Explore More News and Events
            </h3>
            <p class="text-sm text-gray-600">
              Stay updated with the latest news, events, and outreach activities from our project
              and partners.
            </p>
          </NuxtLink>
        </div>
      </div>

      <!-- Education and Training -->
      <div v-if="countryEducationTrainings.length > 0" class="w-full mb-8">
        <h2
          class="text-[22px] md:text-[26px] font-display font-semibold mb-6 text-gray-900 border-b border-gray-100 pb-4"
        >
          Education and Training
        </h2>
        <div class="grid grid-cols-1 gap-6">
          <article
            v-for="e in countryEducationTrainings"
            :key="e.id"
            class="border border-gray-200 rounded-xl bg-white p-0 overflow-hidden hover:shadow-md transition-shadow"
          >
            <NuxtLink
              :to="`/projects/${e.project?.slug || slug || 'global'}/education-training/${e.documentId || e.id}`"
              class="flex flex-col sm:flex-row h-full group"
            >
              <div class="w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-gray-100">
                <img
                  v-if="e.cover?.url"
                  :src="e.cover.url"
                  :alt="e.title"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>
              <div class="p-5 flex flex-col justify-center flex-grow">
                <div class="text-xs text-green-600 font-medium mb-2">
                  {{ e.date ? new Date(e.date).toLocaleDateString() : 'Education' }}
                  <span
                    v-if="e.type?.type"
                    class="ml-2 px-1.5 py-0.5 bg-green-50 rounded text-green-700"
                    >{{ e.type.type }}</span
                  >
                </div>
                <h3
                  class="text-[17px] font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors line-clamp-2"
                >
                  {{ e.title }}
                </h3>
                <p class="text-sm text-gray-600 line-clamp-2">{{ excerpt(e.body, 120) }}</p>
              </div>
            </NuxtLink>
          </article>

          <!-- Final "See More" Card -->
          <NuxtLink
            :to="`${basePath}/outreach`"
            class="flex flex-col border border-gray-200 rounded-xl bg-white p-6 hover:shadow-md transition-shadow h-full items-center justify-center text-center group"
          >
            <h3 class="text-xl font-semibold text-green-800 mb-3 group-hover:underline">
              Explore More Education and Training
            </h3>
            <p class="text-sm text-gray-600">
              Access a wide range of educational resources and training materials offered by our
              project and partners.
            </p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center w-full min-h-[50vh]">
    <div class="text-center">
      <h2 class="text-2xl font-semibold mb-4">Country Not Found</h2>
      <NuxtLink :to="`/projects/${slug}`" class="text-green-600 hover:underline">
        Return to Project
      </NuxtLink>
    </div>
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
