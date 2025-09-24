<script setup lang="ts">
import { computed } from 'vue';
import type { Author } from '~~/types/content';

// Normalized About payload from our server API
type AboutSingle = {
  title?: string;
  subtitle?: string;
  about?: string;
  mission?: string;
  objectives?: Array<{ objective: string }> | null;
  quotes?: Array<{ body: string; author?: Author | null }> | null;
};

const { data: aboutData, error } = await useAsyncData<AboutSingle>('about-single', async () => {
  return $fetch('/api/about');
});

if (error?.value) {
  console.error('Failed to fetch about content from Strapi:', error.value);
}

// Normalize quotes for QuotesSection
const quotesForUi = computed(() => {
  const list = aboutData.value?.quotes || [];
  return list
    .filter((q) => q && q.body)
    .map((q) => ({
      name: q.author?.name || '',
      role: '',
      quote: q.body,
      avatar: q.author?.avatar?.url || undefined,
    }));
});
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'About Us', href: '/about' },
      ]"
      :page-title="aboutData?.title || 'About Us'"
    />
    <AboutIntroSection
      :subtitle="aboutData?.subtitle"
      :title="aboutData?.title"
      :about="aboutData?.about"
    />
    <QuotesSection :quotes="quotesForUi" />
    <MissionSection :mission="aboutData?.mission" :objectives="aboutData?.objectives || []" />
    <UniversitiesTeaser />
  </div>
</template>
