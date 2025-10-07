<script setup>
import { computed } from 'vue';
import { useRoute } from '#app';

const route = useRoute();
const id = Number(route.params.id);

// Fetch current education/training and more for sidebar (no project filter)
const { data: current } = await useAsyncData(
  () => `education-training:${id}`,
  () => $fetch('/api/education-trainings', { params: { id: String(id) } })
);
const item = computed(() => (current.value && current.value[0]) || null);

const images = computed(() => {
  const arr = [];
  if (item.value?.imageCover?.url) arr.push(item.value.imageCover.url);
  if (item.value?.images && Array.isArray(item.value.images)) {
    // allow item.images to be array of strings or objects with url
    item.value.images.forEach((it) => {
      if (!it) return;
      arr.push(typeof it === 'string' ? it : it.url);
    });
  }
  return arr;
});

const { data: moreList } = await useAsyncData('education-trainings:all', () =>
  $fetch('/api/education-trainings')
);
const more = computed(() => (moreList.value || []).filter((n) => n.id !== id).slice(0, 6));

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/* Carousel state & handlers */
const activeIndex = ref(0);

// Reset to 0 when image list changes (e.g., navigation)
watch(images, () => {
  activeIndex.value = 0;
});

// click indicator
function goTo(i) {
  activeIndex.value = i;
}

// Touch/swipe handling
let touchStartX = 0;
let touchDeltaX = 0;

function onTouchStart(e) {
  touchDeltaX = 0;
  touchStartX = (e.touches && e.touches[0] && e.touches[0].clientX) || e.clientX || 0;
}

function onTouchMove(e) {
  const x = (e.touches && e.touches[0] && e.touches[0].clientX) || e.clientX || 0;
  touchDeltaX = x - touchStartX;
}

function onTouchEnd() {
  const threshold = 50; // px
  if (Math.abs(touchDeltaX) > threshold) {
    if (touchDeltaX < 0) {
      // swipe left -> next
      if (activeIndex.value < images.value.length - 1) activeIndex.value += 1;
    } else {
      // swipe right -> prev
      if (activeIndex.value > 0) activeIndex.value -= 1;
    }
  }
  touchDeltaX = 0;
}
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'Education & Training', href: '/education-training' },
      ]"
      :page-title="item?.title ? item.title : 'Education & Training'"
    />

    <section class="w-full max-w-6xl mx-auto px-4 md:px-0 py-8">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div class="md:col-span-8">
          <div v-if="item">
            <div
              v-if="images.length > 1"
              class="w-full h-64 md:h-72 rounded-lg overflow-hidden mb-5 relative"
            >
              <!-- track -->
              <div
                class="h-full flex transition-transform duration-300 ease-out"
                :style="{
                  width: `${images.length * 100}%`,
                  transform: `translateX(-${activeIndex * (100 / images.length)}%)`,
                }"
                @touchstart.passive="onTouchStart"
                @touchmove.passive="onTouchMove"
                @touchend.passive="onTouchEnd"
                @mousedown.prevent="onTouchStart"
                @mousemove.prevent="onTouchMove"
                @mouseup.prevent="onTouchEnd"
              >
                <div v-for="(src, i) in images" :key="i" class="flex-none w-full h-full">
                  <img :src="src" :alt="item.title" class="w-full h-full object-cover" >
                </div>
              </div>

              <!-- indicators: dots + index -->
              <div
                class="absolute left-0 right-0 bottom-2 flex items-center justify-center gap-3 pointer-events-none"
              >
                <div
                  class="flex items-center gap-2 pointer-events-auto bg-black/30 px-3 py-1 rounded-full"
                >
                  <div class="flex gap-2 items-center">
                    <button
                      v-for="(src, i) in images"
                      :key="i"
                      class="w-2 h-2 rounded-full transition-all"
                      :class="i === activeIndex ? 'bg-white scale-150' : 'bg-white/60'"
                      aria-label="'Go to slide ' + (i+1)"
                      @click="goTo(i)"
                    />
                  </div>
                  <div class="text-xs text-white/90 ml-2 select-none">
                    {{ activeIndex + 1 }} / {{ images.length }}
                  </div>
                </div>
              </div>
            </div>
            <div class="w-full h-64 md:h-72 rounded-lg overflow-hidden mb-5">
              <img :src="item.cover?.url" :alt="item.title" class="w-full h-full object-cover" >
            </div>
            <h1 class="text-2xl md:text-3xl font-display font-semibold mb-2">{{ item.title }}</h1>
            <div class="text-sm text-gray-600 flex items-center gap-2 mb-4">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                  stroke-width="2"
                />
              </svg>
              <span>{{ formatDate(item.date) }}</span>
            </div>
            <MDC :value="item.body" class="prose max-w-none text-gray-800 space-y-6" />
          </div>
        </div>

        <aside class="md:col-span-4">
          <h3 class="text-lg font-semibold mb-4">More Activities</h3>
          <div class="space-y-4">
            <NuxtLink
              v-for="m in more"
              :key="m.id"
              :to="`/education-training/${m.id}`"
              class="flex gap-3 items-center group"
            >
              <div class="w-20 h-14 rounded overflow-hidden flex-shrink-0">
                <img :src="m.cover?.url" :alt="m.title" class="w-full h-full object-cover" >
              </div>
              <div class="min-w-0">
                <p class="text-sm text-green-700 group-hover:underline truncate">{{ m.title }}</p>
              </div>
            </NuxtLink>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
