<template>
  <div class="w-full h-[348px] bg-green-700">
    <div class="flex flex-row justify-center items-center h-full">
      <div class="flex flex-col justify-around items-center text-white">
        <div class="flex flex-row gap-40">
          <div class="flex flex-col items-center">
            <span class="text-[56px] font-body font-semibold">{{ countries ?? 16 }}</span>
            <span class="text-2xl font-body font-semibold">Country Affiliations</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-[56px] font-body font-semibold">{{ projects ?? 13 }}</span>
            <span class="text-2xl font-body font-semibold">Projects</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-[56px] font-body font-semibold">{{ years ?? 7 }}</span>
            <span class="text-2xl font-body font-semibold">Years</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-[56px] font-body font-semibold">{{ members ?? '48+' }}</span>
            <span class="text-2xl font-body font-semibold">Members</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  countries?: number;
  projects?: number;
  years?: number;
  members?: number | string;
}>();
</script>
