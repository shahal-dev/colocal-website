<script setup></script>

<template>
  <section class="w-full bg-blue-gray-100 py-16">
    <div
      class="max-w-3xl mx-auto bg-white/90 border border-gray-200 rounded-md shadow-sm p-10 text-center"
    >
      <div
        class="mx-auto w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-4"
      >
        <span class="text-xl">🏛️</span>
      </div>
      <h3 class="text-lg md:text-xl font-display font-semibold mb-1">List of Universities</h3>
      <p class="text-sm text-gray-600 mb-6">Take a look at the universities affiliated with us.</p>
      <NuxtLink
        to="/about/universities"
        class="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-sm font-semibold"
      >
        View List
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped></style>
