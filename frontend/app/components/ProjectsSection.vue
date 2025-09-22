<template>
  <section class="flex flex-col justify-center items-center h-[636px] w-full relative">
    <h2 class="text-[32px] font-display font-medium mb-12">Projects</h2>
    <div class="flex items-center space-x-4">
      <transition :name="transitionName" mode="out-in">
        <div :key="currentIndex">
          <ProjectCard
            :image-url="currentProject.imageUrl"
            :title="currentProject.title"
            :description="currentProject.description"
          />
        </div>
      </transition>
    </div>
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
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
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
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import CarouselImage1 from '~/assets/images/carousel-1.png';
import CarouselImage2 from '~/assets/images/carousel-2.png';

const projects = [
  {
    id: 1,
    title:
      'Co-creating knowledge for local adaptation to climate change in least developed countries (COLOCAL)',
    description:
      'Building the capacity of universities in the Global South, to work towards climate change adaptation through education and research.',
    imageUrl: CarouselImage1,
  },
  {
    id: 2,
    title: 'Another Project Title',
    description: 'A short description for the second project.',
    imageUrl: CarouselImage2,
  },
  {
    id: 3,
    title: 'Third Project Example',
    description: 'This is the description for the third project in the carousel.',
    imageUrl: CarouselImage1,
  },
];

const currentIndex = ref(0);
const transitionName = ref('slide-next');

const currentProject = computed(() => {
  return projects[currentIndex.value];
});

function next() {
  transitionName.value = 'slide-next';
  currentIndex.value = (currentIndex.value + 1) % projects.length;
}

function prev() {
  transitionName.value = 'slide-prev';
  currentIndex.value = (currentIndex.value - 1 + projects.length) % projects.length;
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
