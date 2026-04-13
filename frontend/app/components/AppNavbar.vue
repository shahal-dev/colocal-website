<template>
  <nav
    class="flex items-center justify-between px-6 md:px-25 py-4 z-50 w-full sticky top-0 bg-white shadow-md"
  >
    <div class="flex items-center">
      <a href="/" class="flex items-center">
        <img src="../assets/logos/luccc-logo.png" alt="Logo" class="h-10 md:h-12" >
      </a>
    </div>

    <!-- Desktop menu -->
    <div class="hidden md:flex items-center space-x-3 font-poppins font-semibold">
      <a href="/" class="navbar-item">Home</a>

      <div class="relative group navbar-item">
        <a href="/about" class="hover:text-gray-900 flex items-center">
          About Us
          <svg class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </a>
        <div
          class="absolute left-0 mt-3 w-52 bg-white rounded-xl border border-slate-200 font-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-sm"
        >
          <div class="py-1">
            <a
              href="/about"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-slate-200"
              >About Us</a
            >
            <a
              href="/about/universities"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-slate-200"
              >List of Universities</a
            >
            <a href="/about/team" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >Our Team</a
            >
          </div>
        </div>
      </div>

      <a href="/resource-hub" class="navbar-item">Resource Hub</a>
      <a href="/projects" class="navbar-item">Projects & Programmes</a>
      <a href="/education-training" class="navbar-item">Education & Training</a>
      <a href="/news-events" class="navbar-item">News & Events</a>
    </div>

    <!-- Mobile controls -->
    <div class="md:hidden flex items-center">
      <button
        class="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
        :aria-expanded="mobileOpen.toString()"
        @click="mobileOpen = !mobileOpen"
      >
        <svg
          v-if="!mobileOpen"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Mobile menu -->
    <transition name="fade">
      <div
        v-show="mobileOpen"
        class="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-200 shadow-sm z-40"
      >
        <div class="flex flex-col py-2 px-4 space-y-1 font-poppins font-medium">
          <a href="/" class="block px-3 py-2 rounded-md hover:bg-gray-100">Home</a>

          <!-- About accordion for mobile -->
          <div>
            <button
              type="button"
              class="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100"
              aria-expanded="aboutOpen"
              @click="aboutOpen = !aboutOpen"
            >
              <span>About Us</span>
              <svg
                :class="{ 'transform rotate-180': aboutOpen, 'transform rotate-0': !aboutOpen }"
                class="h-4 w-4 transition-transform"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <transition name="slide-fade">
              <div v-show="aboutOpen" class="mt-1 ml-2 border-l border-slate-100 pl-3">
                <a href="/about" class="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm"
                  >About Us</a
                >
                <a
                  href="/about/universities"
                  class="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm"
                  >List of Universities</a
                >
                <a href="/about/team" class="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm"
                  >Our Team</a
                >
              </div>
            </transition>
          </div>

          <a href="/resource-hub" class="block px-3 py-2 rounded-md hover:bg-gray-100"
            >Resource Hub</a
          >
          <a href="/projects" class="block px-3 py-2 rounded-md hover:bg-gray-100"
            >Projects & Programmes</a
          >
          <a href="/education-training" class="block px-3 py-2 rounded-md hover:bg-gray-100"
            >Education & Training</a
          >
          <a href="/news-events" class="block px-3 py-2 rounded-md hover:bg-gray-100"
            >News & Events</a
          >
        </div>
      </div>
    </transition>
  </nav>
</template>

<script>
export default {
  name: 'AppNavbar',
  data() {
    return {
      mobileOpen: false,
      aboutOpen: false,
    };
  },
};
</script>

<style scoped>
.navbar-item {
  padding: 6px 10px;
  border-radius: 8px;
}
.navbar-item:hover {
  background-color: #f3f4f6; /* Tailwind's gray-100 */
}

/* simple transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.15s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
