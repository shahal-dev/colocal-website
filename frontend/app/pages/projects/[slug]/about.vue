<script setup>
import { computed } from 'vue';
import { useRoute } from '#app';

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
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <!-- Breadcrumb -->
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'Projects & Programmes', href: '/projects' },
        { text: projectName, href: basePath },
        { text: 'About', href: '' },
      ]"
      :page-title="projectName + ' — About'"
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

    <!-- About content -->
    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-12">
      <p class="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
        {{ projectName }}
      </p>
      <h1 class="text-[22px] md:text-[26px] font-display font-semibold mb-4">About Us</h1>

      <div class="space-y-4 text-gray-700 leading-relaxed">
        <p>
          For universities to effectively deliver education and research for climate change
          adaptation, they must be responsive to the perceptions, knowledges, needs and priorities
          of local communities. This requires working with the most vulnerable communities to foster
          collaborative learning. The capacity to offer and engage in relevant education and
          research is, however, currently lacking.
        </p>
        <p>
          The aim of this project is therefore to build capacity of universities in the Global South
          for education and research around knowledge for locally-led adaptation. This is achieved
          through initiatives to:
        </p>
        <ul class="list-disc pl-6 space-y-1">
          <li>Revise existing courses and develop new courses and programmes;</li>
          <li>Recruit and educate students at the bachelor and masters level;</li>
          <li>Recruit and train PhD candidates;</li>
        </ul>
        <p>Support research on locally led adaptation principles and practices.</p>
        <p>
          The project is designed to contribute to the goals of the Least Developed Countries
          Universities Consortium on Climate Change (LUCCC), including south-south collaboration
          working with the most vulnerable to foster collaborative learning and capacity-building.
        </p>
      </div>
    </section>

    <!-- Objectives -->
    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 pb-16">
      <h2 class="text-center text-[22px] md:text-[26px] font-display font-semibold mb-6">
        Objectives
      </h2>
      <div class="space-y-4">
        <div class="bg-gray-50 border border-gray-200 rounded-md p-4 md:p-5 text-gray-800">
          For universities in the world's least developed countries to have improved capacity to
          work towards climate change adaptation through education and research.
        </div>
        <div class="bg-gray-50 border border-gray-200 rounded-md p-4 md:p-5 text-gray-800">
          Activities include research that focuses on vulnerable communities facing diverse climate
          risks and uncertainties. Bottom-up approaches to knowledge co-creation
        </div>
        <div class="bg-gray-50 border border-gray-200 rounded-md p-4 md:p-5 text-gray-800">
          Such research-based knowledge will feed into educational curricula development and
          capacity-building activities.
        </div>
        <div class="bg-gray-50 border border-gray-200 rounded-md p-4 md:p-5 text-gray-800">
          Capacity-building will be engaged at multiple levels through inter- and intra-country
          learning, involving students, researchers and educators, community groups, local
          governments, and policy makers.
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
