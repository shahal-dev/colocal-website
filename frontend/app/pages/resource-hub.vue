<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from '#app';

useHead({
  title: 'Resource Hub — LUCCC',
});

// Nested route check for /resource-hub/:id
const route = useRoute();
const hasChild = computed(() => Boolean(route.params.id));
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <NuxtPage v-if="hasChild" />
    <template v-else>
      <BreadCrumb
        :breadcrumb-items="[
          { text: 'Home', href: '/' },
          { text: 'Resource Hub', href: '/resource-hub' },
        ]"
        page-title="Resource Hub"
      />

      <!-- LUCCC layer: no project filter, so everything shows -->
      <ResourceHubList base-path="/resource-hub" />
    </template>
  </div>
</template>
