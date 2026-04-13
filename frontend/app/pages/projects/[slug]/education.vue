<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from '#app';
import type { Project, EducationTraining, StrapiMedia } from '~~/types/content';

// Route + derived project name
const route = useRoute();
const slug = route.params.slug;
const project = useState<Project | null>(`project:${slug}`, () => null);
const projectName = computed(() => project.value?.shortTitle || 'Project');

useHead({
  title: projectName.value
    ? `${projectName.value} — Education & Training`
    : 'Education & Training — LUCCC',
});

// Use shared project navbar
const basePath = computed(() => `/projects/${slug}`);
const hasChild = computed(() => Boolean(route.params.id));

// Fetch education/trainings for this project
const { data: eduData } = await useAsyncData(
  () => `education-trainings:${slug}`,
  () => $fetch('/api/education-trainings', { params: { projectSlug: String(slug) } })
);
const items = computed(() => (eduData.value ?? []).filter((e) => !e.lla));

// Carousel items for education
type CarouselItem = {
  id: string;
  title: string;
  description: string;
  cover: string | StrapiMedia | null | undefined;
  type: 'research' | 'outreach' | 'education';
  slug: string;
};

function excerpt(text?: string | null, n = 140) {
  if (!text) return '';
  const t = String(text);
  return t.length > n ? t.slice(0, n) + '…' : t;
}

const carouselItems = computed<CarouselItem[]>(() => {
  const list = Array.isArray(items.value) ? items.value : [];
  return list
    .filter((e) => Boolean(e.cover && e.cover.url))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((e) => ({
      id: String(e.documentId || e.id),
      title: e.title,
      description: excerpt(e.body, 140),
      cover: e.cover,
      slug: basePath.value,
      type: 'education' as const,
    }));
});

// Group items by section
const moduleDevelopment = computed(() =>
  items.value.filter((item: EducationTraining) => item.section === 'module development')
);
const shortCourse = computed(() =>
  items.value.filter((item: EducationTraining) => item.section === 'short course')
);
const trainingWorkshop = computed(() =>
  items.value.filter((item: EducationTraining) => item.section === 'training workshop')
);
const generalEducation = computed(() =>
  items.value.filter((item: EducationTraining) => !item.section || item.section === null)
);

// Pagination for each section
const pageSize = 6;

// Module Development pagination
const moduleDevPage = ref(1);
const moduleDevTotalPages = computed(() =>
  Math.max(1, Math.ceil(moduleDevelopment.value.length / pageSize))
);
const moduleDevVisible = computed(() => {
  const start = (moduleDevPage.value - 1) * pageSize;
  return moduleDevelopment.value.slice(start, start + pageSize);
});

// Short Course pagination
const shortCoursePage = ref(1);
const shortCourseTotalPages = computed(() =>
  Math.max(1, Math.ceil(shortCourse.value.length / pageSize))
);
const shortCourseVisible = computed(() => {
  const start = (shortCoursePage.value - 1) * pageSize;
  return shortCourse.value.slice(start, start + pageSize);
});

// Training Workshop pagination
const trainingWorkshopPage = ref(1);
const trainingWorkshopTotalPages = computed(() =>
  Math.max(1, Math.ceil(trainingWorkshop.value.length / pageSize))
);
const trainingWorkshopVisible = computed(() => {
  const start = (trainingWorkshopPage.value - 1) * pageSize;
  return trainingWorkshop.value.slice(start, start + pageSize);
});

// General Education & Training pagination
const generalEduPage = ref(1);
const generalEduTotalPages = computed(() =>
  Math.max(1, Math.ceil(generalEducation.value.length / pageSize))
);
const generalEduVisible = computed(() => {
  const start = (generalEduPage.value - 1) * pageSize;
  return generalEducation.value.slice(start, start + pageSize);
});

function goToPage(
  page: number,
  section: 'moduleDev' | 'shortCourse' | 'trainingWorkshop' | 'generalEdu'
) {
  if (section === 'moduleDev' && page >= 1 && page <= moduleDevTotalPages.value) {
    moduleDevPage.value = page;
  } else if (section === 'shortCourse' && page >= 1 && page <= shortCourseTotalPages.value) {
    shortCoursePage.value = page;
  } else if (
    section === 'trainingWorkshop' &&
    page >= 1 &&
    page <= trainingWorkshopTotalPages.value
  ) {
    trainingWorkshopPage.value = page;
  } else if (section === 'generalEdu' && page >= 1 && page <= generalEduTotalPages.value) {
    generalEduPage.value = page;
  }
}
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <NuxtPage v-if="hasChild" />
    <template v-else>
      <!-- Breadcrumb -->
      <!-- <BreadCrumb
        :breadcrumb-items="[
          { text: 'Home', href: '/' },
          { text: 'Projects & Programmes', href: '/projects' },
          { text: projectName, href: basePath },
          { text: 'Education & Training', href: '' },
        ]"
        :page-title="projectName + ' — Education & Training'"
      /> -->

      <!-- Secondary navbar (links to sibling pages) -->
      <!-- <ProjectNavbar :project="project" :slug="String(slug)" /> -->

      <!-- Carousel -->
      <section v-if="carouselItems.length" class="w-full mx-auto px-0 md:px-0">
        <ResearchOutreachCarousel :items="carouselItems" />
      </section>

      <section class="w-full max-w-6xl mx-auto py-10 px-4 md:px-0">
        <!-- Education & Training Section (items with no section or null) -->
        <!-- Module Development Section -->
        <div v-if="moduleDevelopment.length > 0" class="mb-16">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Module Development</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <article
              v-for="card in moduleDevVisible"
              :key="card.id"
              class="border border-gray-200 rounded-md overflow-hidden bg-white hover:shadow transition-shadow"
            >
              <NuxtLink :to="`${basePath}/education/${card.documentId || card.id}`" class="block">
                <div class="h-44 w-full overflow-hidden">
                  <img
                    :src="card.cover?.url"
                    :alt="card.title"
                    class="w-full h-full object-cover"
                  >
                </div>
                <div class="p-4">
                  <h3 class="text-[15px] font-semibold text-green-800 mb-1">
                    {{ card.title }}
                  </h3>
                  <p class="text-sm text-gray-700 line-clamp-3 mb-4">{{ card.body }}</p>
                  <div v-if="card.type?.type" class="flex items-center gap-2">
                    <span
                      class="inline-block text-xs px-2 py-1 rounded border border-green-200 text-green-700 bg-green-50"
                    >
                      {{ card.type.type }}
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </article>
          </div>

          <!-- Pagination for Module Development -->
          <div v-if="moduleDevTotalPages > 1" class="mt-10 flex items-center justify-center gap-2">
            <button
              v-for="page in moduleDevTotalPages"
              :key="page"
              :aria-current="page === moduleDevPage ? 'true' : 'false'"
              class="min-w-[32px] h-7 px-2 text-sm rounded border"
              :class="
                page === moduleDevPage
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-800 border-gray-300'
              "
              @click="goToPage(page, 'moduleDev')"
            >
              {{ page }}
            </button>
          </div>
        </div>

        <!-- Short Course Section -->
        <div v-if="shortCourse.length > 0" class="mb-16">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Short Courses</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <article
              v-for="card in shortCourseVisible"
              :key="card.id"
              class="border border-gray-200 rounded-md overflow-hidden bg-white hover:shadow transition-shadow"
            >
              <NuxtLink :to="`${basePath}/education/${card.documentId || card.id}`" class="block">
                <div class="h-44 w-full overflow-hidden">
                  <img
                    :src="card.cover?.url"
                    :alt="card.title"
                    class="w-full h-full object-cover"
                  >
                </div>
                <div class="p-4">
                  <h3 class="text-[15px] font-semibold text-green-800 mb-1">
                    {{ card.title }}
                  </h3>
                  <p class="text-sm text-gray-700 line-clamp-3 mb-4">{{ card.body }}</p>
                  <div v-if="card.type?.type" class="flex items-center gap-2">
                    <span
                      class="inline-block text-xs px-2 py-1 rounded border border-green-200 text-green-700 bg-green-50"
                    >
                      {{ card.type.type }}
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </article>
          </div>

          <!-- Pagination for Short Course -->
          <div
            v-if="shortCourseTotalPages > 1"
            class="mt-10 flex items-center justify-center gap-2"
          >
            <button
              v-for="page in shortCourseTotalPages"
              :key="page"
              :aria-current="page === shortCoursePage ? 'true' : 'false'"
              class="min-w-[32px] h-7 px-2 text-sm rounded border"
              :class="
                page === shortCoursePage
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-800 border-gray-300'
              "
              @click="goToPage(page, 'shortCourse')"
            >
              {{ page }}
            </button>
          </div>
        </div>

        <!-- Training Workshop Section -->
        <div v-if="trainingWorkshop.length > 0" class="mb-16">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Training Workshops</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <article
              v-for="card in trainingWorkshopVisible"
              :key="card.id"
              class="border border-gray-200 rounded-md overflow-hidden bg-white hover:shadow transition-shadow"
            >
              <NuxtLink :to="`${basePath}/education/${card.documentId || card.id}`" class="block">
                <div class="h-44 w-full overflow-hidden">
                  <img
                    :src="card.cover?.url"
                    :alt="card.title"
                    class="w-full h-full object-cover"
                  >
                </div>
                <div class="p-4">
                  <h3 class="text-[15px] font-semibold text-green-800 mb-1">
                    {{ card.title }}
                  </h3>
                  <p class="text-sm text-gray-700 line-clamp-3 mb-4">{{ card.body }}</p>
                  <div v-if="card.type?.type" class="flex items-center gap-2">
                    <span
                      class="inline-block text-xs px-2 py-1 rounded border border-green-200 text-green-700 bg-green-50"
                    >
                      {{ card.type.type }}
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </article>
          </div>

          <!-- Pagination for Training Workshop -->
          <div
            v-if="trainingWorkshopTotalPages > 1"
            class="mt-10 flex items-center justify-center gap-2"
          >
            <button
              v-for="page in trainingWorkshopTotalPages"
              :key="page"
              :aria-current="page === trainingWorkshopPage ? 'true' : 'false'"
              class="min-w-[32px] h-7 px-2 text-sm rounded border"
              :class="
                page === trainingWorkshopPage
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-800 border-gray-300'
              "
              @click="goToPage(page, 'trainingWorkshop')"
            >
              {{ page }}
            </button>
          </div>
        </div>

        <!-- Others section -->
        <div v-if="generalEducation.length > 0" class="mb-16">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Others</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <article
              v-for="card in generalEduVisible"
              :key="card.id"
              class="border border-gray-200 rounded-md overflow-hidden bg-white hover:shadow transition-shadow"
            >
              <NuxtLink :to="`${basePath}/education/${card.documentId || card.id}`" class="block">
                <div class="h-44 w-full overflow-hidden">
                  <img
                    :src="card.cover?.url"
                    :alt="card.title"
                    class="w-full h-full object-cover"
                  >
                </div>
                <div class="p-4">
                  <h3 class="text-[15px] font-semibold text-green-800 mb-1">
                    {{ card.title }}
                  </h3>
                  <p class="text-sm text-gray-700 line-clamp-3 mb-4">{{ card.body }}</p>
                  <div v-if="card.type?.type" class="flex items-center gap-2">
                    <span
                      class="inline-block text-xs px-2 py-1 rounded border border-green-200 text-green-700 bg-green-50"
                    >
                      {{ card.type.type }}
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </article>
          </div>

          <!-- Pagination for General Education -->
          <div v-if="generalEduTotalPages > 1" class="mt-10 flex items-center justify-center gap-2">
            <button
              v-for="page in generalEduTotalPages"
              :key="page"
              :aria-current="page === generalEduPage ? 'true' : 'false'"
              class="min-w-[32px] h-7 px-2 text-sm rounded border"
              :class="
                page === generalEduPage
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-800 border-gray-300'
              "
              @click="goToPage(page, 'generalEdu')"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
