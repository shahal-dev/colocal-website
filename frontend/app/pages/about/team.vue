<script setup lang="ts">
import { ref, computed } from 'vue';

useHead({
  title: 'Our Team — LUCCC',
});

// Minimal media and author shapes for this page
type StrapiImageFormat = {
  url: string;
  width?: number;
  height?: number;
};
type StrapiMedia = {
  id: number;
  url: string;
  formats?: Record<string, StrapiImageFormat>;
};
type Author = {
  id: number;
  name: string;
  title?: string | null;
  avatar: StrapiMedia | null;
  country?: string;
  admin?: boolean;
};

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
  return { id, name, title, avatar };
}

// Fetch Team single (about, cover, lead)
type TeamSingle = { about?: string; cover?: unknown; lead?: unknown };
const { data: teamSingle, error: teamError } = await useAsyncData<TeamSingle>(
  'team-single',
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

// Fetch team members (authors where team == true)
type MembersRes = { data: unknown[] };
const { data: membersRes, error: membersError } = await useAsyncData<MembersRes>(
  'team-members',
  async () => {
    const res: unknown = await $fetch(`${strapiUrl}/api/authors`, {
      headers,
      query: {
        'filters[team][$eq]': 'true',
        'pagination[pageSize]': '200',
        sort: 'name:asc',
        populate: 'avatar',
      },
    });
    const r = isRecord(res) ? (res as Record<string, unknown>) : {};
    const dataVal = 'data' in r ? (r.data as unknown) : undefined;
    const data = Array.isArray(dataVal) ? dataVal : [];
    return { data } as MembersRes;
  }
);

if (membersError?.value) {
  console.error('Failed to fetch team members:', membersError.value);
}

const aboutText = computed(() => teamSingle.value?.about || '');
const coverMedia = computed(() => mapMedia(teamSingle.value?.cover || null));
const leadAuthor = computed<Author | null>(() => mapAuthor(teamSingle.value?.lead || null));

const members = computed<Author[]>(() => {
  const arr = membersRes.value?.data || [];
  return arr.map((item: unknown) => mapAuthor(item)).filter((a: Author | null): a is Author => !!a);
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

// Fetch colocal members using our new API endpoint
const { data: colocalMembersData, error: colocalMembersError } = await useAsyncData<{
  data: Author[];
}>('colocal-team-members', async () => {
  return await $fetch('/api/authors', {
    query: {
      colocal: 'true',
      pageSize: '200',
      sort: 'name:asc',
    },
  });
});

if (colocalMembersError?.value) {
  console.error('Failed to fetch colocal team members:', colocalMembersError.value);
}

const colocalMembers = computed<Author[]>(() => {
  return colocalMembersData.value?.data || [];
});

// Group members by country
const countriesWithMembers = computed(() => {
  const countries = ['norway', 'bangladesh', 'mozambique', 'nepal', 'uganda'] as const;
  return countries
    .map((country) => {
      const countryMembers = colocalMembers.value.filter((m) => m.country === country);
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
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'About Us', href: '/about' },
        { text: 'Our Team', href: '/about/team' },
      ]"
      page-title="Our Team"
    />

    <!-- Team Members Section: separate background and padding for consistent components -->
    <section class="w-full bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 class="text-center text-xl sm:text-2xl md:text-[28px] font-display font-medium">
          Team Members: LUCCC
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

    <!-- COLOCAL Team Members Section -->
    <section class="w-full bg-white border-t border-gray-200">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 class="text-center text-xl sm:text-2xl md:text-[28px] font-display font-medium mb-10">
          Team Members: COLOCAL
        </h2>

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
                <p v-if="admin.title" class="m-0 text-xs sm:text-sm text-gray-600">
                  {{ admin.title }}
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
                <p v-if="fellow.title" class="m-0 text-xs sm:text-sm text-gray-600">
                  {{ fellow.title }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
