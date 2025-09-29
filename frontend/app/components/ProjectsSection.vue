<template>
  <section
    class="flex flex-col justify-center items-center w-full relative py-6 sm:py-8 min-h-[420px] md:min-h-[636px]"
  >
    <h2 class="text-[24px] sm:text-[32px] font-display font-medium mb-6 sm:mb-12">Projects</h2>

    <!-- Card container: responsive widths -->
    <div class="flex items-center justify-center w-full px-4 sm:px-6 mx-auto">
      <!-- Centered wrapper with a max width so arrows align to the card on large screens -->
      <div
        class="relative w-full max-w-[320px] sm:max-w-[720px] md:max-w-[1080px] mx-auto items-center justify-center"
      >
        <transition :name="transitionName" mode="out-in">
          <div :key="currentIndex" class="w-full">
            <!-- Desktop / wide layout: keep existing ProjectCard -->
            <div class="hidden md:flex md:justify-center md:w-full">
              <ProjectCard
                :image-url="currentProject?.imageUrl || ''"
                :title="currentProject?.title || ''"
                :description="currentProject?.description || ''"
              />
            </div>

            <!-- Mobile: vertical layout (image -> text -> button), slightly smaller -->
            <div v-if="currentProject" class="md:hidden bg-white rounded-lg shadow-sm p-3 sm:p-4">
              <img
                :src="currentProject.imageUrl"
                :alt="currentProject.title || 'Project image'"
                class="w-full h-36 sm:h-44 object-cover rounded-md"
              />

              <div class="mt-3">
                <h3 class="text-base font-semibold sm:text-lg sm:font-medium leading-tight">
                  {{ currentProject.title }}
                </h3>
                <p class="text-sm sm:text-[14px] text-gray-600 mt-2">
                  {{ currentProject.description }}
                </p>
              </div>

              <div class="mt-3 flex justify-center">
                <!-- Simple action button; adjust label to match your ProjectCard action if needed -->
                <button
                  class="px-3 py-2 text-sm sm:text-base bg-green-100 hover:bg-green-200 text-green-800 rounded-md"
                  aria-label="View project"
                >
                  View project
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- Desktop arrows: absolutely positioned inside the centered wrapper -->
        <div v-if="items.length > 1" class="hidden md:block">
          <button
            class="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-100 hover:bg-green-200 border-green-200 rounded-full flex items-center justify-center transition-colors"
            aria-label="Previous project"
            @click="prev"
          >
            <svg
              class="w-5 h-5 text-green-800"
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
            class="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-100 hover:bg-green-200 border-green-200 rounded-full flex items-center justify-center transition-colors"
            aria-label="Next project"
            @click="next"
          >
            <svg
              class="w-5 h-5 text-green-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile arrows: inline under the card (smaller on mobile) -->
    <div v-if="items.length > 1" class="flex items-center space-x-3 mt-4 md:hidden">
      <button
        class="w-9 h-9 bg-green-100 hover:bg-green-200 border-green-200 rounded-full flex items-center justify-center transition-colors"
        aria-label="Previous project"
        @click="prev"
      >
        <svg
          class="w-4 h-4 text-green-800"
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
        class="w-9 h-9 bg-green-100 hover:bg-green-200 border-green-200 rounded-full flex items-center justify-center transition-colors"
        aria-label="Next project"
        @click="next"
      >
        <svg
          class="w-4 h-4 text-green-800"
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

/* Reduce motion for small screens: smaller translate distances for better feel */
@media (max-width: 640px) {
  .slide-next-enter-from {
    transform: translateX(20px) scale(0.995);
  }
  .slide-next-leave-to {
    transform: translateX(-20px) scale(0.995);
  }
  .slide-prev-enter-from {
    transform: translateX(-20px) scale(0.995);
  }
  .slide-prev-leave-to {
    transform: translateX(20px) scale(0.995);
  }
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
