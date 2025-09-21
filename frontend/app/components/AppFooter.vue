<template>
  <footer class="h-[485px] bg-[#0F172A] text-white px-45 relative">
    <div class="mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 h-full">
        <!-- Left Column - Logo and Contact Info -->
        <div class="flex flex-row justify-start items-start space-x-8 py-31 h-32">
          <img src="~/assets/logos/luccc-logo.png" alt="LUCCC Logo" class="h-10 my-1.5" />

          <div
            class="text-gray-300 flex flex-col justify-start self-start space-y-7 underline decoration-green-600 underline-offset-2"
          >
            <div>
              <span class="text-sm">+(880)1813444112</span>
            </div>
            <div>
              <span class="text-sm">hello@luccc.org</span>
            </div>
          </div>
        </div>

        <div class="col-span-2 flex flex-col justify-center ml-62">
          <div class="flex flex-row justify-between py-25">
            <div class="flex flex-col">
              <nav class="space-y-3 text-sm font-sans font-semibold">
                <NuxtLink
                  v-for="link in primaryLinks"
                  :key="link.path"
                  :to="link.path"
                  class="block hover:text-white transition-colors"
                >
                  {{ link.label }}
                </NuxtLink>
              </nav>
            </div>

            <!-- Right Column - Additional Navigation -->
            <div class="flex flex-col">
              <nav class="space-y-3 text-sm font-sans font-semibold">
                <NuxtLink
                  v-for="link in secondaryLinks"
                  :key="link.path"
                  :to="link.path"
                  class="block hover:text-white transition-colors"
                >
                  {{ link.label }}
                </NuxtLink>
              </nav>
            </div>
            <!-- Scroll to Top Button -->
            <button
              class="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
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
          </div>
          <!-- Copyright -->
          <div class="">
            <p class="text-gray-400 text-sm">©2025 LUCCC- All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Navigation link data
const primaryLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Resource Hub', path: '/resource-hub' },
  { label: 'Projects & Programmes', path: '/projects' },
  { label: 'Education & Training', path: '/education' },
];

const secondaryLinks = [
  { label: 'News', path: '/news' },
  { label: 'Events', path: '/events' },
];

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};
</script>
