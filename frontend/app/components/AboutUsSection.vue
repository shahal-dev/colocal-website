<template>
  <section class="w-full bg-gray-50 py-16">
    <div class="max-w-6xl mx-auto px-4 md:px-0">
      <div class="flex flex-col md:flex-row justify-start md:justify-start items-center gap-8 md:gap-0 w-full">
        <div class="flex flex-col justify-start items-center md:items-start w-full md:w-[720px]">
          <h2 class="text-[22px] md:text-[26px] font-display font-semibold mb-4 md:mb-6 text-green-700 md:text-left">
            {{ title || 'About' }}
          </h2>
          <p class="text-justify text-lg mb-6 md:mb-8 text-gray-700">
            {{
              description ||
              `The Least Developed Countries (LDCs) Universities Consortium on Climate Change (LUCCC)
            is a South-South long-term capacity-building platform comprised of 17 universities as
            founding members from the LDCs at the moment. Under this network of universities,
            faculty members and students share experiences and knowledge on climate change to build
            capacity through education, training, research and communication. LUCCC as an LDC-wide
            initiative has been endorsed by the LDC Ministerial in Addis Ababa in October 2018.`
            }}
          </p>
          <NuxtLink to="/about"
            class="px-5 py-3 bg-green-600 text-white rounded-sm font-body text-base font-semibold mx-auto md:mx-0 transition-colors hover:bg-green-700">
            More About Us
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title?: string; description?: string }>();
</script>
