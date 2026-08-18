<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useState } from '#imports';
import type { Project } from '~~/types/content';
import colocalLogo from '../assets/logos/COLOCAL-Logo.png';
import lucccLogo from '../assets/logos/luccc-logo.png';

/**
 * Single navbar shared by both layers of the site.
 *
 * The LUCCC layer (everything under `/`) and a project layer (everything under
 * `/projects/:slug`, e.g. COLOCAL) render the exact same markup and styling —
 * only the link targets, the logo and the "About …" / "… Blog" labels differ.
 * The project layer additionally drops the two items that have no
 * project-scoped equivalent: "Projects & Programmes" (the project is itself a
 * project under LUCCC) and "List of Universities" (a LUCCC consortium list).
 */

type NavChild = { label: string; to: string };
type NavItem = { label: string; to: string; children?: NavChild[] };

const route = useRoute();

const slug = computed(() => {
  if (!route.path.startsWith('/projects/')) return '';
  const param = route.params.slug;
  if (typeof param === 'string') return param;
  if (Array.isArray(param)) return param[0] ?? '';
  return '';
});

const isProjectLayer = computed(() => Boolean(slug.value));

const projectState = computed<Project | null>(() => {
  if (!isProjectLayer.value) return null;
  return useState<Project | null>(`project:${slug.value}`, () => null).value;
});

const projectName = computed(() => projectState.value?.shortTitle || 'Project');
const basePath = computed(() => (isProjectLayer.value ? `/projects/${slug.value}` : ''));

const logo = computed(() => {
  // Logos stay as they are: COLOCAL keeps its own mark, everything else LUCCC.
  if (projectName.value === 'COLOCAL') {
    return { src: colocalLogo, alt: 'COLOCAL logo', to: basePath.value };
  }
  return { src: lucccLogo, alt: 'LUCCC logo', to: isProjectLayer.value ? basePath.value : '/' };
});

const items = computed<NavItem[]>(() => {
  if (isProjectLayer.value) {
    const base = basePath.value;
    return [
      { label: 'Home', to: base },
      {
        label: `About ${projectName.value}`,
        to: `${base}/about`,
        children: [
          { label: `About ${projectName.value}`, to: `${base}/about` },
          { label: 'Our Team', to: `${base}/team` },
        ],
      },
      { label: 'Resource Hub', to: `${base}/research` },
      { label: 'Education & Training', to: `${base}/education` },
      { label: 'News & Events', to: `${base}/outreach` },
      { label: `${projectName.value} Blog`, to: `${base}/blog` },
    ];
  }

  return [
    { label: 'Home', to: '/' },
    {
      label: 'About Us',
      to: '/about',
      children: [
        { label: 'About Us', to: '/about' },
        { label: 'List of Universities', to: '/about/universities' },
        { label: 'Our Team', to: '/about/team' },
      ],
    },
    { label: 'Resource Hub', to: '/resource-hub' },
    { label: 'Projects & Programmes', to: '/projects' },
    { label: 'Education & Training', to: '/education-training' },
    { label: 'News & Events', to: '/news-events' },
    { label: 'Blog', to: '/blog' },
  ];
});

const homeHref = computed(() => (isProjectLayer.value ? basePath.value : '/'));

function isActive(item: NavItem) {
  if (item.to === homeHref.value) return route.path === item.to;
  if (route.path === item.to || route.path.startsWith(`${item.to}/`)) return true;
  return (item.children ?? []).some(
    (child) => route.path === child.to || route.path.startsWith(`${child.to}/`)
  );
}

const mobileOpen = ref(false);
const aboutOpen = ref(false);

// Close the mobile menu on navigation so it never lingers over the new page.
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
    class="flex items-center justify-between px-6 md:px-25 py-4 z-50 w-full sticky top-0 bg-white shadow-md"
  >
    <div class="flex items-center">
      <NuxtLink :to="logo.to" class="flex items-center">
        <img :src="logo.src" :alt="logo.alt" class="h-10 md:h-12" />
      </NuxtLink>
    </div>

    <!-- Desktop menu -->
    <div class="hidden md:flex items-center space-x-3 font-poppins font-semibold">
      <template v-for="item in items" :key="item.to">
        <div
          v-if="item.children"
          class="relative group navbar-item"
          :class="{ 'is-active': isActive(item) }"
        >
          <NuxtLink :to="item.to" class="hover:text-gray-900 flex items-center">
            {{ item.label }}
            <svg class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </NuxtLink>
          <div
            class="absolute left-0 mt-3 w-60 bg-white rounded-xl border border-slate-200 font-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-sm"
          >
            <div class="py-1">
              <NuxtLink
                v-for="(child, idx) in item.children"
                :key="child.to"
                :to="child.to"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                :class="idx < item.children.length - 1 ? 'border-b border-slate-200' : ''"
              >
                {{ child.label }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <NuxtLink v-else :to="item.to" class="navbar-item" :class="{ 'is-active': isActive(item) }">
          {{ item.label }}
        </NuxtLink>
      </template>

      <NuxtLink v-if="isProjectLayer" to="/" class="navbar-item">Back to LUCCC</NuxtLink>
    </div>

    <!-- Mobile controls -->
    <div class="md:hidden flex items-center">
      <button
        class="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
        :aria-expanded="mobileOpen.toString()"
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
    </div>

    <!-- Mobile menu -->
    <transition name="fade">
      <div
        v-show="mobileOpen"
        class="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-200 shadow-sm z-40"
      >
        <div class="flex flex-col py-2 px-4 space-y-1 font-poppins font-medium">
          <template v-for="item in items" :key="`m-${item.to}`">
            <!-- About accordion for mobile -->
            <div v-if="item.children">
              <button
                type="button"
                class="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100"
                :aria-expanded="aboutOpen.toString()"
                @click="aboutOpen = !aboutOpen"
              >
                <span>{{ item.label }}</span>
                <svg
                  :class="{ 'transform rotate-180': aboutOpen, 'transform rotate-0': !aboutOpen }"
                  class="h-4 w-4 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              <transition name="slide-fade">
                <div v-show="aboutOpen" class="mt-1 ml-2 border-l border-slate-100 pl-3">
                  <NuxtLink
                    v-for="child in item.children"
                    :key="`m-${child.to}`"
                    :to="child.to"
                    class="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm"
                  >
                    {{ child.label }}
                  </NuxtLink>
                </div>
              </transition>
            </div>

            <NuxtLink v-else :to="item.to" class="block px-3 py-2 rounded-md hover:bg-gray-100">
              {{ item.label }}
            </NuxtLink>
          </template>

          <NuxtLink
            v-if="isProjectLayer"
            to="/"
            class="block px-3 py-2 rounded-md hover:bg-gray-100"
          >
            Back to LUCCC
          </NuxtLink>
        </div>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
.navbar-item {
  padding: 6px 10px;
  border-radius: 8px;
}
.navbar-item:hover {
  background-color: #f3f4f6; /* Tailwind's gray-100 */
}
.navbar-item.is-active {
  background-color: #f0fdf4; /* green-100 */
  color: #166534; /* green-800 */
}

/* simple transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.15s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
