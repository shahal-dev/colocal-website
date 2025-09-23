<script setup>
import { ref, computed } from 'vue';
import avatar1 from '~/assets/images/carousel-1.png';
import avatar2 from '~/assets/images/carousel-2.png';

// Lead
const lead = {
  name: 'Prof Mizan R Khan',
  role: 'Technical Lead',
  avatar: avatar2,
};

// Members (sample data). Replace with CMS data when available.
const members = [
  { id: 1, name: 'Prof Mizan R Khan', role: 'Technical Lead', avatar: avatar1 },
  { id: 2, name: 'Nadia Rahman', role: 'Research Lead', avatar: avatar2 },
  { id: 3, name: 'Ayesha Karim', role: 'Coordinator', avatar: avatar1 },
  { id: 4, name: 'Shahidul Alam', role: 'Program Officer', avatar: avatar2 },
  { id: 5, name: 'Farhana Akter', role: 'Analyst', avatar: avatar1 },
  { id: 6, name: 'Zahid Hasan', role: 'Analyst', avatar: avatar2 },
  { id: 7, name: 'Sumaiya Anjum', role: 'Program Officer', avatar: avatar1 },
  { id: 8, name: 'Tariq Ahmed', role: 'Researcher', avatar: avatar2 },
  { id: 9, name: 'Fahad Hossain', role: 'Coordinator', avatar: avatar1 },
  { id: 10, name: 'Sadia Noor', role: 'Communications', avatar: avatar2 },
  { id: 11, name: 'Imran Chowdhury', role: 'Researcher', avatar: avatar1 },
  { id: 12, name: 'Rafi Khan', role: 'Developer', avatar: avatar2 },
  { id: 13, name: 'Meherin Sultana', role: 'Analyst', avatar: avatar1 },
  { id: 14, name: 'Mahfuz Rahman', role: 'Program Officer', avatar: avatar2 },
  { id: 15, name: 'Sultana Ahmed', role: 'Researcher', avatar: avatar1 },
  { id: 16, name: 'Zarin Tasnim', role: 'Communications', avatar: avatar2 },
];

// Pagination
const pageSize = 12; // 3 rows x 4 columns
const currentPage = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(members.length / pageSize)));
const pagedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return members.slice(start, start + pageSize);
});

function goTo(page) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
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

    <section class="flex w-full bg-blue-gray-100">
      <div
        class="w-full max-w-6xl mx-auto py-14 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center bg-blue-gray-100"
      >
        <div class="">
          <p class="text-sm font-semibold text-green-700 mb-2">Meet the Minds Behind LUCCC</p>
          <h1 class="text-[28px] md:text-[32px] leading-tight font-display font-semibold mb-5">
            Our Team: Driving Climate Action Through Collaboration
          </h1>
          <p class="text-gray-700">
            Our team brings together dedicated researchers, educators, and advocates committed to
            building climate resilience in Least Developed Countries. Through expertise in climate
            science, policy, and education, we work collectively to foster innovation, support
            communities, and drive impactful change.
          </p>
        </div>
        <div>
          <img :src="avatar2" alt="Team" class="w-full h-[360px] object-cover rounded" />
        </div>
      </div>
    </section>

    <!-- Team Members Section -->
    <section class="w-full max-w-6xl mx-auto py-6">
      <h2 class="text-center text-[24px] md:text-[28px] font-display font-medium">Team Members</h2>

      <!-- Lead -->
      <div class="mt-6 text-center">
        <p class="text-sm font-semibold text-gray-700 mb-4">Lead</p>
        <div
          class="mx-auto max-w-sm bg-blue-gray-50 border border-gray-200 rounded-md p-6 flex flex-col items-center"
        >
          <img
            :src="lead.avatar"
            :alt="lead.name"
            class="w-28 h-28 rounded-full object-cover mb-4"
          />
          <p class="m-0 font-medium text-gray-900">{{ lead.name }}</p>
          <p class="m-0 text-sm text-gray-600">{{ lead.role }}</p>
        </div>
      </div>

      <!-- Members -->
      <div class="mt-10">
        <p class="text-center text-sm font-semibold text-gray-700 mb-6">Members</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="m in pagedMembers"
            :key="m.id"
            class="bg-blue-gray-50 border border-gray-200 rounded-md p-6 flex flex-col items-center text-center"
          >
            <img :src="m.avatar" :alt="m.name" class="w-20 h-20 rounded-full object-cover mb-3" />
            <p class="m-0 font-medium text-gray-900">{{ m.name }}</p>
            <p class="m-0 text-sm text-gray-600">{{ m.role }}</p>
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
    </section>
  </div>
</template>
