<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useRoute } from '#app';

const route = useRoute();
const slug = computed(() => {
  const param = route.params.slug;
  if (typeof param === 'string') return param;
  if (Array.isArray(param)) return param[0] ?? '';
  return '';
});
const isProjectRoute = computed(() => route.path.startsWith('/projects/'));
const showProjectNavbar = computed(() => isProjectRoute.value && Boolean(slug.value));
const activeProjectSlug = computed(() => (showProjectNavbar.value ? slug.value : undefined));

const isNavigating = ref(false);
const minimumLoadingTime = 350;
let loadingStartedAt = 0;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

function showLoadingScreen() {
  if (hideTimer) clearTimeout(hideTimer);
  loadingStartedAt = Date.now();
  isNavigating.value = true;
}

function hideLoadingScreen() {
  const elapsed = Date.now() - loadingStartedAt;
  const remaining = Math.max(0, minimumLoadingTime - elapsed);
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    isNavigating.value = false;
  }, remaining);
}

if (import.meta.client) {
  const nuxtApp = useNuxtApp();
  nuxtApp.hook('page:start', showLoadingScreen);
  nuxtApp.hook('page:finish', hideLoadingScreen);
}

onBeforeUnmount(() => {
  if (hideTimer) clearTimeout(hideTimer);
});
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <AppNavbar :project-slug="activeProjectSlug" />

    <Transition name="route-loading-fade">
      <div
        v-if="isNavigating"
        class="fixed inset-x-0 top-[72px] bottom-0 z-[90] flex items-center justify-center bg-white/95 backdrop-blur-sm md:top-20"
        role="status"
        aria-live="polite"
        aria-label="Loading page"
      >
        <div class="flex flex-col items-center gap-4 px-6 text-center">
          <div class="route-loading-spinner" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p class="text-sm font-semibold tracking-wide text-green-800">Loading page…</p>
        </div>
      </div>
    </Transition>

    <main class="flex-1 pt-[72px] md:pt-20">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.route-loading-fade-enter-active,
.route-loading-fade-leave-active {
  transition: opacity 180ms ease;
}

.route-loading-fade-enter-from,
.route-loading-fade-leave-to {
  opacity: 0;
}

.route-loading-spinner {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  height: 2rem;
}

.route-loading-spinner span {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 9999px;
  background: #16a34a;
  animation: route-loading-bounce 900ms ease-in-out infinite;
}

.route-loading-spinner span:nth-child(2) {
  animation-delay: 120ms;
}

.route-loading-spinner span:nth-child(3) {
  animation-delay: 240ms;
}

@keyframes route-loading-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.45;
  }
  30% {
    transform: translateY(-0.65rem);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .route-loading-spinner span {
    animation: none;
    opacity: 1;
  }
}
</style>
