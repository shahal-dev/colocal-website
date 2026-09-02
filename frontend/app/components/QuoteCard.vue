<script setup lang="ts">
const { name, role, quote, avatar } = defineProps<{
  name: string;
  role: string;
  quote: string;
  avatar: string;
}>();
</script>

<template>
  <div
    class="w-full max-w-3xl bg-white border border-gray-200 rounded-md shadow-sm p-6 md:p-8 flex gap-6"
  >
    <img
      :src="avatar"
      :alt="name"
      width="64"
      height="64"
      loading="lazy"
      class="w-16 h-16 rounded-full object-cover"
    />
    <div>
      <p class="text-[16px] font-semibold text-gray-900 m-0">{{ name }}</p>
      <p class="text-sm text-gray-500 m-0">{{ role }}</p>
      <p class="mt-4 text-gray-700 leading-relaxed">{{ quote }}</p>
    </div>
  </div>
</template>

<style scoped></style>
