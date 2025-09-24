<script setup lang="ts">
import type { NewsEvent, Project } from '../../types/content';
const config = useRuntimeConfig();

type HomeType = {
  About?: string;
  country_affiliations?: number;
  projects?: number;
  members?: number;
  years?: number;
  phone?: string;
  email?: string;
  address?: string;
};

type StrapiV5Single<T> = { data: { id?: number; attributes: T } };
type StrapiV4Single<T> = { data: T };

function hasKey<T extends string>(obj: unknown, key: T): obj is Record<T, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}

const { data: home, error } = await useAsyncData<HomeType>('home', async () => {
  const url = `${config.strapi.url}/api/home`;
  const res: unknown = await $fetch(url, {
    headers: config.strapi.token ? { Authorization: `Bearer ${config.strapi.token}` } : {},
  });
  // Adapt to Strapi v4/v5 response shapes
  if (hasKey(res, 'data')) {
    const data = res.data;
    if (hasKey(data, 'attributes')) {
      return (data as StrapiV5Single<HomeType>['data']).attributes;
    }
    return data as StrapiV4Single<HomeType>['data'];
  }
  return res as HomeType;
});

if (error.value) {
  console.error('Failed to fetch home content from Strapi:', error.value);
}

// Fetch projects from our Nuxt server endpoint
const { data: projects } = await useAsyncData<Project[]>(
  'projects',
  async () => await $fetch('/api/projects')
);

// Fetch all News & Events
const { data: newsData } = await useAsyncData<NewsEvent[]>(
  'news-events-all',
  async () => (await $fetch('/api/news-events')) as NewsEvent[]
);
// const items = computed(() => newsData.value?.slice(0, 4) ?? []);
// function excerpt(text?: string | null, n = 180) {
//   if (!text) return '';
//   const t = String(text);
//   return t.length > n ? t.slice(0, n) + '…' : t;
// }
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <HomeProjectCarousel :projects="projects || []" />
    <AboutUsSection :title="'About Us'" :description="home?.About" />
    <StatsSection
      :countries="home?.country_affiliations"
      :projects="home?.projects"
      :years="home?.years"
      :members="home?.members"
    />
    <!-- Debug list to verify projects from Strapi -->
    <!-- <div class="container mx-auto my-8 px-4">
      <h2 class="text-xl font-semibold">Projects (debug)</h2>
      <ul v-if="projects?.length" class="list-disc pl-6">
        <li v-for="p in projects!" :key="p.id">{{ p.shortTitle }} ({{ p.slug }})</li>
      </ul>
      <p v-else class="text-gray-500">No projects yet.</p>
    </div> -->
    <ProjectsSection :projects="projects || []" />
    <ResourceSection />
    <NewsAndAnnouncements :news-events="newsData" />
    <GetInTouch :phone="home?.phone" :email="home?.email" :address="home?.address" />
  </div>
</template>
