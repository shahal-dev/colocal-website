<template>
  <section class="w-full h-auto md:h-[484px] px-6 py-8 md:p-30">
    <div
      class="flex flex-col md:flex-row justify-between md:justify-around items-center bg-white gap-8 md:gap-0 max-w-7xl mx-auto w-full"
    >
      <div class="flex flex-col justify-center items-center md:items-start w-full md:w-[488px]">
        <h2
          class="text-2xl sm:text-3xl md:text-[32px] font-display font-medium mb-4 md:mb-6 text-center md:text-left"
        >
          {{ title || 'About Us' }}
        </h2>
        <p class="text-sm sm:text-base font-medium font-body mb-4 md:mb-6 text-center md:text-left">
          {{
            description ||
            'We are a network of universities dedicated to building climate resilience in Least Developed Countries (LDCs) through education, research, and policy advocacy.'
          }}
        </p>
        <NuxtLink
          class="px-5 py-3 bg-green-600 text-white rounded-sm font-body text-base font-semibold mx-auto md:mx-0"
          to="/about"
        >
          More About Us
        </NuxtLink>
      </div>

      <div class="flex flex-col gap-4 w-full md:w-auto">
        <div class="flex flex-row gap-4 items-start md:items-center">
          <div
            class="rounded-full bg-green-600 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center"
          >
            <UniversityIcon class="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h3 class="font-display text-lg md:text-xl font-medium mb-[2px]">Research</h3>
            <p class="text-sm md:text-base font-body font-extralight">
              Advancing climate solutions with data-driven insights.
            </p>
          </div>
        </div>

        <div class="flex flex-row gap-4 items-start md:items-center">
          <div
            class="rounded-full bg-green-600 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center"
          >
            <BooksIcon class="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h3 class="font-display text-lg md:text-xl font-medium mb-[2px]">Capacity Building</h3>
            <p class="text-sm md:text-base font-body font-extralight">
              Strengthening climate resilience through education and training.
            </p>
          </div>
        </div>

        <div class="flex flex-row gap-4 items-start md:items-center">
          <div
            class="rounded-full bg-green-600 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center"
          >
            <MicIcon class="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h3 class="font-display text-lg md:text-xl font-medium mb-[2px]">Policy Advocacy</h3>
            <p class="text-sm md:text-base font-body font-extralight">
              Shaping climate policies through research and collaboration.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import BooksIcon from './icons/BooksIcon.vue';
import MicIcon from './icons/MicIcon.vue';
import UniversityIcon from './icons/UniversityIcon.vue';
defineProps<{ title?: string; description?: string }>();
</script>
