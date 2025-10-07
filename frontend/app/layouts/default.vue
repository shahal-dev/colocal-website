<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from '#app';

const route = useRoute();
const hideNavbar = computed(() => route.path.startsWith('/projects/'));
</script>

<template>
  <div>
    <AppNavbar v-if="!hideNavbar" />
    <slot />
    <AppFooter />
  </div>
</template>
