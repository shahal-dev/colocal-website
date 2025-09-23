<template>
  <section class="w-full h-[484px] p-30">
    <div class="flex flex-row justify-around items-center bg-white">
      <div class="flex-col justify-center items-start w-[488px]">
        <h2 class="text-[32px] font-display font-medium mb-6">{{ title || 'About Us' }}</h2>
        <p class="text-base font-medium font-body mb-6">
          {{
            description ||
            'We are a network of universities dedicated to building climate resilience in Least Developed Countries (LDCs) through education, research, and policy advocacy.'
          }}
        </p>
        <button
          class="px-5 py-3 bg-green-600 text-white rounded-sm font-body text-base font-semibold"
        >
          More About Us
        </button>
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex flex-row gap-4">
          <div class="rounded-full bg-green-600 w-12 h-12 flex items-center justify-center">
            <UniversityIcon class="flex-shrink-0" />
          </div>
          <div>
            <h3 class="font-display text-xl font-medium mb-[2px]">Research</h3>
            <p class="text-base font-body font-extralight">
              Advancing climate solutions with data-driven insights.
            </p>
          </div>
        </div>
        <div class="flex flex-row gap-4">
          <div class="rounded-full bg-green-600 w-12 h-12 flex items-center justify-center">
            <BooksIcon class="flex-shrink-0" />
          </div>
          <div>
            <h3 class="font-display text-xl font-medium mb-[2px]">Capacity Building</h3>
            <p class="text-base font-body font-extralight">
              Strengthening climate resilience through education and training.
            </p>
          </div>
        </div>
        <div class="flex flex-row gap-4">
          <div class="rounded-full bg-green-600 w-12 h-12 flex items-center justify-center">
            <MicIcon class="flex-shrink-0" />
          </div>
          <div>
            <h3 class="font-display text-xl font-medium mb-[2px]">Policy Advocacy</h3>
            <p class="text-base font-body font-extralight">
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
