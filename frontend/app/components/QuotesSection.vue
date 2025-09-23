<script setup>
import { ref, computed } from 'vue';
import QuoteCard from './QuoteCard.vue';
import avatar1 from '~/assets/images/carousel-1.png';
import avatar2 from '~/assets/images/carousel-2.png';

const quotes = [
  {
    id: 1,
    name: 'MD Fahad Hossain',
    role: 'Coordinator',
    quote:
      'Lorem ipsum dolor sit amet consectetur. Feugiat ipsum facilisi penatibus urna risus vitae blandit nunc. Morbi sed placerat tellus eget a. A ullamcorper eu curabitur justo diam lectus morbi nisl amet.',
    avatar: avatar1,
  },
  {
    id: 2,
    name: 'Nadia Rahman',
    role: 'Research Lead',
    quote:
      'In LDCs, collaboration between universities and communities is essential to co-create knowledge and build resilience to climate change.',
    avatar: avatar2,
  },
];

const currentIndex = ref(0);
const transitionName = ref('slide-next');
const currentQuote = computed(() => quotes[currentIndex.value]);

function next() {
  transitionName.value = 'slide-next';
  currentIndex.value = (currentIndex.value + 1) % quotes.length;
}

function prev() {
  transitionName.value = 'slide-prev';
  currentIndex.value = (currentIndex.value - 1 + quotes.length) % quotes.length;
}
</script>

<template>
  <section class="w-full bg-blue-gray-100 py-14">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-[28px] md:text-[32px] font-display font-medium">Quotes</h2>
        <div class="flex items-center gap-3">
          <button
            class="w-10 h-10 bg-green-100 text-green-800 rounded-full flex items-center justify-center"
            aria-label="Previous quote"
            @click="prev"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            class="w-10 h-10 bg-green-100 text-green-800 rounded-full flex items-center justify-center"
            aria-label="Next quote"
            @click="next"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <div class="flex justify-center">
        <transition :name="transitionName" mode="out-in">
          <div :key="currentIndex">
            <QuoteCard
              :name="currentQuote.name"
              :role="currentQuote.role"
              :quote="currentQuote.quote"
              :avatar="currentQuote.avatar"
            />
          </div>
        </transition>
      </div>
    </div>
  </section>
</template>

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
