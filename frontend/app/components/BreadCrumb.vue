<template>
  <div class="w-full bg-green-600 px-4 sm:px-6 lg:px-10 py-3 sm:py-4">
    <div class="w-full flex flex-col sm:flex-row items-center sm:items-center gap-2 justify-between">
      <nav class="flex items-center gap-2 overflow-x-auto whitespace-nowrap max-w-full sm:max-w-[60%]"
        aria-label="Breadcrumb">
        <template v-for="(item, index) in breadcrumbItems" :key="index">
          <a v-if="item.href" :href="item.href"
            class="text-white font-sans font-medium hover:underline truncate max-w-[160px] sm:max-w-[240px]"
            :aria-current="index === breadcrumbItems.length - 1 ? 'page' : null">
            {{ item.text }}
          </a>

          <span v-else class="text-white font-sans font-medium truncate max-w-[160px] sm:max-w-[240px]"
            :aria-current="index === breadcrumbItems.length - 1 ? 'page' : null">
            {{ item.text }}
          </span>

          <!-- separator (don't render after last item) -->
          <svg v-if="index < breadcrumbItems.length - 1"
            class="rotate-90 w-3 h-3 sm:w-4 sm:h-4 text-white mx-1 flex-shrink-0" fill="none" stroke="currentColor"
            viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </template>
      </nav>

      <!-- <h2 -->
      <!--   class="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-display font-medium truncate max-w-full sm:max-w-[35%] text-center sm:text-right" -->
      <!-- > -->
      <!--   {{ pageTitle }} -->
      <!-- </h2> -->
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';

const props = defineProps({
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

// toRefs so template gets reactive, but values are auto-unwrapped in template
const { breadcrumbItems, pageTitle } = toRefs(props);
</script>
