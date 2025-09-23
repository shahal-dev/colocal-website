<script setup>
import { computed, ref } from 'vue';
import { useRoute } from '#app';
import img1 from '~/assets/images/carousel-1.png';
import img2 from '~/assets/images/carousel-2.png';

// Route + derived project name
const route = useRoute();
const slug = route.params.slug;
const projectName = (() => {
  const map = {
    colocal: 'COLOCAL',
    'mangrove-restoration': 'Mangrove Restoration',
  };
  return map[String(slug).toLowerCase()] || 'Project';
})();

// Secondary navbar (links to sibling pages under the slug)
const basePath = computed(() => `/projects/${slug}`);
const tabs = computed(() => [
  { key: 'home', label: 'Home', to: basePath.value },
  { key: 'about', label: 'About ' + projectName, to: `${basePath.value}/about` },
  { key: 'education', label: 'Education & Training', to: `${basePath.value}/education` },
  { key: 'research', label: 'Research & Publications', to: `${basePath.value}/research` },
  { key: 'outreach', label: 'Outreach', to: `${basePath.value}/outreach` },
  { key: 'lla', label: 'LLA Hub', to: `${basePath.value}/lla` },
]);
const isActive = (to) => route.path === to;

// Sample data
const events = ref([
  {
    id: 1,
    title: 'LLA Seminar at IUB',
    excerpt:
      'Lorem ipsum dolor sit amet consectetur. Id id cursus iaculis duis. Pretium quam lectus magna convallis. Sed at venenatis porta nec ac mi senectus ac. Venenatis nunc semper at ultrices.',
    image: img1,
  },
  {
    id: 2,
    title: 'UNI-Lead Mini Workshop',
    excerpt:
      'Lorem ipsum dolor sit amet consectetur. Id id cursus iaculis duis. Pretium quam lectus magna convallis. Sed at venenatis porta nec ac mi senectus ac. Venenatis nunc semper at ultrices.',
    image: img2,
  },
  {
    id: 3,
    title: 'LLA Seminar at IUB',
    excerpt:
      'Lorem ipsum dolor sit amet consectetur. Id id cursus iaculis duis. Pretium quam lectus magna convallis. Sed at venenatis porta nec ac mi senectus ac. Venenatis nunc semper at ultrices.',
    image: img1,
  },
  {
    id: 4,
    title: 'UNI-Lead Mini Workshop',
    excerpt:
      'Lorem ipsum dolor sit amet consectetur. Id id cursus iaculis duis. Pretium quam lectus magna convallis. Sed at venenatis porta nec ac mi senectus ac. Venenatis nunc semper at ultrices.',
    image: img2,
  },
]);

const dialogues = ref([
  {
    id: 1,
    title: 'UNI-Lead Mini Workshop',
    excerpt:
      'Lorem ipsum dolor sit amet consectetur. Id id cursus iaculis duis. Pretium quam lectus magna convallis. Sed at venenatis porta nec ac mi senectus a. Venenatis nunc semper at ultrices. Lorem fringilla aenean in et semper id. Et est volutpat in in cum nullam. Dictum amet morbi neque nisi elit tortor enim ut. Quis ipsum metus elit egestas at in mi vulputate tortor. Sapien aliquam imperdiet et justo adipiscing. Consectetur justo morbi morbi vel lacinia.',
    image: img2,
  },
  {
    id: 2,
    title: 'UNI-Lead Mini Workshop',
    excerpt:
      'Lorem ipsum dolor sit amet consectetur. Id id cursus iaculis duis. Pretium quam lectus magna convallis. Sed at venenatis porta nec ac mi senectus a. Venenatis nunc semper at ultrices. Lorem fringilla aenean in et semper id. Et est volutpat in in cum nullam. Dictum amet morbi neque nisi elit tortor enim ut. Quis ipsum metus elit egestas at in mi vulputate tortor. Sapien aliquam imperdiet et justo adipiscing. Consectetur justo morbi morbi vel lacinia.',
    image: img1,
  },
]);
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <!-- Breadcrumb -->
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'Projects & Programmes', href: '/projects' },
        { text: projectName, href: basePath },
        { text: 'Outreach', href: '' },
      ]"
      :page-title="projectName + ' — Outreach'"
    />

    <!-- Secondary navbar (links to sibling pages) -->
    <div class="w-full border-b sticky top-0 z-20 bg-white/95 backdrop-blur">
      <nav class="max-w-6xl flex items-center gap-2 px-25 overflow-x-auto hide-scrollbar">
        <NuxtLink
          v-for="t in tabs"
          :key="t.key"
          :to="t.to"
          class="px-4 py-3 text-base font-semibold whitespace-nowrap"
          :class="
            isActive(t.to)
              ? 'bg-green-100 text-green-900 border-b-2 border-green-700'
              : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
          "
        >
          {{ t.label }}
        </NuxtLink>
      </nav>
    </div>

    <!-- HERO/CAROUSEL -->
    <section class="w-full">
      <HomeCarousel />
    </section>

    <!-- Knowledge Sharing Events -->
    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-10">
      <h2 class="text-[22px] md:text-[26px] font-display font-semibold mb-4">
        Knowledge Sharing Events
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article
          v-for="e in events"
          :key="e.id"
          class="border border-gray-200 rounded-md bg-white p-3 md:p-4 flex gap-4 items-start"
        >
          <div class="w-36 h-24 flex-shrink-0 rounded overflow-hidden">
            <img :src="e.image" :alt="e.title" class="w-full h-full object-cover" />
          </div>
          <div class="">
            <h3 class="text-[16px] font-semibold text-green-800 mb-1">{{ e.title }}</h3>
            <p class="text-sm text-gray-700 line-clamp-3">{{ e.excerpt }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- Policy Dialogues -->
    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 pb-14">
      <h2 class="text-[22px] md:text-[26px] font-display font-semibold mb-4">Policy Dialogues</h2>
      <div class="space-y-5">
        <article
          v-for="d in dialogues"
          :key="d.id"
          class="border border-gray-200 rounded-md bg-white p-3 md:p-4 flex gap-4 items-start"
        >
          <div class="w-52 h-28 flex-shrink-0 rounded overflow-hidden">
            <img :src="d.image" :alt="d.title" class="w-full h-full object-cover" />
          </div>
          <div class="">
            <h3 class="text-[16px] font-semibold text-green-800 mb-1">{{ d.title }}</h3>
            <p class="text-sm text-gray-700">{{ d.excerpt }}</p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
