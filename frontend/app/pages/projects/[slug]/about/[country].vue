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
    partner: 'Independent University, Bangladesh',
    description:
      'Independent University, Bangladesh is acting as an implementing partner of the COLOCAL project. ',
  },
  nepal: {
    id: 'nepal',
    name: 'Nepal',
    iso: 'NP',
    selectors: ['#NP'],
    partner:
      'The School of Environmental Science and Management of Pokhara University (PU-SchESM) is acting as an implementing partner of the COLOCAL project.',
    description:
      '',
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
  <div v-if="countryData" class="flex flex-col md:flex-row w-full min-h-[calc(100vh-80px)]">
    <!-- Back Button / Map Area (60%) -->
    <div
      class="relative w-full md:w-[60%] bg-[#041b18] min-h-[50vh] md:min-h-screen flex items-center justify-center p-8">
      <!-- Back button -->
      <NuxtLink :to="`/projects/${slug}`"
        class="absolute top-6 left-6 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-700 hover:bg-green-50 shadow-md transition-colors cursor-pointer"
        aria-label="Go back">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clip-rule="evenodd" />
        </svg>
      </NuxtLink>

      <!-- Map Image -->
      <img v-if="svgMap[countryData.iso.toLowerCase()]" :src="svgMap[countryData.iso.toLowerCase()]"
        :alt="`Map of ${countryData.name}`" class="w-full h-full max-h-[80vh] object-contain" />
    </div>

    <!-- Text Content Area (40%) -->
    <div class="w-full md:w-[40%] bg-white p-8 md:p-12 overflow-y-auto custom-scrollbar md:max-h-screen">
      <h1 class="text-[32px] md:text-[40px] font-display font-semibold text-gray-900 mb-6">
        {{ countryData.name }}
      </h1>

      <p class="text-[15px] font-medium text-gray-800 mb-8 leading-relaxed">
        {{ countryData.partner }}
      </p>

      <div class="space-y-6 text-[15px] text-gray-600 leading-relaxed whitespace-pre-wrap">
        {{ countryData.description }}
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
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
</style>
