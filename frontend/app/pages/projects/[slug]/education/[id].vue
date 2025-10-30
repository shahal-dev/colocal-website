<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from '#app';
import type { Project } from '~~/types/content';

const route = useRoute();
const slug = route.params.slug;
const id = Number(route.params.id);
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

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

// Fetch current education/training and more for sidebar
const { data: current } = await useAsyncData(
  () => `education-training:${slug}:${id}`,
  () =>
    $fetch('/api/education-trainings', { params: { projectSlug: String(slug), id: String(id) } })
);
const item = computed(() => (current.value && current.value[0]) || null);

useHead({
  title: item.value?.title
    ? `${item.value.title} — ${projectName.value} Education & Training`
    : `${projectName.value} — Education & Training`,
});

const coverUrl = computed(() => {
  const cover = item.value?.cover?.url ?? '';
  return cover?.trim?.() ?? '';
});

const carouselImages = computed(() => {
  const extras: string[] = [];
  if (Array.isArray(item.value?.images)) {
    for (const entry of item.value.images) {
      if (!entry) continue;
      const candidate = typeof entry === 'string' ? entry : entry.url;
      const normalized = candidate?.trim?.() ?? '';
      if (!normalized || extras.includes(normalized)) continue;
      extras.push(normalized);
    }
  }

  if (!extras.length) {
    return [];
  }

  const urls: string[] = [];
  const seen = new Set<string>();
  const cover = coverUrl.value;
  if (cover) {
    seen.add(cover);
    urls.push(cover);
  }

  for (const img of extras) {
    if (seen.has(img)) continue;
    seen.add(img);
    urls.push(img);
  }

  return urls;
});

const secondaryTitle = computed(() => {
  const raw = item.value?.secondaryTitle;
  return typeof raw === 'string' ? raw.trim() : '';
});

const authorLine = computed(() => {
  const source = item.value as Record<string, unknown> | null;
  if (source) {
    const rawAuthors = source.authors as unknown;
    if (Array.isArray(rawAuthors)) {
      const names = rawAuthors
        .map((entry) => {
          if (typeof entry === 'string') return entry;
          if (entry && typeof entry === 'object' && 'name' in entry) {
            const name = (entry as Record<string, unknown>).name;
            return typeof name === 'string' ? name : '';
          }
          return '';
        })
        .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
        .map((name) => name.trim());
      if (names.length) return names.join(' • ');
    }

    for (const key of ['author', 'authorName', 'byline']) {
      const value = source[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
  }

  return '';
});

const { data: moreList } = await useAsyncData(
  () => `education-trainings-more:${slug}`,
  () => $fetch('/api/education-trainings', { params: { projectSlug: String(slug) } })
);
const more = computed(() => (moreList.value || []).filter((n) => n.id !== id).slice(0, 6));

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <!-- <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'Projects & Programmes', href: '/projects' },
        { text: projectName, href: basePath },
        { text: 'Education & Training', href: `${basePath}/education` },
      ]"
      :page-title="item?.title ? item.title : projectName + ' — Education & Training'"
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
        <div class="md:col-span-8">
          <div v-if="item">
            <div v-if="carouselImages.length" class="mb-5">
              <GalleryCarousel :images="carouselImages" :title="item.title" />
            </div>
            <div
              v-else-if="coverUrl"
              class="w-full h-[24rem] md:h-[30rem] rounded-lg overflow-hidden mb-5"
            >
              <img :src="coverUrl" :alt="item.title" class="w-full h-full object-cover" />
            </div>

            <h1 class="text-2xl md:text-3xl font-display font-semibold mb-2">{{ item.title }}</h1>
            <div v-if="secondaryTitle" class="text-lg text-gray-700 font-display mb-2">
              {{ secondaryTitle }}
            </div>
            <div v-if="authorLine" class="text-sm text-gray-600 flex items-center gap-2 mb-2">
              {{ authorLine }}
            </div>
            <div class="text-sm text-gray-600 flex items-center gap-2 mb-4">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                  stroke-width="2"
                />
              </svg>
              <span>{{ formatDate(item.date) }}</span>
            </div>
            <MDC :value="item.body" class="mdc-body prose max-w-none text-gray-800 space-y-6" />
          </div>
        </div>

        <aside class="md:col-span-4">
          <h3 class="text-lg font-semibold mb-4">More Activities</h3>
          <div class="space-y-4">
            <NuxtLink
              v-for="m in more"
              :key="m.id"
              :to="`${basePath}/education/${m.id}`"
              class="flex gap-3 items-center group"
            >
              <div class="w-20 h-14 rounded overflow-hidden flex-shrink-0">
                <img :src="m.cover?.url" :alt="m.title" class="w-full h-full object-cover">
              </div>
              <div class="min-w-0">
                <p
                  class="text-sm text-green-700 group-hover:underline"
                  style="
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                  "
                >
                  {{ m.title }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
:deep(.mdc-body a) {
  color: rgb(4 120 87);
  font-weight: 500;
  text-decoration: none;
  transition: text-decoration-color 0.15s ease;
}

:deep(.mdc-body a:hover),
:deep(.mdc-body a:focus-visible) {
  text-decoration: underline;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
