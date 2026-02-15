<template>
  <footer class="bg-[#0F172A] text-white py-8 sm:py-12 px-4 sm:px-8 lg:px-20">
    <div class="max-w-7xl mx-auto w-full">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
        <!-- Left Column - Logo and Contact Info -->
        <div v-if="showLogo" class="flex items-start space-x-4 md:space-x-6">
          <img src="~/assets/logos/luccc-logo.png" alt="LUCCC Logo" class="h-10 w-auto" >

          <!-- <div class="text-gray-300 flex flex-col justify-start space-y-2 text-sm">
            <a href="tel:+8801813444112" class="hover:underline">+(880) 1813444112</a>
            <a href="mailto:hello@luccc.org" class="hover:underline">hello@luccc.org</a>
          </div> -->
        </div>
        <div v-else class="flex items-start space-x-4 md:space-x-6">
          <img src="~/assets/logos/colocal.png" alt="LUCCC Logo" class="h-10 w-auto" >

          <!-- <div class="text-gray-300 flex flex-col justify-start space-y-2 text-sm">
            <a href="tel:+8801813444112" class="hover:underline">+(880) 1813444112</a>
            <a href="mailto:hello@luccc.org" class="hover:underline">hello@luccc.org</a>
          </div> -->
        </div>

        <!-- Middle + Right Columns -->
        <div
          class="col-span-2 flex flex-col md:flex-row md:items-start md:justify-between space-y-6 md:space-y-0"
        >
          <div class="flex-1 flex flex-col sm:flex-row sm:space-x-8 md:space-x-12">
            <!-- Primary Links -->
            <nav class="mb-2 sm:mb-0">
              <h3 class="sr-only">Primary links</h3>
              <ul class="space-y-2 text-sm font-semibold">
                <li v-for="link in primaryLinks" :key="link.path">
                  <NuxtLink
                    :to="link.path"
                    class="block text-gray-300 hover:text-white transition-colors"
                  >
                    {{ link.label }}
                  </NuxtLink>
                </li>
              </ul>
            </nav>

            <!-- Secondary Links -->
            <nav class="mt-4 sm:mt-0">
              <h3 class="sr-only">Secondary links</h3>
              <ul class="space-y-2 text-sm font-semibold">
                <li v-for="link in secondaryLinks" :key="link.path">
                  <NuxtLink
                    :to="link.path"
                    class="block text-gray-300 hover:text-white transition-colors"
                  >
                    {{ link.label }}
                  </NuxtLink>
                </li>
              </ul>
            </nav>
          </div>

          <!-- Scroll to Top Button (responsive placement) -->
          <div class="flex items-center justify-end">
            <!-- shown on md+ -->
            <button
              class="hidden md:inline-flex w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full items-center justify-center transition-colors shadow-lg"
              aria-label="Scroll to top"
              @click="scrollToTop"
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

            <!-- shown on small screens under links -->
            <div class="md:hidden flex justify-center w-full mt-2">
              <button
                class="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
                aria-label="Scroll to top"
                @click="scrollToTop"
              >
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="mt-8 border-t border-gray-800 pt-4">
        <p class="text-gray-400 text-sm text-center md:text-left">
          ©2025 LUCCC - All Rights Reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

// Navigation link data
const primaryLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Resource Hub', path: '/resource-hub' },
  { label: 'Projects & Programmes', path: '/projects' },
  { label: 'Education & Training', path: '/education-training' },
];

const secondaryLinks = [
  { label: 'News', path: '/news-events' },
  { label: 'Events', path: '/news-events' },
];

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

// hide logo on any route matching /projects/* (keeps logo on /projects)
const route = useRoute();
const showLogo = computed(() => !route.path.startsWith('/projects/'));
</script>
