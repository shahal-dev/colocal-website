<template>
  <section class="flex flex-col justify-center items-center h-[636px] w-full relative">
    <h2 class="text-[32px] font-display font-medium mb-12">Projects</h2>
    <div class="flex items-center space-x-4">
      <transition :name="transitionName" mode="out-in">
        <div :key="currentIndex">
          <ProjectCard
            :image-url="currentProject?.imageUrl || ''"
            :title="currentProject?.title || ''"
            :description="currentProject?.description || ''"
          />
        </div>
      </transition>
    </div>
    <div v-if="items.length > 1">
      <button
        class="absolute left-30 top-1/2 translate-y-1/2 w-12 h-12 bg-green-100 hover:bg-green-200 border-green-200 rounded-full flex items-center justify-center transition-colors"
        aria-label="Previous project"
        @click="prev"
      >
        <svg
          class="w-6 h-6 text-green-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        class="absolute right-30 top-1/2 translate-y-1/2 w-12 h-12 bg-green-100 hover:bg-green-200 border-green-200 rounded-full flex items-center justify-center transition-colors"
        aria-label="Next project"
        @click="next"
      >
        <svg
          class="w-6 h-6 text-green-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Project } from '../../types/content';

type ProjectCardItem = { id: number; title: string; description: string; imageUrl: string };

const props = defineProps<{ projects: Project[] | null | undefined }>();

const items = computed<ProjectCardItem[]>(() => {
  if (!Array.isArray(props.projects)) return [];
  return props.projects.map((p) => ({
    id: p.id,
    title: p.longTitle || p.shortTitle,
    description: p.shortDescription,
    imageUrl: p.cover?.formats?.medium?.url || p.cover?.url || '',
  }));
});

const currentIndex = ref(0);
const transitionName = ref<'slide-next' | 'slide-prev'>('slide-next');

const currentProject = computed<ProjectCardItem | undefined>(() => items.value[currentIndex.value]);

function next() {
  if (!items.value.length) return;
  transitionName.value = 'slide-next';
  currentIndex.value = (currentIndex.value + 1) % items.value.length;
}

function prev() {
  if (!items.value.length) return;
  transitionName.value = 'slide-prev';
  currentIndex.value = (currentIndex.value - 1 + items.value.length) % items.value.length;
}
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

/* Respect user preference for reduced motion */
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
