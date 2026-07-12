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
// const basePath = computed(() => `/projects/${slug.value}`);

useHead({
  title: projectName.value ? `${projectName.value} — Our Team` : 'Our Team',
});

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

// Fetch Team single (about, cover, lead)
type TeamSingle = { about?: string; cover?: unknown; lead?: unknown };
const { data: teamSingle, error: teamError } = await useAsyncData<TeamSingle | null>(
  `team-single-${slug.value}`,
  async () => {
    try {
      const res: unknown = await $fetch(`${strapiUrl}/api/team`, {
        headers,
        query: {
          'populate[0]': 'cover',
          'populate[1]': 'lead',
          'populate[2]': 'lead.avatar',
        },
      });
      const r = isRecord(res) ? (res as Record<string, unknown>) : {};
      const d = ('data' in r ? (r.data as unknown) : res) as unknown;
      if (isRecord(d) && 'attributes' in d && isRecord((d as Record<string, unknown>).attributes)) {
        return (d as Record<string, unknown>).attributes as TeamSingle;
      }
      return d as TeamSingle;
    } catch (e: unknown) {
      // Strapi returns 404 for missing/unpublished single types; skip silently on project pages.
      const status =
        typeof e === 'object' && e !== null && 'status' in e
          ? (e as { status?: unknown }).status
          : undefined;
      if (status === 404) return null;
      throw e;
    }
  }
);

if (teamError?.value) {
  const status = (teamError.value as unknown as { status?: number } | null)?.status;
  if (status === 404) {
    console.warn('Team single not found (404); skipping on project team page.');
  } else {
    console.error('Failed to fetch Team single:', teamError.value);
  }
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

const members = computed<Author[]>(() => {
  return membersData.value?.data || [];
});

// Group members by country
const countriesWithMembers = computed(() => {
  const countries = ['norway', 'bangladesh', 'mozambique', 'nepal', 'uganda'] as const;
  return countries
    .map((country) => {
      const countryMembers = members.value.filter((m) => m.country === country);
      const admins = countryMembers.filter((m) => m.admin);
      const fellows = countryMembers.filter((m) => !m.admin);

      // Sort admins alphabetically
      const sortedAdmins = admins.sort((a, b) => a.name.localeCompare(b.name));

      // Sort fellows alphabetically
      const sortedFellows = fellows.sort((a, b) => a.name.localeCompare(b.name));

      return {
        country,
        displayName: country.toUpperCase(),
        flagUrl: `https://flagcdn.com/w320/${getCountryCode(country)}.png`,
        members: countryMembers,
        admins: sortedAdmins,
        fellows: sortedFellows,
      };
    })
    .filter((c) => c.members.length > 0)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
});

function getCountryCode(country: string): string {
  const codes: Record<string, string> = {
    norway: 'no',
    bangladesh: 'bd',
    mozambique: 'mz',
    nepal: 'np',
    uganda: 'ug',
  };
  return codes[country] || '';
}

// Carousel state
const activeCountryIndex = ref(0);
const activeCountry = computed(() => countriesWithMembers.value[activeCountryIndex.value]);

function selectCountry(index: number) {
  activeCountryIndex.value = index;
}
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center bg-white">
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
              <img
                src="~/assets/images/colocal-about.jpeg"
                alt="CoLocal Logo"
                class="w-auto object-contain"
              />
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- Team Members Section: separate background and padding for consistent components -->
    <section class="w-full bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <!-- Country Navigation -->
        <div v-if="countriesWithMembers.length > 0" class="mb-10">
          <div class="flex flex-wrap justify-center gap-4">
            <button
              v-for="(countryData, index) in countriesWithMembers"
              :key="countryData.country"
              class="flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:shadow-md"
              :class="
                index === activeCountryIndex
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-300 bg-white hover:border-green-300'
              "
              @click="selectCountry(index)"
            >
              <div class="w-20 h-14 flex items-center justify-center overflow-hidden rounded">
                <img
                  :src="countryData.flagUrl"
                  :alt="`${countryData.displayName} Flag`"
                  class="max-w-full max-h-full object-contain"
                />
              </div>
              <span class="text-sm font-semibold text-gray-700">
                {{ countryData.displayName }}
              </span>
            </button>
          </div>
        </div>

        <!-- Carousel Content -->
        <div v-if="activeCountry" class="transition-all duration-300">
          <h2
            class="text-center text-xl sm:text-2xl md:text-[28px] font-display font-semibold mb-8"
          >
            COLOCAL Team: {{ activeCountry.displayName }}
          </h2>

          <!-- Administrators Section -->
          <div v-if="activeCountry.admins.length > 0" class="mb-12">
            <h3 class="text-lg font-semibold text-gray-800 mb-6 text-center">Administrators</h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div
                v-for="admin in activeCountry.admins"
                :key="admin.id"
                class="bg-blue-gray-50 border border-gray-200 rounded-md p-4 sm:p-6 flex flex-col items-center text-center"
              >
                <template v-if="admin.avatar?.url">
                  <img
                    :src="admin.avatar?.url"
                    :alt="admin.name"
                    class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover mb-3"
                  />
                </template>
                <template v-else>
                  <div
                    class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3 text-gray-500"
                  >
                    <img src="~/assets/user.png" alt="Authors" class="w-8 h-8 mr-1" />
                  </div>
                </template>
                <p class="m-0 font-medium text-gray-900 text-sm sm:text-base">{{ admin.name }}</p>
                <p
                  v-for="t in admin.titles"
                  :key="t"
                  class="m-0 text-xs sm:text-sm text-gray-600"
                >
                  {{ t }}
                </p>
              </div>
            </div>
          </div>

          <!-- Research Fellows Section -->
          <div v-if="activeCountry.fellows.length > 0">
            <h3 class="text-lg font-semibold text-gray-800 mb-6 text-center">Research Fellows</h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div
                v-for="fellow in activeCountry.fellows"
                :key="fellow.id"
                class="bg-blue-gray-50 border border-gray-200 rounded-md p-4 sm:p-6 flex flex-col items-center text-center"
              >
                <template v-if="fellow.avatar?.url">
                  <img
                    :src="fellow.avatar?.url"
                    :alt="fellow.name"
                    class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover mb-3"
                  />
                </template>
                <template v-else>
                  <div
                    class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3 text-gray-500"
                  >
                    <img src="~/assets/user.png" alt="Authors" class="w-8 h-8 mr-1" />
                  </div>
                </template>
                <p class="m-0 font-medium text-gray-900 text-sm sm:text-base">
                  {{ fellow.name }}
                </p>
                <p
                  v-for="t in fellow.titles"
                  :key="t"
                  class="m-0 text-xs sm:text-sm text-gray-600"
                >
                  {{ t }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
