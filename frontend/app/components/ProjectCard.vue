<template>
  <div class="w-[995px] h-[308px] flex-shrink-0 border border-gray-300 bg-white flex">
    <img :src="imageUrl" alt="Project Image" class="w-[491px] h-full object-cover" >
    <div class="w-[507px] p-6 flex flex-col justify-center bg-blue-gray-50">
      <h3 class="text-xl font-display font-semibold mb-2">{{ title }}</h3>
      <p class="text-base text-gray-600 mb-11 line-clamp-3">
        {{ description }}
      </p>
      <a
        href="#"
        class="w-fit text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-semibold text-base px-5 py-2 text-center"
      >
        View Details
      </a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  imageUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});
</script>
