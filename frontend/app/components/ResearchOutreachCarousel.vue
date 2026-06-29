<template>
  <div
    role="region"
    aria-label="Research and outreach carousel"
    tabindex="0"
    class="relative overflow-hidden w-full bg-home-carousel h-[420px] sm:h-96 md:h-[600px]"
    @mouseenter="pauseAutoplay"
    @mouseleave="startAutoplay"
    @focusin="pauseAutoplay"
    @focusout="startAutoplay"
    @keydown="onKeydown"
  >
    <transition :name="transitionName" mode="out-in">
      <div :key="currentIndex" class="h-full w-full flex flex-col md:flex-row">
        <!-- Image (mobile first: full-background; desktop: static side image) -->
        <div
          class="absolute inset-0 md:static md:w-[720px] md:h-full flex items-center justify-center md:order-2 order-1 z-0"
        >
          <div v-if="currentSlide && currentSlide.image" class="relative w-full h-full">
            <!-- Blurred background image to fill blank spaces -->
            <NuxtImg
              :src="currentSlide.image"
              :alt="currentSlide.alt || 'Feature image'"
              sizes="100vw md:720px"
              format="webp"
              quality="35"
              class="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-80"
              loading="lazy"
              decoding="async"
              aria-hidden="true"
            />

            <!-- Main image with object-contain -->
            <NuxtImg
              :src="currentSlide.image"
              :alt="currentSlide.alt || 'Feature image'"
              sizes="100vw md:720px"
              format="webp"
              quality="82"
              class="relative z-10 w-full h-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <!-- Mobile overlay (only shown on small screens) -->
        <div class="absolute inset-0 bg-black/60 md:hidden z-10 pointer-events-none" />

        <!-- Content -->
        <div
          class="relative z-50 flex flex-col justify-center items-start px-4 sm:px-6 md:pl-24 md:pr-20 flex-1 md:order-1 order-2 pointer-events-none"
        >
          <h1
            class="m-0 mb-2 text-white text-xl md:text-[32px] lg:text-4xl font-semibold font-display"
          >
            {{ currentSlide?.title }}
          </h1>
          <p class="m-0 mb-6 text-sm md:text-lg font-display font-medium text-white line-clamp-4">
            {{ currentSlide?.subtitle }}
          </p>
          <div class="flex flex-wrap gap-4 pointer-events-auto">
            <NuxtLink
              v-if="currentSlide && currentSlide.to"
              :to="currentSlide.to"
              class="relative z-50 px-5 py-3 rounded-sm hover:opacity-95 font-poppins font-semibold bg-green-600 text-white text-sm md:text-base"
            >
              {{ currentSlide?.cta }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="slides.length > 1">
      <!-- Navigation buttons -->
      <!-- Left button -->
      <button
        aria-label="Previous slide"
        class="absolute left-0 top-0 h-full w-1/3 md:w-1/4 z-30 group pointer-events-auto"
        @click="prev"
      >
        <div
          class="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 md:bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        >
          <svg
            class="w-5 h-5 md:w-6 md:h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
      </button>

      <!-- Right button -->
      <button
        aria-label="Next slide"
        class="absolute right-0 top-0 h-full w-1/3 md:w-1/4 z-30 group pointer-events-auto"
        @click="next"
      >
        <div
          class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 md:bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        >
          <svg
            class="w-5 h-5 md:w-6 md:h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </button>

      <!-- Slide indicators -->
      <div
        class="absolute left-1/2 -translate-x-1/2 bottom-4 sm:bottom-6 flex items-center gap-3 z-30"
      >
        <button
          v-for="(item, idx) in slides"
          :key="idx"
          :aria-label="`Go to slide ${idx + 1}`"
          :aria-current="idx === currentIndex ? 'true' : 'false'"
          class="w-8 sm:w-10 h-1 rounded-sm"
          :class="idx === currentIndex ? 'bg-green-600' : 'bg-white/80'"
          @click="goTo(idx)"
        />
      </div>
    </div>

    <!-- Live region for screen readers -->
    <p class="sr-only" aria-live="polite">{{ liveMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watchEffect } from 'vue';
import type { StrapiMedia } from '~~/types/content';

export type ResearchOutreachCarouselItem = {
  id: string;
  title: string;
  description: string;
  cover: string | StrapiMedia | null | undefined;
  type: 'research' | 'outreach' | 'education';
  slug: string;
};

const props = defineProps<{ items: ResearchOutreachCarouselItem[] | null | undefined }>();

type Slide = {
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  to: string;
  cta: string;
};

function resolveCover(cover: ResearchOutreachCarouselItem['cover'], title: string) {
  if (!cover) {
    return { image: '', alt: `${title} cover image` };
  }
  if (typeof cover === 'string') {
    return { image: cover, alt: `${title} cover image` };
  }
  // Use the full-resolution original and let @nuxt/image (IPX) generate
  // correctly-sized WebP variants. Avoids upscaling Strapi's downscaled formats.
  const image = cover.url || cover.formats?.large?.url || '';
  const alt = cover.alternativeText || `${title} cover image`;
  return { image, alt };
}

const isClient = import.meta.client;

const slides = computed<Slide[]>(() => {
  if (!Array.isArray(props.items) || props.items.length === 0) return [];
  return props.items.map((item) => {
    const { image, alt } = resolveCover(item.cover, item.title);
    return {
      title: item.title,
      subtitle: item.description,
      image,
      alt,
      to: `${item.slug}/${item.type}/${item.id}`,
      cta: item.type === 'research' ? 'View Full Article' : 'View Full Article',
    } satisfies Slide;
  });
});

const currentIndex = ref(0);
let autoplayTimer: ReturnType<typeof setInterval> | null = null;
const autoplayDelay = 5000;
const transitionName = ref<'slide-next' | 'slide-prev'>('slide-next');

const currentSlide = computed<Slide | undefined>(() => slides.value[currentIndex.value]);

const liveMessage = ref('');
watchEffect(() => {
  if (!slides.value.length) {
    liveMessage.value = 'No slides available';
  } else if (currentSlide.value) {
    liveMessage.value = `Slide ${currentIndex.value + 1} of ${slides.value.length}: ${currentSlide.value.title}`;
  } else {
    liveMessage.value = '';
  }
});

function goTo(idx: number) {
  if (idx === currentIndex.value) return;
  const len = slides.value.length;
  if (!len) return;
  const current = currentIndex.value;
  const forwardDistance = (idx - current + len) % len;
  const backwardDistance = (current - idx + len) % len;
  transitionName.value = forwardDistance <= backwardDistance ? 'slide-next' : 'slide-prev';
  currentIndex.value = idx;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prev();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    next();
  }
}

function next() {
  if (!slides.value.length) return;
  transitionName.value = 'slide-next';
  currentIndex.value = (currentIndex.value + 1) % slides.value.length;
}

function prev() {
  if (!slides.value.length) return;
  transitionName.value = 'slide-prev';
  currentIndex.value = (currentIndex.value - 1 + slides.value.length) % slides.value.length;
}

function startAutoplay() {
  stopAutoplay();
  if (!isClient) return;
  if (slides.value.length <= 1) return;
  autoplayTimer = setInterval(() => next(), autoplayDelay);
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

function pauseAutoplay() {
  stopAutoplay();
}

onMounted(() => {
  startAutoplay();
});

onBeforeUnmount(() => {
  stopAutoplay();
});

watchEffect(() => {
  const length = slides.value.length;
  if (!length) {
    currentIndex.value = 0;
    stopAutoplay();
    return;
  }
  if (currentIndex.value >= length) {
    currentIndex.value = 0;
  }
  if (length <= 1) {
    stopAutoplay();
  } else if (!autoplayTimer) {
    startAutoplay();
  }
});
</script>

<style scoped>
.slide-next-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.995);
}
.slide-next-enter-active {
  transition:
    opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-next-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.slide-next-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.slide-next-leave-active {
  transition:
    opacity 420ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-40px) scale(0.995);
}
.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-40px) scale(0.995);
}
.slide-prev-enter-active {
  transition:
    opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-prev-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.slide-prev-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.slide-prev-leave-active {
  transition:
    opacity 420ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.995);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 420ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}
@media (prefers-reduced-motion: reduce) {
  .slide-next-enter-active,
  .slide-next-leave-active,
  .slide-prev-enter-active,
  .slide-prev-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    transition: none !important;
    transform: none !important;
  }
}
</style>
