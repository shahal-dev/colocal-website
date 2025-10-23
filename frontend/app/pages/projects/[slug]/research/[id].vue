<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

const route = useRoute();
const slug = route.params.slug;
const id = Number(route.params.id);
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

// const projectName = (() => {
//   const map = { colocal: 'COLOCAL', 'mangrove-restoration': 'Mangrove Restoration' };
//   return map[String(slug).toLowerCase()] || 'Project';
// })();

const basePath = computed(() => `/projects/${slug}`);
// const tabs = computed(() => [
//   { key: 'home', label: 'Home', to: basePath.value },
//   { key: 'about', label: 'About ' + projectName, to: `${basePath.value}/about` },
//   { key: 'education', label: 'Education & Training', to: `${basePath.value}/education` },
//   { key: 'research', label: 'Research & Publications', to: `${basePath.value}/research` },
//   { key: 'outreach', label: 'Outreach', to: `${basePath.value}/outreach` },
//   { key: 'lla', label: 'LLA Hub', to: `${basePath.value}/lla` },
// ]);
// const isActive = (to) => route.path.startsWith(to);

// Fetch current publication and more publications for sidebar
const { data: current, status } = await useAsyncData(
  () => `publication:${slug}:${id}`,
  () => $fetch('/api/publications', { params: { projectSlug: String(slug), id: String(id) } })
);
const item = computed(() => (current.value && current.value[0]) || null);

useHead({
  title: item.value?.title
    ? `${item.value.title} — ${projectName.value} Research & Publications`
    : `${projectName.value} — Research & Publications`,
});

console.log('status', status);
const images = computed(() => {
  const arr = [];
  if (item.value?.imageCover?.url) arr.push(item.value.imageCover.url);
  if (item.value?.images && Array.isArray(item.value.images)) {
    // allow item.images to be array of strings or objects with url
    item.value.images.forEach((it) => {
      if (!it) return;
      arr.push(typeof it === 'string' ? it : it.url);
    });
  }
  return arr;
});

const { data: moreList } = await useAsyncData(
  () => `publications-more:${slug}`,
  () => $fetch('/api/publications', { params: { projectSlug: String(slug) } })
);
const more = computed(() => (moreList.value || []).filter((n) => n.id !== id).slice(0, 6));

/* Carousel state & handlers */
const activeIndex = ref(0);

// Reset to 0 when image list changes (e.g., navigation)
watch(images, () => {
  activeIndex.value = 0;
});

// click indicator
function goTo(i: number) {
  activeIndex.value = i;
}

// Touch/swipe handling
let touchStartX = 0;
let touchDeltaX = 0;

function getClientX(e: TouchEvent | MouseEvent | PointerEvent): number {
  // Safely handle touch events by casting and checking the first touch exists
  const touches = (e as TouchEvent).touches;
  if (touches && touches.length > 0 && touches[0] && typeof touches[0].clientX === 'number') {
    return touches[0].clientX;
  }
  if ('clientX' in e && typeof (e as MouseEvent | PointerEvent).clientX === 'number') {
    return (e as MouseEvent | PointerEvent).clientX;
  }
  return 0;
}

function onTouchStart(e: TouchEvent | MouseEvent | PointerEvent): void {
  touchDeltaX = 0;
  touchStartX = getClientX(e);
}

function onTouchMove(e: TouchEvent | MouseEvent | PointerEvent): void {
  const x = getClientX(e);
  touchDeltaX = x - touchStartX;
}

function onTouchEnd() {
  const threshold = 50; // px
  if (Math.abs(touchDeltaX) > threshold) {
    if (touchDeltaX < 0) {
      // swipe left -> next
      if (activeIndex.value < images.value.length - 1) activeIndex.value += 1;
    } else {
      // swipe right -> prev
      if (activeIndex.value > 0) activeIndex.value -= 1;
    }
  }
  touchDeltaX = 0;
}
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <!-- <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'Projects & Programmes', href: '/projects' },
        { text: projectName, href: basePath },
        { text: 'Research & Publications', href: `${basePath}/research` },
      ]"
      :page-title="item?.title ? item.title : projectName + ' — Research & Publications'"
    /> -->

    <!-- <div class="w-full sticky top-0 z-20 bg-white/95 backdrop-blur">
      <nav class="max-w-6xl flex items-center gap-2 px-25 overflow-x-auto hide-scrollbar">
        <NuxtLink
          v-for="t in tabs"
          :key="t.key"
          :to="t.to"
          class="px-4 py-3 text-base font-semibold whitespace-nowrap"
          :class="
            isActive(t.to)
              ? 'bg-green-100 text-green-900 border-b-2 border-green-700'
              : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
          "
        >
          {{ t.label }}
        </NuxtLink>
      </nav>
    </div> -->
    <!-- <ProjectNavbar :project="project" :slug="String(slug)" /> -->

    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-8">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div class="md:col-span-8 mr-4 md:mr-12">
          <div
            v-if="status === 'pending'"
            class="space-y-4 h-120 max-w-full"
            aria-busy="true"
            aria-live="polite"
          >
            <div class="flex items-center justify-center py-6">
              <svg
                class="animate-spin h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span class="sr-only">Loading</span>
            </div>

            <div class="animate-pulse space-y-4">
              <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-0" />
              <div class="w-full h-64 md:h-72 bg-gray-200 dark:bg-gray-700 rounded-lg" />

              <div class="flex items-center gap-2">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 ml-auto" />
              </div>

              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />

              <div class="space-y-2">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
              </div>

              <div class="mt-4 w-36 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div v-if="item">
            <h1 class="text-2xl md:text-3xl font-display font-semibold mb-2">{{ item.title }}</h1>
            <div
              v-if="images.length > 1"
              class="w-full h-64 md:h-72 rounded-lg overflow-hidden mb-5 relative"
            >
              <!-- track -->
              <div
                class="h-full flex transition-transform duration-300 ease-out"
                :style="{
                  width: `${images.length * 100}%`,
                  transform: `translateX(-${activeIndex * (100 / images.length)}%)`,
                }"
                @touchstart.passive="onTouchStart"
                @touchmove.passive="onTouchMove"
                @touchend.passive="onTouchEnd"
                @mousedown.prevent="onTouchStart"
                @mousemove.prevent="onTouchMove"
                @mouseup.prevent="onTouchEnd"
              >
                <div v-for="(src, i) in images" :key="i" class="flex-none w-full h-full">
                  <img :src="src" :alt="item.title" class="w-full h-full object-cover" />
                </div>
              </div>

              <!-- indicators: dots + index -->
              <div
                class="absolute left-0 right-0 bottom-2 flex items-center justify-center gap-3 pointer-events-none"
              >
                <div
                  class="flex items-center gap-2 pointer-events-auto bg-black/30 px-3 py-1 rounded-full"
                >
                  <div class="flex gap-2 items-center">
                    <button
                      v-for="(src, i) in images"
                      :key="i"
                      class="w-2 h-2 rounded-full transition-all"
                      :class="i === activeIndex ? 'bg-white scale-150' : 'bg-white/60'"
                      aria-label="'Go to slide ' + (i+1)"
                      @click="goTo(i)"
                    />
                  </div>
                  <div class="text-xs text-white/90 ml-2 select-none">
                    {{ activeIndex + 1 }} / {{ images.length }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="item.imageCover?.url" class="w-full rounded-lg overflow-hidden mb-5">
              <img
                :src="item.imageCover?.url"
                :alt="item.title"
                class="w-full h-full object-cover"
              />
            </div>

            <div v-if="item.secondaryTitle" class="text-lg text-gray-700 font-display mb-2">
              {{ item.secondaryTitle }}
            </div>

            <div class="text-sm text-gray-600 flex flex-wrap items-center gap-2 mb-2">
              <span>{{ (item.authors || []).map((a) => a.name).join(' • ') }}</span>
            </div>
            <div class="text-sm text-gray-600 mb-4">
              <span>{{
                item.date
                  ? isNaN(new Date(item.date).getFullYear())
                    ? item.date
                    : new Date(item.date).getFullYear()
                  : ''
              }}</span>
            </div>
            <div v-if="item.publication_type?.type" class="text-sm mb-1">
              <span class="text-green-700 font-medium">{{ item.publication_type.type }}</span>
            </div>
            <div v-if="item.url && item.url !== '-'" class="mb-6">
              <NuxtLink :to="item.url" target="_blank" class="text-green-700 hover:underline">{{
                item.url
              }}</NuxtLink>
            </div>

            <h2 class="text-xl font-semibold mb-2">
              {{
                (item.publication_type?.type || '').toLowerCase() === 'policy brief'
                  ? 'Executive Summary'
                  : 'Abstract'
              }}
            </h2>
            <MDC :value="item.abstract" class="prose max-w-none text-gray-800 space-y-6" />

            <div v-if="item.file" class="mt-6">
              <a
                :href="item.file.url"
                target="_blank"
                class="inline-flex items-center gap-2 px-4 py-2 rounded bg-green-600 text-white"
              >
                View PDF
              </a>
            </div>
          </div>
        </div>

        <aside class="md:col-span-4">
          <h3 class="text-lg font-semibold mb-4">More Publications</h3>
          <div class="space-y-5">
            <NuxtLink
              v-for="m in more"
              :key="m.id"
              :to="`${basePath}/research/${m.id}`"
              class="group block"
            >
              <p class="text-sm text-green-700 group-hover:underline line-clamp-2">{{ m.title }}</p>
              <div class="text-xs text-gray-600">
                {{ (m.authors || []).map((a) => a.name).join(', ') }}
              </div>
              <div class="text-xs text-gray-500">{{ m.publication_type?.type }}</div>
            </NuxtLink>
          </div>
        </aside>
      </div>
    </section>
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
</style>
