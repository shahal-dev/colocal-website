<script setup lang="ts">
definePageMeta({
  middleware: 'project-data',
});
</script>

<template>
  <!-- Middleware loads shared project state before the layout and nested pages render. -->
  <NuxtPage />
</template>
