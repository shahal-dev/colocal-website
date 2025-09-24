<template>
  <div
    role="region"
    aria-label="Homepage project carousel"
    tabindex="0"
    class="relative overflow-hidden h-96 md:h-[600px] w-full bg-home-carousel"
    @mouseenter="pauseAutoplay"
    @mouseleave="startAutoplay"
    @focusin="pauseAutoplay"
    @focusout="startAutoplay"
    @keydown="onKeydown"
  >
    <transition :name="transitionName" mode="out-in">
      <div :key="currentIndex" class="h-full w-full flex flex-col md:flex-row">
        <!-- Content -->
        <div class="flex flex-col justify-center items-start px-6 md:pl-24 md:pr-20 flex-1">
          <h1 class="m-0 mb-2 text-white text-[32px] font-semibold font-display">
            {{ currentSlide?.title }}
          </h1>
          <p class="m-0 mb-8 text-lg md:text-lg font-display font-medium text-white line-clamp-4">
            {{ currentSlide?.subtitle }}
          </p>
          <div class="flex flex-wrap gap-4">
            <button
              v-for="(button, btnIndex) in currentSlide?.buttons || []"
              :key="btnIndex"
              class="px-6 py-4 rounded-sm hover:opacity-95 font-poppins font-semibold"
              :class="
                btnIndex === 0
                  ? 'bg-green-600 hover:border-green-200 text-white'
                  : 'bg-green-100 hover:border-green-200 text-green-800'
              "
            >
              {{ button.text }}
            </button>
          </div>
        </div>

        <!-- Image -->
        <div class="md:w-[720px] w-full h-48 md:h-full flex items-center justify-center">
          <img
            v-if="currentSlide && currentSlide.image"
            :src="currentSlide.image"
            :alt="currentSlide?.title || 'Project image'"
            class="w-full h-full object-cover"
          />
        </div>
      </div>
    </transition>

    <div v-if="slides.length > 1">
      <!-- Controls -->
      <button
        class="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 w-8 h-8 p-2 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
        aria-label="Previous slide"
        @click="prev"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button
        class="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 w-8 h-8 p-2 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
        aria-label="Next slide"
        @click="next"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <!-- Slide indicators -->
      <div class="absolute left-1/2 -translate-x-1/2 bottom-6 flex items-center gap-3">
        <button
          v-for="(item, idx) in slides"
          :key="idx"
          :aria-label="`Go to slide ${idx + 1}`"
          :aria-current="idx === currentIndex ? 'true' : 'false'"
          class="w-10 h-1 rounded-sm"
          :class="idx === currentIndex ? 'bg-green-600' : 'bg-white'"
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
import type { Project } from '../../types/content';

const props = defineProps<{ projects: Project[] | null | undefined }>();

type Slide = {
  title: string;
  subtitle: string;
  image: string;
  buttons: { text: string }[];
};

const slides = computed<Slide[]>(() => {
  if (!Array.isArray(props.projects) || props.projects.length === 0) return [];
  return props.projects.map((p) => ({
    title: p.longTitle || p.shortTitle,
    subtitle: p.shortDescription,
    image: p.cover?.formats?.large?.url || p.cover?.url || '',
    buttons: [{ text: 'View Project' }],
  }));
});

const currentIndex = ref(0);
let autoplayTimer: ReturnType<typeof setInterval> | null = null;
const autoplayDelay = 5000;
const transitionName = ref<'slide-next' | 'slide-prev'>('slide-next');

const currentSlide = computed<Slide | undefined>(() => slides.value[currentIndex.value]);

const liveMessage = ref('');
watchEffect(() => {
  if (!slides.value.length) {
    liveMessage.value = 'No slides';
  } else if (currentSlide.value) {
    liveMessage.value = `Slide ${currentIndex.value + 1} of ${slides.value.length}: ${currentSlide.value.title}`;
  } else {
    liveMessage.value = '';
  }
});

function goTo(idx: number) {
  if (idx === currentIndex.value) return;
  const len = slides.value.length;
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
</script>
<style scoped>
/* Direction-aware slide transitions (larger motion) */
/* slide-next: new slide enters from right -> center, old slides exit to left */
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

/* slide-prev: new slide enters from left -> center, old slides exit to right */
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

/* Fallback fade (kept for any components still using name="fade") */
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

/* Respect user preference for reduced motion */
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
