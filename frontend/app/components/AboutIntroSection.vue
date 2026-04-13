<script setup lang="ts">
import { computed } from 'vue';
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
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
});
</script>

<template>
  <section
    class="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
  >
    <!-- Left: Text -->
    <div class="order-2 md:order-1">
      <p class="text-sm font-semibold text-green-700 mb-2">{{ subtitleText }}</p>

      <h2
        class="text-2xl sm:text-[28px] md:text-[32px] leading-tight md:leading-tight font-display font-semibold mb-4 sm:mb-5 whitespace-pre-line"
      >
        {{ titleText }}
      </h2>

      <div class="space-y-4 text-gray-700 mb-6">
        <p v-for="(para, idx) in aboutParagraphs" :key="idx" class="text-sm sm:text-base">
          {{ para }}
        </p>
      </div>

      <div class="flex md:block">
        <a
          href="/about/team"
          class="w-full md:w-auto text-center px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-sm font-semibold"
        >
          Our Team
        </a>
      </div>
    </div>

    <!-- Right: Image -->
    <div class="order-1 md:order-2">
      <figure class="w-full rounded overflow-hidden shadow-sm">
        <img
          :src="aboutImage"
          alt="LUCCC team working"
          loading="lazy"
          decoding="async"
          class="w-full h-56 sm:h-72 md:h-[360px] object-cover object-center block"
        />
      </figure>
    </div>
  </section>
</template>

<style scoped>
/* optional small helpers if you want tighter control on very small screens */
@media (max-width: 420px) {
  .font-display {
    font-size: 1.05rem;
  }
}
</style>
