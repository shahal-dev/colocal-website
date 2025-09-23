<script setup lang="ts">
import type { Component } from 'vue';

const { icon, title, description } = defineProps<{
  icon: Component;
  title: string;
  description: string;
}>();
</script>

<template>
  <div class="flex flex-col h-50 items-center space-y-2 bg-white border border-gray-200 p-4">
    <div class="rounded-full bg-green-200 w-12 h-12 flex items-center justify-center">
      <component :is="icon" class="flex-shrink-0" />
    </div>
    <h3 class="text-xl font-sans font-medium">{{ title }}</h3>
    <p class="text-center font-sans font-light text-gray-600 max-w-xs">
      {{ description }}
    </p>
  </div>
</template>

<style scoped>
/* Keep styling minimal; the parent can override sizing/spacing as needed */
</style>
