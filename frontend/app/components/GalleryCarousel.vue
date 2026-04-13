<template>
  <div v-if="carouselImages.length" class="gallery-carousel">
    <div class="carousel" role="region" aria-label="Image gallery carousel">
      <transition :name="transitionName" mode="out-in">
        <div :key="`${activeIndex}-${currentSlide}`" class="carousel-slide">
          <img :src="currentSlide" :alt="slideAlt(activeIndex)" class="media" />
        </div>
      </transition>

      <div class="carousel-controls">
        <button
          type="button"
          class="control control--prev"
          aria-label="Previous slide"
          @click="prev"
        />
        <button type="button" class="control control--next" aria-label="Next slide" @click="next" />
      </div>

      <div class="carousel-indicators">
        <div class="indicator-track">
          <button
            v-for="(src, i) in carouselImages"
            :key="`${src}-${i}`"
            type="button"
            class="indicator"
            :class="i === activeIndex ? 'indicator--active' : 'indicator--inactive'"
            :aria-label="`Go to slide ${i + 1}`"
            :aria-current="i === activeIndex ? 'true' : 'false'"
            @click="goTo(i)"
          />
          <span class="indicator-count"> {{ activeIndex + 1 }} / {{ carouselImages.length }} </span>
        </div>
      </div>

      <p class="sr-only" aria-live="polite">{{ liveMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue';

const props = defineProps<{
  images: Array<string | null | undefined> | null | undefined;
  title?: string | null;
}>();

const normalizedImages = computed(() => {
  const list: string[] = [];
  const seen = new Set<string>();
  if (!Array.isArray(props.images)) return list;
  for (const entry of props.images) {
    const src = typeof entry === 'string' ? entry : null;
    if (!src) continue;
    const trimmed = src.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    list.push(trimmed);
  }
  return list;
});

const carouselImages = computed(() => normalizedImages.value.slice());

const AUTO_ADVANCE_INTERVAL = 3000;
let autoAdvanceTimer: ReturnType<typeof setInterval> | null = null;

const stopAutoAdvance = () => {
  if (autoAdvanceTimer !== null) {
    clearInterval(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
};

const startAutoAdvance = () => {
  stopAutoAdvance();
  if (carouselImages.value.length <= 1) {
    return;
  }
  autoAdvanceTimer = setInterval(() => {
    advanceNext(true);
  }, AUTO_ADVANCE_INTERVAL);
};

const restartAutoAdvance = () => {
  stopAutoAdvance();
  startAutoAdvance();
};

const activeIndex = ref(0);
const transitionName = ref<'slide-next' | 'slide-prev'>('slide-next');
const currentSlide = computed(() => carouselImages.value[activeIndex.value] ?? '');

watch(carouselImages, (images) => {
  activeIndex.value = 0;
  if (!images.length) transitionName.value = 'slide-next';
  startAutoAdvance();
});

function goTo(i: number) {
  const total = carouselImages.value.length;
  if (!total || i === activeIndex.value || i < 0 || i >= total) return;
  const current = activeIndex.value;
  const forward = (i - current + total) % total;
  const backward = (current - i + total) % total;
  transitionName.value = forward <= backward ? 'slide-next' : 'slide-prev';
  activeIndex.value = i;
  restartAutoAdvance();
}

function advanceNext(fromAuto: boolean) {
  const total = carouselImages.value.length;
  if (!total) return;
  transitionName.value = 'slide-next';
  activeIndex.value = (activeIndex.value + 1) % total;
  if (!fromAuto) {
    restartAutoAdvance();
  }
}

function next() {
  advanceNext(false);
}

function prev() {
  const total = carouselImages.value.length;
  if (!total) return;
  transitionName.value = 'slide-prev';
  activeIndex.value = (activeIndex.value - 1 + total) % total;
  restartAutoAdvance();
}

const liveMessage = ref('');
watchEffect(() => {
  const total = carouselImages.value.length;
  if (!total) {
    liveMessage.value = '';
    return;
  }
  liveMessage.value = `Slide ${activeIndex.value + 1} of ${total}`;
});

const title = computed(() => props.title ?? 'Gallery image');

function slideAlt(index: number) {
  const total = carouselImages.value.length;
  if (!total) return title.value;
  return `${title.value} — image ${index + 1} of ${total}`;
}

onMounted(() => {
  startAutoAdvance();
});

onBeforeUnmount(() => {
  stopAutoAdvance();
});
</script>

<style scoped>
.gallery-carousel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.carousel {
  position: relative;
  width: 100%;
  height: 22rem;
  border-radius: 0.75rem;
  overflow: hidden;
}

@media (min-width: 768px) {
  .carousel {
    height: 26rem;
  }
}

.media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-controls {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 0.75rem;
  pointer-events: none;
}

.control {
  pointer-events: auto;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.85);
  color: #1f2937;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.control::before {
  display: block;
  content: '';
  font-size: 1.25rem;
  line-height: 1;
  font-weight: 500;
  color: inherit;
}

.control--prev::before {
  content: '‹';
}

.control--next::before {
  content: '›';
}

@media (min-width: 768px) {
  .control {
    width: 2.75rem;
    height: 2.75rem;
  }
}

.control:hover {
  background-color: #ffffff;
}

.carousel-indicators {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.indicator-track {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(0, 0, 0, 0.35);
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  pointer-events: auto;
}

.indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  transition:
    transform 200ms ease,
    background-color 200ms ease;
}

.indicator--active {
  background-color: #ffffff;
  transform: scale(1.4);
}

.indicator--inactive {
  background-color: rgba(255, 255, 255, 0.6);
}

.indicator-count {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  user-select: none;
}

.carousel-slide {
  width: 100%;
  height: 100%;
}

.slide-next-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.99);
}

.slide-next-enter-active {
  transition:
    opacity 420ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-next-leave-active {
  transition:
    opacity 360ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-32px) scale(0.99);
}

.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-40px) scale(0.99);
}

.slide-prev-enter-active {
  transition:
    opacity 420ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-prev-leave-active {
  transition:
    opacity 360ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(32px) scale(0.99);
}

@media (prefers-reduced-motion: reduce) {
  .slide-next-enter-active,
  .slide-next-leave-active,
  .slide-prev-enter-active,
  .slide-prev-leave-active {
    transition: none !important;
    transform: none !important;
  }
}
</style>
