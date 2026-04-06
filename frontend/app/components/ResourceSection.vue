<script setup lang="ts">
import HandIcon from './icons/HandIcon.vue';
import HatIcon from './icons/HatIcon.vue';
import PublicationsIcon from './icons/PublicationsIcon.vue';
import ResourceCard from './ResourceCard.vue';

const resources = [
  {
    id: 'publications',
    icon: PublicationsIcon,
    title: 'Publications',
    description: 'Research-driven reports and studies on climate resilience and sustainability.',
  },
  {
    id: 'capacity-building',
    icon: HatIcon,
    title: 'Capacity Building',
    description: 'Providing education, training, and resources to enhance climate resilience.',
  },
  // {
  //   id: 'publications-2',
  //   icon: HandIcon,
  //   title: 'Publications',
  //   description: 'Financial support for climate research and sustainable projects.',
  // },
];
</script>

<template>
  <section class="w-full bg-blue-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-display font-medium mb-8 text-center">
        Resource Hub
      </h2>

      <!-- responsive grid: 1 column on mobile, 2 on small, 3 on large -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <ResourceCard v-for="res in resources" :key="res.id" :icon="res.icon" :title="res.title"
          :description="res.description" class="w-full" />
      </div>
    </div>
  </section>
</template>
