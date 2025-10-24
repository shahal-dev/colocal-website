<script setup lang="ts">
import type { Author } from '~~/types/content';

useHead({
  title: 'About Us — LUCCC',
});

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
// const quotesForUi = computed(() => {
//   const list = aboutData.value?.quotes || [];
//   return list
//     .filter((q) => q && q.body)
//     .map((q) => ({
//       name: q.author?.name || '',
//       role: '',
//       quote: q.body,
//       avatar: q.author?.avatar?.url || undefined,
//     }));
// });
</script>

<template>
  <!-- responsive container with comfortable padding and max width -->
  <div class="flex flex-col items-center w-full justify-center">
    <!-- breadcrumb stretched full width on small screens -->
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'About Us', href: '/about' },
      ]"
      :page-title="aboutData?.title || 'About Us'"
    />

    <!-- Intro section: full width, centered content, responsive max width -->
    <div class="w-full mb-10">
      <AboutIntroSection
        :subtitle="aboutData?.subtitle"
        :title="aboutData?.title"
        :about="aboutData?.about"
        class="mx-auto max-w-3xl"
      />
    </div>

    <!-- Responsive grid: on small screens stack, on lg show 3 columns -->
    <!-- <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mb-10"> -->
    <!-- Quotes take one column on lg, full width on sm -->
    <!-- <div class="w-full lg:col-span-1">
        <QuotesSection :quotes="quotesForUi" />
      </div> -->

    <!-- Mission + Objectives take two columns on lg, full width on sm -->
    <!-- <div class="w-full lg:col-span-2">
        <MissionSection :mission="aboutData?.mission" :objectives="aboutData?.objectives || []" />
      </div>
    </div> -->

    <!-- Teaser at bottom, centered and responsive -->
    <div class="w-full mt-4">
      <UniversitiesTeaser class="mx-auto max-w-4xl" />
    </div>
  </div>
</template>
