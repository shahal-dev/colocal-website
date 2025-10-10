<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Project, Author, StrapiMedia, StrapiImageFormat } from '~~/types/content';

const route = useRoute();
const slug = computed(() => {
  const param = route.params.slug;
  if (typeof param === 'string') return param;
  if (Array.isArray(param)) return param[0] ?? '';
  return '';
});

// Get project from shared state
const projectState = computed<Project | null>(() => {
  if (!slug.value) return null;
  return useState<Project | null>(`project:${slug.value}`, () => null).value;
});
const projectName = computed(() => projectState.value?.shortTitle || 'Project');
const basePath = computed(() => `/projects/${slug.value}`);

const config = useRuntimeConfig();
const headers: Record<string, string> = {};

function getDeep(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (!isRecord(cur) || !(key in (cur as Record<string, unknown>))) return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

const strapiUrlRaw = getDeep(config, ['strapi', 'url']) ?? getDeep(config, ['public', 'strapiUrl']);
const strapiUrl = typeof strapiUrlRaw === 'string' ? strapiUrlRaw : 'http://localhost:1337';
const tokenRaw = getDeep(config, ['strapi', 'token']);
const token = typeof tokenRaw === 'string' ? tokenRaw : '';
if (token) headers.Authorization = `Bearer ${token}`;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function absUrl(url?: string | null): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('//')) return url;
  return `${strapiUrl}${url}`;
}

function mapMedia(m: unknown): StrapiMedia | null {
  if (!m || !isRecord(m)) return null;
  // Handle flat vs raw ({ data: { attributes } })
  const data = 'data' in m && isRecord(m.data) ? (m.data as Record<string, unknown>) : m;
  const attrs =
    'attributes' in data && isRecord((data as Record<string, unknown>).attributes)
      ? ((data as Record<string, unknown>).attributes as Record<string, unknown>)
      : (data as Record<string, unknown>);
  const url = typeof attrs.url === 'string' ? attrs.url : undefined;
  if (!url) return null;
  const fmts = (attrs.formats as Record<string, unknown> | undefined) || {};
  const mappedFormats: Record<string, StrapiImageFormat> = {};
  for (const key of Object.keys(fmts)) {
    const fmt = fmts[key] as Record<string, unknown> | undefined;
    const fUrl = fmt && typeof fmt.url === 'string' ? fmt.url : undefined;
    if (fUrl)
      mappedFormats[key] = {
        url: absUrl(fUrl),
        width: typeof fmt?.width === 'number' ? (fmt.width as number) : undefined,
        height: typeof fmt?.height === 'number' ? (fmt.height as number) : undefined,
      };
  }
  const id =
    typeof (data as Record<string, unknown>).id === 'number'
      ? ((data as Record<string, unknown>).id as number)
      : 0;
  return { id, url: absUrl(url), formats: mappedFormats };
}

function mapAuthor(a: unknown): Author | null {
  if (!a || !isRecord(a)) return null;
  // Accept raw relation, flat object, or id-only (ignored for display)
  const ent = 'data' in a && isRecord(a.data) ? (a.data as Record<string, unknown>) : a;
  const attrs =
    'attributes' in ent && isRecord((ent as Record<string, unknown>).attributes)
      ? ((ent as Record<string, unknown>).attributes as Record<string, unknown>)
      : (ent as Record<string, unknown>);
  const name =
    typeof attrs.name === 'string'
      ? (attrs.name as string)
      : typeof (ent as Record<string, unknown>).name === 'string'
        ? ((ent as Record<string, unknown>).name as string)
        : undefined;
  if (!name) return null;
  const id =
    typeof (ent as Record<string, unknown>).id === 'number'
      ? ((ent as Record<string, unknown>).id as number)
      : 0;
  const title =
    attrs.title == null || typeof attrs.title === 'string' ? (attrs.title as string | null) : null;
  const avatar = mapMedia(
    (attrs as Record<string, unknown>).avatar ?? (ent as Record<string, unknown>).avatar ?? null
  );
  return {
    id,
    name,
    title,
    avatar,
    email: null,
    research_publications: null,
    colocal: true,
  };
}

// Fetch Team single (about, cover, lead) - we'll reuse the same team single-type
type TeamSingle = { about?: string; cover?: unknown; lead?: unknown };
const { data: teamSingle, error: teamError } = await useAsyncData<TeamSingle>(
  `team-single-${slug.value}`,
  async () => {
    const res: unknown = await $fetch(`${strapiUrl}/api/team`, {
      headers,
      query: {
        // Use array populate syntax compatible across Strapi versions
        'populate[0]': 'cover',
        'populate[1]': 'lead',
        'populate[2]': 'lead.avatar',
      },
    });
    // v4 raw vs v5 flat
    const r = isRecord(res) ? (res as Record<string, unknown>) : {};
    const d = ('data' in r ? (r.data as unknown) : res) as unknown;
    if (isRecord(d) && 'attributes' in d && isRecord((d as Record<string, unknown>).attributes)) {
      return (d as Record<string, unknown>).attributes as TeamSingle;
    }
    return d as TeamSingle;
  }
);

if (teamError?.value) {
  // Log but don't break the page
  console.error('Failed to fetch Team single:', teamError.value);
}

// Fetch team members using our new API endpoint
const { data: membersData, error: membersError } = await useAsyncData<{ data: Author[] }>(
  `team-members-${slug.value}`,
  async () => {
    return await $fetch('/api/authors', {
      query: {
        colocal: 'true',
        pageSize: '200',
        sort: 'name:asc',
      },
    });
  }
);

if (membersError?.value) {
  console.error('Failed to fetch team members:', membersError.value);
}

const aboutText = computed(() => teamSingle.value?.about || '');
const coverMedia = computed(() => mapMedia(teamSingle.value?.cover || null));
const leadAuthor = computed<Author | null>(() => mapAuthor(teamSingle.value?.lead || null));

const members = computed<Author[]>(() => {
  return membersData.value?.data || [];
});

// Pagination
const pageSize = 12; // 3 rows x 4 columns
const currentPage = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(members.value.length / pageSize)));
const pagedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return members.value.slice(start, start + pageSize);
});

function goTo(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center bg-white">
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'Projects', href: '/projects' },
        { text: projectName, href: basePath },
        { text: 'Our Team', href: `${basePath}/team` },
      ]"
      page-title="Our Team"
    />

    <!-- Hero / Intro Section: own background and padding -->
    <section class="w-full bg-blue-gray-50">
      <div
        class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
      >
        <div>
          <p class="text-sm font-semibold text-green-700 mb-2">
            Meet the Minds Behind {{ projectName }}
          </p>
          <h1
            class="text-2xl sm:text-3xl md:text-[32px] leading-tight font-display font-semibold mb-4"
          >
            Our Team: Driving Climate Action Through Collaboration
          </h1>
          <p class="text-gray-700 text-sm sm:text-base leading-relaxed">{{ aboutText }}</p>
        </div>

        <div>
          <template v-if="coverMedia?.url">
            <img
              :src="coverMedia?.url"
              alt="Team"
              class="w-full h-56 sm:h-72 md:h-96 object-cover rounded"
            />
          </template>
          <template v-else>
            <div
              class="w-full h-56 sm:h-72 md:h-96 rounded bg-gray-200 flex items-center justify-center text-gray-500"
            >
              <svg class="w-14 h-14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path
                  d="M21 19V5a2 2 0 0 0-2-2H5C3.897 3 3 3.897 3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 5h14v9l-3.586-3.586a2 2 0 0 0-2.828 0L9 14l-2-2-2 2V5z"
                />
              </svg>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- Team Members Section: separate background and padding for consistent components -->
    <section class="w-full bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 class="text-center text-xl sm:text-2xl md:text-[28px] font-display font-medium">
          Team Members
        </h2>

        <!-- Lead -->
        <div v-if="leadAuthor" class="mt-6 text-center">
          <p class="text-sm font-semibold text-gray-700 mb-4">Lead</p>
          <div
            class="mx-auto max-w-sm bg-blue-gray-50 border border-gray-200 rounded-md p-4 sm:p-6 flex flex-col items-center"
          >
            <template v-if="leadAuthor.avatar?.url">
              <img
                :src="leadAuthor.avatar?.url"
                :alt="leadAuthor.name"
                class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover mb-3"
              />
            </template>
            <template v-else>
              <div
                class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gray-200 flex items-center justify-center mb-3 text-gray-500"
              >
                <svg class="w-10 h-10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path
                    d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-3.866 0-7 3.134-7 7 0 .552.448 1 1 1h12c.552 0 1-.448 1-1 0-3.866-3.134-7-7-7z"
                  />
                </svg>
              </div>
            </template>
            <p class="m-0 font-medium text-gray-900">{{ leadAuthor.name }}</p>
            <p v-if="leadAuthor.title" class="m-0 text-sm text-gray-600">
              {{ leadAuthor.title }}
            </p>
          </div>
        </div>

        <!-- Members -->
        <div class="mt-10">
          <p class="text-center text-sm font-semibold text-gray-700 mb-6">Members</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              v-for="m in pagedMembers"
              :key="m.id"
              class="bg-blue-gray-50 border border-gray-200 rounded-md p-4 sm:p-6 flex flex-col items-center text-center"
            >
              <template v-if="m.avatar?.url">
                <img
                  :src="m.avatar?.url"
                  :alt="m.name"
                  class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover mb-3"
                />
              </template>
              <template v-else>
                <div
                  class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3 text-gray-500"
                >
                  <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path
                      d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-3.866 0-7 3.134-7 7 0 .552.448 1 1 1h12c.552 0 1-.448 1-1 0-3.866-3.134-7-7-7z"
                    />
                  </svg>
                </div>
              </template>
              <p class="m-0 font-medium text-gray-900 text-sm sm:text-base">{{ m.name }}</p>
              <p v-if="m.title" class="m-0 text-xs sm:text-sm text-gray-600">{{ m.title }}</p>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
            <button
              v-for="page in totalPages"
              :key="page"
              :aria-current="page === currentPage ? 'true' : 'false'"
              class="min-w-[32px] h-7 px-2 text-sm rounded border"
              :class="
                page === currentPage
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-800 border-gray-300'
              "
              @click="goTo(page)"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
