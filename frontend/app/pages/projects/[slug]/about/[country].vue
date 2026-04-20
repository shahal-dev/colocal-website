<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';
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
const countryParam = (route.params.country as string)?.toLowerCase();

const project = useState<Project | null>(`project:${slug}`, () => null);

const svgMap: Record<string, string> = {
  bd: bdSvg,
  mz: mzSvg,
  no: noSvg,
  np: npSvg,
  ug: ugSvg,
};

// Hardcoded data for the countries
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
    description: '',
  },
  mozambique: {
    id: 'mozambique',
    name: 'Mozambique',
    iso: 'MZ',
    selectors: ['#MZ'],
    partner: 'Eduardo Mondlane University',
    description:
      'Eduardo Mondlane University is acting as an implementing partner of the COLOCAL project.',
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
        v-if="svgMap[countryData.iso.toLowerCase()]"
        class="mb-8 w-full bg-[#041b18] rounded-xl overflow-hidden flex items-center justify-center p-8 min-h-[400px]"
      >
        <GalleryCarousel
          :images="[svgMap[countryData.iso.toLowerCase()]]"
          :title="`Map of ${countryData.name}`"
          large
        />
      </div>

      <!-- Text Content Area -->
      <div class="w-full">
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
