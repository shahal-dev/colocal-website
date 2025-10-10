<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

const props = defineProps<{
  slug?: string;
}>();
const route = useRoute();

// Test dropdown visibility
const dropdownOpen = ref(false);
const dropdownPosition = ref({ top: '0px', left: '0px' });

function openDropdown(event: MouseEvent) {
  dropdownOpen.value = true;
  // Calculate position based on trigger element
  const trigger = event.currentTarget as HTMLElement;
  const rect = trigger.getBoundingClientRect();
  dropdownPosition.value = {
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
  };
}

function closeDropdown() {
  dropdownOpen.value = false;
}

const slug = computed(() => {
  if (props.slug) return props.slug;
  const param = route.params.slug;
  if (typeof param === 'string') return param;
  if (Array.isArray(param)) return param[0] ?? '';
  return '';
});

const hasSlug = computed(() => Boolean(slug.value));

const projectState = computed<Project | null>(() => {
  if (!hasSlug.value) return null;
  return useState<Project | null>(`project:${slug.value}`, () => null).value;
});

// Compute project name from shared state or fallback
const projectName = computed(() => projectState.value?.shortTitle || 'Project');

// Secondary navbar (links to sibling pages under the slug)
const basePath = computed(() => (hasSlug.value ? `/projects/${slug.value}` : '/projects'));
const tabs = computed(() => {
  if (!hasSlug.value) return [];
  return [
    { key: 'education', label: 'Education & Training', to: `${basePath.value}/education` },
    { key: 'research', label: 'Research & Publications', to: `${basePath.value}/research` },
    { key: 'outreach', label: 'Outreach', to: `${basePath.value}/outreach` },
    { key: 'lla', label: 'LLA Hub', to: `${basePath.value}/lla` },
  ];
});

// Check if current route matches the tab
const isActive = (to: string) => {
  // For exact match on home page
  if (to === basePath.value) {
    return route.path === to;
  }
  // For other pages, check if route starts with the path
  return route.path.startsWith(to);
};
</script>

<template>
  <div
    v-if="hasSlug"
    class="w-full sticky top-0 z-20 bg-white backdrop-blur shadow-sm border-b border-gray-200"
  >
    <nav
      class="mx-auto flex items-center gap-2 px-4 md:px-6 lg:px-8 overflow-x-auto hide-scrollbar"
      style="overflow-y: visible !important"
    >
      <NuxtLink
        v-if="projectName === 'COLOCAL'"
        :to="basePath"
        class="flex items-center shrink-0 mr-2 md:mr-16 px-1 py-0.5 h-6"
      >
        <img src="~/assets/logos/colocal.png" alt="CoLocal logo" class="h-4 w-auto" />
      </NuxtLink>
      <div class="flex items-center md:mx-auto">
        <!-- Home link -->
        <NuxtLink
          :to="basePath"
          class="px-4 py-3 text-sm md:text-base font-semibold whitespace-nowrap transition-colors duration-200"
          :class="
            route.path === basePath
              ? 'bg-green-100 text-green-900 border-b-2 border-green-700'
              : 'bg-white text-gray-700 hover:text-green-700'
          "
        >
          Home
        </NuxtLink>

        <!-- About dropdown -->
        <div class="relative inline-block" @mouseenter="openDropdown" @mouseleave="closeDropdown">
          <a
            href="#"
            class="px-4 py-3 text-sm md:text-base font-semibold whitespace-nowrap transition-colors duration-200 inline-flex items-center hover:text-green-700"
            :class="
              route.path.startsWith(`${basePath}/about`) ||
              route.path.startsWith(`${basePath}/team`)
                ? 'bg-green-100 text-green-900 border-b-2 border-green-700'
                : 'bg-white text-gray-700'
            "
            @click.prevent
          >
            About {{ projectName }}
            <svg class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
        </div>

        <!-- Other tabs -->
        <NuxtLink
          v-for="t in tabs"
          :key="t.key"
          :to="t.to"
          class="px-4 py-3 text-sm md:text-base font-semibold whitespace-nowrap transition-colors duration-200"
          :class="
            isActive(t.to)
              ? 'bg-green-100 text-green-900 border-b-2 border-green-700'
              : 'bg-white text-gray-700 border-gray-300 hover:border-green-300 hover:text-green-700'
          "
        >
          {{ t.label }}
        </NuxtLink>
      </div>
      <NuxtLink
        to="/"
        class="ml-auto px-4 py-3 text-sm md:text-base font-semibold whitespace-nowrap transition-colors duration-200 bg-white text-gray-700 hover:text-green-700"
      >
        Back to LUCCC
      </NuxtLink>
    </nav>

    <!-- Dropdown rendered outside nav to avoid overflow clipping -->
    <Teleport to="body">
      <div
        v-show="dropdownOpen"
        class="fixed w-52 bg-white rounded-lg border border-slate-200 shadow-lg transition-opacity duration-200"
        :style="{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          zIndex: 9999,
        }"
        @mouseenter="dropdownOpen = true"
        @mouseleave="closeDropdown"
      >
        <div class="py-1">
          <NuxtLink
            :to="`${basePath}/about`"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-slate-200"
          >
            About {{ projectName }}
          </NuxtLink>
          <NuxtLink
            :to="`${basePath}/team`"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Our Team
          </NuxtLink>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Responsive improvements */
@media (max-width: 640px) {
  nav {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 480px) {
  nav {
    gap: 0.25rem;
  }

  .nav-link {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
