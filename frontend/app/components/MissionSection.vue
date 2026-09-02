<script setup lang="ts">
import { computed } from 'vue';
import missionImage from '~/assets/images/carousel-2.png';

const props = defineProps<{
  mission?: string;
  objectives?: Array<string | { objective: string }>;
}>();

const missionText = computed(
  () =>
    props.mission ||
    'LUCCC aims to capacitate all the 46 LDCs to adapt effectively to the adverse impacts of climate change as well as to explore win-win options for mitigation. It aspires to develop a South-South and South-South-North knowledge sharing and capacity building network, focusing on adaptation. All the universities, research and training institutes in the LDCs will be included over time in the LUCCC network.'
);

const objectiveItems = computed(() => {
  const fallback = [
    'Build a South-South network to strengthen climate research and expertise.',
    'Strengthen university collaboration in climate research, teaching, and training.',
    'Focus on supporting the most vulnerable countries and communities.',
    'Promote two-way learning and capacity-building.',
    'Enable LDC universities to be knowledge hubs for climate adaptation.',
  ];
  if (!props.objectives || !props.objectives.length) return fallback;
  return props.objectives
    .map((o) => (typeof o === 'string' ? o : o?.objective || ''))
    .filter(Boolean);
});
</script>

<template>
  <section class="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
    <!-- Mission header + image -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 items-start mb-8 md:mb-10">
      <div class="order-2 md:order-1">
        <h2 class="text-lg sm:text-[20px] md:text-[28px] font-display font-semibold mb-2 sm:mb-3">
          Our Mission & Vision
        </h2>
        <p class="text-sm sm:text-[15px] md:text-base text-gray-700 leading-relaxed">
          {{ missionText }}
        </p>
      </div>

      <div class="order-1 md:order-2">
        <!-- responsive image: uses height breakpoints and lazy loading -->
        <NuxtImg
          :src="missionImage"
          alt="Mission team"
          width="720"
          height="600"
          sizes="100vw md:50vw lg:720px"
          format="webp"
          quality="75"
          loading="lazy"
          class="w-full h-[180px] sm:h-[200px] md:h-[260px] lg:h-[320px] object-cover rounded shadow-sm"
        />
      </div>
    </div>

    <!-- Objectives -->
    <h3 class="text-[16px] sm:text-[17px] md:text-[18px] font-display font-semibold mb-4">
      Objectives
    </h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
      <div
        v-for="(text, idx) in objectiveItems"
        :key="idx"
        class="bg-blue-gray-50 border border-gray-200 rounded p-4 sm:p-5 text-gray-700 flex items-start h-full"
      >
        <p class="text-sm md:text-[15px] leading-relaxed">{{ text }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* minimal custom tweaks to ensure consistent card height on small screens */
@media (max-width: 639px) {
  section .grid > div > img {
    /* keep small devices proportionate if Tailwind aspect utilities aren't available */
    object-position: center;
  }
}
</style>
