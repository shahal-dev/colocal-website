<script setup lang="ts">
import missionImage from '~/assets/images/carousel-2.png';

const objectives = [
  'Build a South-South network to strengthen climate research and expertise.',
  'Strengthen university collaboration in climate research, teaching, and training.',
  'Focus on supporting the most vulnerable countries and communities.',
  'Promote two-way learning and capacity-building.',
  'Enable LDC universities to be knowledge hubs for climate adaptation.',
];
</script>

<template>
  <section class="w-full max-w-6xl mx-auto py-14">
    <!-- Mission header + image -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start mb-10">
      <div>
        <h2 class="text-[24px] md:text-[28px] font-display font-semibold mb-3">
          Our Mission & Vision
        </h2>
        <p class="text-gray-700 mb-3">
          LUCCC aims to capacitate all the 46 LDCs to adapt effectively to the adverse impacts of
          climate change as well as to explore win-win options for mitigation. It aspires to develop
          a South-South and South-South-North knowledge sharing and capacity building network,
          focusing on adaptation. All the universities, research and training institutes in the LDCs
          will be included over time in the LUCCC network.
        </p>
      </div>
      <div>
        <img
          :src="missionImage"
          alt="Mission team"
          class="w-full h-[220px] md:h-[260px] object-cover rounded"
        />
      </div>
    </div>

    <!-- Objectives -->
    <h3 class="text-[18px] font-display font-semibold mb-4">Objectives</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div
        v-for="(text, idx) in objectives"
        :key="idx"
        class="bg-blue-gray-50 border border-gray-200 rounded p-5 text-gray-700"
      >
        {{ text }}
      </div>
    </div>
  </section>
</template>

<style scoped></style>
