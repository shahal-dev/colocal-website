<script setup>
import { ref, computed } from 'vue';
import { useRoute } from '#app';
import img1 from '~/assets/images/carousel-1.png';
import img2 from '~/assets/images/carousel-2.png';

// Basic mapping of slug -> project display name
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

// Featured publications (sample data + pagination)
const publications = ref([
  {
    id: 1,
    title: 'Integrating Gender Equality and Social Inclusion (GESI) in Climate Finance',
    authors: ['Ranjana Bhatta', 'Laxmi Chinnal', 'Ajay Bhakta Mathema', 'Mariama Camara'],
    excerpt:
      'Climate change disproportionately affects vulnerable and marginalized communities, exacerbating existing inequalities. Integrating Gender Equality and Social Inclusion (GESI) into climate finance is crucial to ensuring that adaptation and mitigation efforts are fair, inclusive, and effective.',
    tags: ['Integrating', 'Gender Equality', 'Social Inclusion', 'Climate Finance'],
  },
  {
    id: 2,
    title: 'Integrating Gender Equality and Social Inclusion (GESI) in Climate Finance',
    authors: ['Ranjana Bhatta', 'Laxmi Chinnal', 'Ajay Bhakta Mathema', 'Mariama Camara'],
    excerpt:
      'Climate change disproportionately affects vulnerable and marginalized communities, exacerbating existing inequalities. Integrating Gender Equality and Social Inclusion (GESI) into climate finance is crucial to ensuring that adaptation and mitigation efforts are fair, inclusive, and effective.',
    tags: ['Integrating', 'Gender Equality', 'Social Inclusion', 'Climate Finance'],
  },
  {
    id: 3,
    title: 'Community Resilience Pathways',
    authors: ['Alex Karim', 'Rifat Hasan'],
    excerpt:
      'Pathways for building community resilience through inclusive adaptation planning and multi-stakeholder collaboration.',
    tags: ['Resilience', 'Adaptation'],
  },
]);
const pubPage = ref(1);
const pubSize = 2;
const pubTotal = computed(() => Math.max(1, Math.ceil(publications.value.length / pubSize)));
const pubVisible = computed(() => {
  const start = (pubPage.value - 1) * pubSize;
  return publications.value.slice(start, start + pubSize);
});

// Featured news (sample data + pagination)
const newsItems = ref([
  {
    id: 1,
    title: 'LLA Seminar at IUB',
    excerpt: 'Lorem ipsum dolor sit amet consectetur. Id id cursus iaculis duis.',
    image: img1,
  },
  {
    id: 2,
    title: 'UNI-Lead Mini Workshop',
    excerpt: 'Pretium quam lectus magna convallis. Sed at venenatis porta.',
    image: img2,
  },
  {
    id: 3,
    title: 'LLA Seminar at IUB',
    excerpt: 'A venenatis nunc senectus arcu sem.',
    image: img1,
  },
  {
    id: 4,
    title: 'UNI-Lead Mini Workshop',
    excerpt: 'Lorem ipsum dolor sit amet consectetur.',
    image: img2,
  },
  {
    id: 5,
    title: 'LLA Seminar at IUB',
    excerpt: 'Pretium quam lectus magna convallis.',
    image: img1,
  },
  {
    id: 6,
    title: 'UNI-Lead Mini Workshop',
    excerpt: 'Sed at venenatis porta nec ac mi.',
    image: img2,
  },
]);
const newsPage = ref(1);
const newsSize = 4;
const newsTotal = computed(() => Math.max(1, Math.ceil(newsItems.value.length / newsSize)));
const newsVisible = computed(() => {
  const start = (newsPage.value - 1) * newsSize;
  return newsItems.value.slice(start, start + newsSize);
});

// Fellows (static grid)
const fellows = ref([
  { id: 1, name: 'António Guterres', affiliation: 'Universidade Eduardo Mondlane' },
  { id: 2, name: 'Rafia Anjum Rimi', affiliation: 'Independent University, Bangladesh' },
  { id: 3, name: 'Tenzing Norgay', affiliation: 'Pokhara University' },
  { id: 4, name: 'Celia', affiliation: 'Makerere University' },
  { id: 5, name: 'António Guterres', affiliation: 'Universidade Eduardo Mondlane' },
  { id: 6, name: 'Rafia Anjum Rimi', affiliation: 'Independent University, Bangladesh' },
  { id: 7, name: 'Tenzing Norgay', affiliation: 'Pokhara University' },
  { id: 8, name: 'Celia', affiliation: 'Makerere University' },
]);
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <!-- Breadcrumb-->
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'Projects & Programmes', href: '/projects' },
        { text: projectName, href: '' },
      ]"
      :page-title="projectName"
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

    <!-- HERO/CAROUSEL (reuse home carousel) -->
    <section id="home" class="w-full scroll-mt-24">
      <HomeCarousel />
    </section>

    <!-- About section (static placeholder copy) -->
    <section id="about" class="w-full max-w-6xl mx-auto px-4 md:px-0 py-12 scroll-mt-24">
      <p class="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
        {{ projectName }}
      </p>
      <h2 class="text-[22px] md:text-[26px] font-display font-semibold mb-3">
        Co-creating knowledge for local adaptation to climate change in least developed countries
      </h2>
      <div class="space-y-4 text-gray-700 leading-relaxed">
        <p>
          For universities to effectively deliver education and research for climate change
          adaptation, they must be responsive to the perceptions, knowledges, needs and priorities
          of local communities. This requires working with the most vulnerable communities to foster
          collaborative learning. The capacity to offer and engage in relevant education and
          research is, however, currently lacking.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur. Pulvinar tristique sit id accumsan. Pellentesque
          nunc egestas enim diam quam. Tellus aliquam sodales amet quis. Tortor fringilla convallis
          convallis amet ac mauris. Amet commodo consequat malesuada ante. Odio viverra odio turpis
          fringilla amet sed. Faucibus vitae lectus facilisi urna. Tellus aliquet suspendisse
          fringilla mi tortor sapien in purus.
        </p>
        <p>
          Dui lorem enim sit lectus pulvinar pharetra nulla urna amet. Eget at senectus magna diam
          sollicitudin scelerisque. Sagittis ut ipsum nullam integer porta in tortor pretium.
          Consectetur quisque urna nibh eu tincidun t odio. Neque scelerisque vitae lorem sed enim
          tristique condimentum. Nisi id viverra nisi vitae nibh, iaculis proin suscipit aliquam
          vitae interdum morbi hendrerit mauris commodo.
        </p>
      </div>
    </section>

    <!-- Featured Publications -->
    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-12">
      <h2 class="text-center text-[24px] md:text-[28px] font-display font-medium mb-6">
        Featured Publications
      </h2>
      <div class="space-y-4">
        <article
          v-for="p in pubVisible"
          :key="p.id"
          class="border border-gray-200 rounded-md bg-white p-4 md:p-5"
        >
          <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-2">{{ p.title }}</h3>
          <div class="flex items-center text-sm text-gray-600 mb-3">
            <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87" stroke-width="2" />
              <circle cx="12" cy="7" r="4" stroke-width="2" />
            </svg>
            <span>{{ p.authors.join(' • ') }}</span>
          </div>
          <p class="text-sm text-gray-700 mb-3">{{ p.excerpt }}</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(tag, idx) in p.tags"
              :key="idx"
              class="inline-block text-xs px-2 py-1 rounded border border-green-200 text-green-700 bg-green-50"
              >{{ tag }}</span
            >
          </div>
        </article>
      </div>
      <!-- Publications pagination -->
      <div v-if="pubTotal > 1" class="mt-6 flex items-center justify-center gap-2">
        <button
          v-for="page in pubTotal"
          :key="page"
          class="min-w-[32px] h-7 px-2 text-sm rounded border"
          :class="
            page === pubPage
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-800 border-gray-300'
          "
          @click="pubPage = page"
        >
          {{ page }}
        </button>
      </div>
    </section>

    <!-- Featured News -->
    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-12">
      <h2 class="text-center text-[24px] md:text-[28px] font-display font-medium mb-6">
        Featured News
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article
          v-for="n in newsVisible"
          :key="n.id"
          class="border border-gray-200 rounded-md bg-white overflow-hidden flex"
        >
          <div class="w-40 h-28 flex-shrink-0">
            <img :src="n.image" :alt="n.title" class="w-full h-full object-cover" />
          </div>
          <div class="p-4">
            <h3 class="text-[15px] font-semibold text-green-700 mb-1">{{ n.title }}</h3>
            <p class="text-sm text-gray-700 line-clamp-2">{{ n.excerpt }}</p>
          </div>
        </article>
      </div>
      <!-- News pagination -->
      <div v-if="newsTotal > 1" class="mt-6 flex items-center justify-center gap-2">
        <button
          v-for="page in newsTotal"
          :key="page"
          class="min-w-[32px] h-7 px-2 text-sm rounded border"
          :class="
            page === newsPage
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-800 border-gray-300'
          "
          @click="newsPage = page"
        >
          {{ page }}
        </button>
      </div>
    </section>

    <!-- Our Fellows -->
    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-12">
      <h2 class="text-center text-[24px] md:text-[28px] font-display font-medium mb-8">
        Our Fellows
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="f in fellows"
          :key="f.id"
          class="bg-blue-gray-50 border border-gray-200 rounded-md p-8 flex flex-col items-center text-center"
        >
          <div
            class="w-16 h-16 rounded-full border-4 border-blue-300 text-blue-500 flex items-center justify-center mb-4"
          >
            <!-- Simple person icon -->
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="8" r="4" stroke-width="2" />
              <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke-width="2" />
            </svg>
          </div>
          <p class="m-0 font-medium text-gray-900">{{ f.name }}</p>
          <p class="m-0 text-sm text-gray-600 max-w-[220px]">{{ f.affiliation }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
