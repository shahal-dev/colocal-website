<template>
    <div
        role="region"
        aria-label="Homepage carousel"
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
                            <h1 class="m-0 mb-2 text-white text-[32px] font-semibold font-display">{{ currentItem.title }}</h1>
                            <p class="m-0 mb-8 text-lg md:text-lg font-display font-medium text-white">{{ currentItem.subtitle }}</p>
                            <div class="flex flex-wrap gap-4">
                                <button
                                    v-for="(button, btnIndex) in currentItem.buttons"
                                    :key="btnIndex"
                                    class="px-6 py-4 rounded-sm hover:opacity-95 font-poppins font-semibold"
                                    :class="btnIndex === 0 ? 'bg-green-600 hover:border-green-200 text-white' : 'bg-green-100 hover:border-green-200 text-green-800'"
                                >
                                    {{ button.text }}
                                </button>
                            </div>
                        </div>

                        <!-- Image -->
                        <div class="md:w-[720px] w-full h-48 md:h-full flex items-center justify-center">
                            <img v-if="currentItem.image" :src="currentItem.image" :alt="currentItem.title" class="w-full h-full object-cover">
                        </div>
                    </div>
                </transition>

        <!-- Controls -->
            <button
              class="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
              aria-label="Scroll to top"
              @click="prev"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <button
              class="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
              aria-label="Scroll to top"
              @click="next"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <!-- Slide indicators -->
            <div class="absolute left-1/2 -translate-x-1/2 bottom-6 flex items-center gap-3">
                            <button
                                v-for="(item, idx) in carouselItems"
                                :key="idx"
                                :aria-label="`Go to slide ${idx + 1}`"
                                :aria-current="idx === currentIndex ? 'true' : 'false'"
                                class="w-10 h-1 rounded-sm"
                                :class="idx === currentIndex ? 'bg-green-600' : 'bg-white'"
                                @click="goTo(idx)" />
            </div>

            <!-- Live region for screen readers -->
            <p class="sr-only" aria-live="polite">{{ liveMessage }}</p>
    </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watchEffect } from 'vue'
// Import images so Vite/Nuxt resolves and serves the correct URLs
// Note: images live under app/assets/images in this Nuxt layout
import carousel1 from '~/assets/images/carousel-1.png'
import carousel2 from '~/assets/images/carousel-2.png'

const carouselItems = ref([
    {
        title: 'Empowering Global Collaboration for Climate Action in Least Developed Countries',
        subtitle: 'Driving Research, Education, and Policy to Build Climate Resilience',
        buttons: [{ text: 'Explore Our Work' }, { text: 'Get in Touch' }],
        image: carousel1
    },
    {
        title: 'Co-creating knowledge for local adaptation to climate change in least developed countries',
        subtitle: 'Empowering local communities through collaborative climate action and research',
        buttons: [{ text: 'View Project' }],
        image: carousel2
    }
])

const currentIndex = ref(0)
let autoplayTimer = null
const autoplayDelay = 5000
// transitionName is set before changing the index so Vue applies the
// correct directional transition classes (slide-next / slide-prev)
const transitionName = ref('slide-next')

const currentItem = computed(() => carouselItems.value[currentIndex.value])

// Accessibility: live message for screen readers
const liveMessage = ref(`Slide ${currentIndex.value + 1} of ${carouselItems.value.length}: ${currentItem.value.title}`)

// update liveMessage whenever currentIndex changes
watchEffect(() => {
    liveMessage.value = `Slide ${currentIndex.value + 1} of ${carouselItems.value.length}: ${currentItem.value.title}`
})

function goTo(idx) {
    if (idx === currentIndex.value) return
    const len = carouselItems.value.length
    const current = currentIndex.value
    const forwardDistance = (idx - current + len) % len
    const backwardDistance = (current - idx + len) % len
    transitionName.value = forwardDistance <= backwardDistance ? 'slide-next' : 'slide-prev'
    currentIndex.value = idx
}

function onKeydown(e) {
    if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
    } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
    }
}

function next() {
    transitionName.value = 'slide-next'
    currentIndex.value = (currentIndex.value + 1) % carouselItems.value.length
}

function prev() {
    transitionName.value = 'slide-prev'
    currentIndex.value = (currentIndex.value - 1 + carouselItems.value.length) % carouselItems.value.length
}

function startAutoplay() {
    stopAutoplay()
    autoplayTimer = setInterval(() => next(), autoplayDelay)
}

function stopAutoplay() {
    if (autoplayTimer) {
        clearInterval(autoplayTimer)
        autoplayTimer = null
    }
}

function pauseAutoplay() {
    stopAutoplay()
}

onMounted(() => {
    startAutoplay()
})

onBeforeUnmount(() => {
    stopAutoplay()
})
</script>
<style scoped>
/* Direction-aware slide transitions (larger motion) */
/* slide-next: new slide enters from right -> center, old slides exit to left */
.slide-next-enter-from {
    opacity: 0;
    transform: translateX(40px) scale(0.995);
}
.slide-next-enter-active {
    transition: opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
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
    transition: opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
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
    transition: opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
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
    transition: opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
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
    transition: opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
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


