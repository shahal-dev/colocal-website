<script setup lang="ts">
import aboutImage from '~/assets/images/carousel-1.png';

const props = defineProps<{ subtitle?: string; title?: string; about?: string }>();

const subtitleText = computed(() => props.subtitle || 'Building Climate Resilience Together');
const titleText = computed(
  () => props.title || 'About LUCCC: Advancing Climate Action in\nLeast Developed Countries'
);
const aboutParagraphs = computed(() => {
  const fallback = [
    'The Least Developed Countries (LDCs) Universities Consortium on Climate Change (LUCCC) is a South-South long-term capacity-building platform comprised of universities as founding members from the LDCs. Other LDC universities are gradually joining the group.',
    'Under this network of universities, faculty members and students share experiences and knowledge on climate change to build capacity through education, training, research and communication. LUCCC as an LDC-wide initiative has been endorsed by the LDC Ministerial in Addis Ababa in October 2018.',
  ];
  const text = props.about?.trim();
  if (!text) return fallback;
  // Split on blank lines for paragraphs
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
});
</script>

<template>
  <section
    class="w-full max-w-6xl mx-auto py-14 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center"
  >
    <!-- Left: Text -->
    <div>
      <p class="text-sm font-semibold text-green-700 mb-2">{{ subtitleText }}</p>
      <h2
        class="text-[28px] md:text-[32px] leading-tight font-display font-semibold mb-5 whitespace-pre-line"
      >
        {{ titleText }}
      </h2>
      <div class="space-y-4 text-gray-700 mb-6">
        <p v-for="(para, idx) in aboutParagraphs" :key="idx">{{ para }}</p>
      </div>
      <a
        href="/about/team"
        class="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-sm font-semibold"
      >
        Our Team
      </a>
    </div>

    <!-- Right: Image -->
    <div>
      <img
        :src="aboutImage"
        alt="LUCCC team working"
        class="w-full h-[360px] object-cover rounded"
      />
    </div>
  </section>
</template>

<style scoped></style>
