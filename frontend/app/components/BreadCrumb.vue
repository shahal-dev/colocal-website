<template>
  <!-- The former green breadcrumb strip was intentionally removed site-wide. -->
  <div class="hidden" aria-hidden="true" />
</template>

<script setup>
defineProps({
  breadcrumbItems: {
    type: Array,
    required: false,
    default: () => [],
  },
  pageTitle: {
    type: String,
    required: false,
    default: '',
  },
});
</script>
