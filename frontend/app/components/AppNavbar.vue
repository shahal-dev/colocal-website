<template>
  <nav class="flex items-center justify-between px-25 py-4 z-50 w-full sticky bg-white">
    <div>
      <a href="/">
        <img src="../assets/logos/luccc-logo.png" alt="Logo" class="h-12" />
      </a>
    </div>

    <div class="flex items-center space-x-3 font-poppins font-semibold">
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
          class="absolute left-0 mt-3 w-48 bg-white rounded-xl border-1 font-normal opacity-0 border-slate-200 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
        >
          <div class="py-1">
            <a
              href="/about"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b-1 border-slate-200"
              >About Us</a
            >
            <a
              href="/about/universities"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b-1 border-slate-200"
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
  </nav>
</template>

<!-- <style scoped>
.navbar-item {
    padding: 4px 8px;
    border-radius: 8px;
}

.navbar-item:hover {
    background-color: #f3f4f6; /* Tailwind's gray-100 */
}
</style> -->
