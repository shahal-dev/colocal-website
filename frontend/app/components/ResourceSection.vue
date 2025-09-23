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
  {
    id: 'publications-2',
    icon: HandIcon,
    title: 'Publications',
    description: 'Financial support for climate research and sustainable projects.',
  },
];
</script>

<template>
  <section
    class="flex flex-col h-[528px] w-full justify-center items-center relative bg-blue-gray-100"
  >
    <h2 class="text-[32px] font-display font-medium mb-12">Resource Hub</h2>
    <div class="flex flex-row justify-center items-center space-x-6">
      <ResourceCard
        v-for="res in resources"
        :key="res.id"
        :icon="res.icon"
        :title="res.title"
        :description="res.description"
      />
    </div>
  </section>
</template>
