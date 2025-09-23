<template>
  <div class="h-[84px] w-full bg-green-600 flex items-center justify-center px-25">
    <div class="w-full flex flex-row gap-2 justify-between">
      <div class="flex flex-row items-center gap-2">
        <template v-for="(item, index) in props.breadcrumbItems" :key="index">
          <a
            v-if="item.href"
            :href="item.href"
            class="text-white font-sans font-medium hover:underline"
          >
            {{ item.text }}
          </a>
          <span v-else class="text-white font-sans font-medium">
            {{ item.text }}
          </span>

          <svg
            v-if="index < breadcrumbItems.length - 1"
            class="rotate-90 w-4 h-4 text-white"
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
        </template>
      </div>
      <h2 class="text-white text-xl font-display font-medium">{{ pageTitle }}</h2>
    </div>
  </div>
</template>

<script setup>
// Define component props
const props = defineProps({
  breadcrumbItems: {
    type: Array,
    required: true,
    default: () => [],
  },
  pageTitle: {
    type: String,
    required: true,
    default: '',
  },
});
</script>
