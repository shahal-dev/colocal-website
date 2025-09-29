<template>
  <div class="w-full bg-green-700">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex justify-center">
        <div class="w-full">
          <!-- responsive: stack on small, row on md+; wrap if needed -->
          <div
            class="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2 md:grid-cols-4 items-center text-white text-center"
          >
            <div class="flex flex-col items-center">
              <span class="font-body font-semibold text-3xl sm:text-4xl md:text-[56px]">
                {{ props.countries ?? 16 }}
              </span>
              <span class="font-body font-semibold text-base sm:text-lg md:text-2xl">
                Country Affiliations
              </span>
            </div>

            <div class="flex flex-col items-center">
              <span class="font-body font-semibold text-3xl sm:text-4xl md:text-[56px]">
                {{ props.projects ?? 13 }}
              </span>
              <span class="font-body font-semibold text-base sm:text-lg md:text-2xl">
                Projects
              </span>
            </div>

            <div class="flex flex-col items-center">
              <span class="font-body font-semibold text-3xl sm:text-4xl md:text-[56px]">
                {{ props.years ?? 7 }}
              </span>
              <span class="font-body font-semibold text-base sm:text-lg md:text-2xl"> Years </span>
            </div>

            <div class="flex flex-col items-center">
              <span class="font-body font-semibold text-3xl sm:text-4xl md:text-[56px]">
                {{ props.members ?? '48+' }}
              </span>
              <span class="font-body font-semibold text-base sm:text-lg md:text-2xl">
                Members
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  countries?: number;
  projects?: number;
  years?: number;
  members?: number | string;
}>();
</script>
