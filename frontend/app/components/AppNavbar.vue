<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

const props = defineProps<{ projectSlug?: string }>();
const route = useRoute();
const mobileOpen = ref(false);
const aboutOpen = ref(false);

const isProjectLayer = computed(() => Boolean(props.projectSlug));
const projectBase = computed(() => (props.projectSlug ? `/projects/${props.projectSlug}` : ''));
const project = computed<Project | null>(() => {
  if (!props.projectSlug) return null;
  return useState<Project | null>(`project:${props.projectSlug}`, () => null).value;
});
const projectName = computed(() => project.value?.shortTitle || 'COLOCAL');

const links = computed(() => ({
  home: isProjectLayer.value ? projectBase.value : '/',
  about: isProjectLayer.value ? `${projectBase.value}/about` : '/about',
  team: isProjectLayer.value ? `${projectBase.value}/team` : '/about/team',
  education: isProjectLayer.value ? `${projectBase.value}/education` : '/education-training',
  research: isProjectLayer.value ? `${projectBase.value}/research` : '/research-publications',
  outreach: isProjectLayer.value ? `${projectBase.value}/outreach` : '/outreach',
  blog: isProjectLayer.value ? `${projectBase.value}/blog` : '/blog',
}));

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false;
    aboutOpen.value = false;
  }
);
</script>

<template>
  <nav
    class="fixed inset-x-0 top-0 z-[100] isolate flex h-[72px] w-full items-center justify-between bg-white px-4 shadow-md md:h-20 md:px-10 lg:px-16 xl:px-24"
    :aria-label="isProjectLayer ? `${projectName} navigation` : 'LUCCC navigation'"
  >
    <div class="flex min-w-0 items-center gap-2 md:gap-3">
      <NuxtLink to="/" class="flex shrink-0 items-center" aria-label="Go to the LUCCC homepage">
        <img
          src="~/assets/logos/luccc-logo.png"
          alt="LUCCC"
          class="w-auto origin-left object-contain transition-all duration-500 ease-out"
          :class="isProjectLayer ? 'h-6 md:h-8' : 'h-10 md:h-12'"
        />
      </NuxtLink>

      <Transition name="project-logo">
        <NuxtLink
          v-if="isProjectLayer"
          :to="projectBase"
          class="flex min-w-0 items-center border-l border-slate-200 pl-2 md:pl-3"
          :aria-label="`Go to the ${projectName} homepage`"
        >
          <img
            src="~/assets/logos/COLOCAL-Logo.png"
            :alt="projectName"
            class="h-8 w-auto max-w-[108px] object-contain md:h-11 md:max-w-[150px]"
          />
        </NuxtLink>
      </Transition>
    </div>

    <div class="hidden items-center space-x-1 font-poppins font-semibold lg:flex lg:space-x-2">
      <NuxtLink :to="links.home" class="navbar-item">Home</NuxtLink>

      <div class="group relative navbar-item">
        <NuxtLink :to="links.about" class="flex items-center hover:text-gray-900">
          About Us
          <svg class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </NuxtLink>
        <div
          class="invisible absolute left-0 mt-3 w-52 rounded-xl border border-slate-200 bg-white font-normal opacity-0 shadow-sm transition-all duration-200 group-hover:visible group-hover:opacity-100"
        >
          <div class="py-1">
            <NuxtLink
              :to="links.about"
              class="block border-b border-slate-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              About {{ isProjectLayer ? projectName : 'LUCCC' }}
            </NuxtLink>
            <NuxtLink
              v-if="!isProjectLayer"
              to="/about/universities"
              class="block border-b border-slate-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              List of Universities
            </NuxtLink>
            <NuxtLink
              :to="links.team"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              :class="{ 'border-b border-slate-200': !isProjectLayer }"
            >
              Our Team
            </NuxtLink>
            <NuxtLink
              v-if="!isProjectLayer"
              to="/projects"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Projects &amp; Programmes
            </NuxtLink>
          </div>
        </div>
      </div>

      <NuxtLink :to="links.education" class="navbar-item">Education &amp; Training</NuxtLink>
      <NuxtLink :to="links.research" class="navbar-item">Research &amp; Publications</NuxtLink>
      <NuxtLink :to="links.outreach" class="navbar-item">Outreach</NuxtLink>
      <NuxtLink :to="links.blog" class="navbar-item">Blog Posts</NuxtLink>
    </div>

    <button
      class="rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-300 lg:hidden"
      :aria-expanded="mobileOpen"
      aria-label="Toggle navigation menu"
      @click="mobileOpen = !mobileOpen"
    >
      <svg
        v-if="!mobileOpen"
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <Transition name="fade">
      <div
        v-show="mobileOpen"
        class="absolute left-0 top-full z-40 w-full border-t border-slate-200 bg-white shadow-sm lg:hidden"
      >
        <div class="flex flex-col space-y-1 px-4 py-2 font-poppins font-medium">
          <NuxtLink :to="links.home" class="mobile-item">Home</NuxtLink>
          <div>
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-gray-100"
              :aria-expanded="aboutOpen"
              @click="aboutOpen = !aboutOpen"
            >
              <span>About Us</span>
              <svg
                class="h-4 w-4 transition-transform"
                :class="{ 'rotate-180': aboutOpen }"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <Transition name="slide-fade">
              <div v-show="aboutOpen" class="ml-2 mt-1 border-l border-slate-100 pl-3">
                <NuxtLink :to="links.about" class="mobile-subitem">
                  About {{ isProjectLayer ? projectName : 'LUCCC' }}
                </NuxtLink>
                <NuxtLink v-if="!isProjectLayer" to="/about/universities" class="mobile-subitem">
                  List of Universities
                </NuxtLink>
                <NuxtLink :to="links.team" class="mobile-subitem">Our Team</NuxtLink>
                <NuxtLink v-if="!isProjectLayer" to="/projects" class="mobile-subitem">
                  Projects &amp; Programmes
                </NuxtLink>
              </div>
            </Transition>
          </div>
          <NuxtLink :to="links.education" class="mobile-item">Education &amp; Training</NuxtLink>
          <NuxtLink :to="links.research" class="mobile-item">Research &amp; Publications</NuxtLink>
          <NuxtLink :to="links.outreach" class="mobile-item">Outreach</NuxtLink>
          <NuxtLink :to="links.blog" class="mobile-item">Blog Posts</NuxtLink>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.navbar-item {
  border-radius: 0.5rem;
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
}

@media (min-width: 1024px) {
  .navbar-item {
    padding-inline: 0.625rem;
    font-size: 1rem;
  }
}

.navbar-item:hover,
.router-link-active.navbar-item {
  background-color: #f3f4f6;
}

.mobile-item,
.mobile-subitem {
  display: block;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
}

.mobile-subitem {
  font-size: 0.875rem;
}
.mobile-item:hover,
.mobile-subitem:hover {
  background-color: #f3f4f6;
}

.project-logo-enter-active,
.project-logo-leave-active {
  overflow: hidden;
  transition:
    opacity 400ms ease,
    transform 500ms ease,
    max-width 500ms ease;
}

.project-logo-enter-from,
.project-logo-leave-to {
  max-width: 0;
  opacity: 0;
  transform: translateX(-0.75rem) scale(0.92);
}

.project-logo-enter-to,
.project-logo-leave-from {
  max-width: 190px;
  opacity: 1;
  transform: translateX(0) scale(1);
}

.fade-enter-active,
.fade-leave-active,
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.fade-enter-from,
.fade-leave-to,
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}

@media (prefers-reduced-motion: reduce) {
  .project-logo-enter-active,
  .project-logo-leave-active {
    transition: none;
  }
}
</style>
