<template>
  <div
    class="relative w-full aspect-[2/1] bg-gray-50 rounded-lg overflow-hidden border border-gray-200 shadow-sm"
    @mousemove="updateTooltip"
    @mouseleave="hideTooltip"
  >
    <div
      ref="mapContainer"
      class="w-full h-full p-4 [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full"
      v-html="worldSvg"
    ></div>

    <div
      v-if="tooltip.visible"
      class="absolute pointer-events-none z-10 bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm text-gray-800 transition-opacity duration-150 transform -translate-x-1/2 -translate-y-full mt-[-10px]"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="font-bold text-green-700 mb-1">{{ tooltip.country }}</div>
      <div class="text-xs text-gray-600 max-w-[200px]">{{ tooltip.uni }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import worldSvg from '~/assets/world.svg?raw';

const mapContainer = ref<HTMLElement | null>(null);

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  country: '',
  uni: '',
});

const partners: Record<string, { country: string; uni: string }> = {
  BD: {
    country: 'Bangladesh',
    uni: 'International Centre for Climate Change and Development (ICCCAD)',
  },
  BT: { country: 'Bhutan', uni: 'Royal University of Bhutan' },
  NP: { country: 'Nepal', uni: 'School of Environmental Science and Management (SchEMS)' },
  ET: { country: 'Ethiopia', uni: 'Climate Science Center, African Centre for DRM' },
  SD: { country: 'Sudan', uni: 'University of Khartoum' },
  TZ: { country: 'Tanzania', uni: 'University of Dar-es-Salaam' },
  UG: { country: 'Uganda', uni: 'Makerere University' },
  MW: { country: 'Malawi', uni: 'Lilongwe University of Agriculture & Natural Resources' },
  GM: { country: 'The Gambia', uni: 'University of The Gambia' },
  SN: { country: 'Senegal', uni: 'University of Cheikh Anta Diop' },
  MZ: { country: 'Mozambique', uni: 'Eduardo Mondlane University' },
};

const handleMouseEnter = (id: string, event: MouseEvent) => {
  const data = partners[id];
  if (data) {
    tooltip.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      country: data.country,
      uni: data.uni,
    };
  }
};

const updateTooltip = (event: MouseEvent) => {
  if (tooltip.value.visible && mapContainer.value) {
    const rect = mapContainer.value.getBoundingClientRect();
    tooltip.value.x = event.clientX - rect.left;
    tooltip.value.y = event.clientY - rect.top;
  }
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};

const mouseEnterListeners: { el: SVGPathElement; listener: (e: MouseEvent) => void }[] = [];
const mouseLeaveListeners: { el: SVGPathElement; listener: (e: MouseEvent) => void }[] = [];

onMounted(() => {
  if (mapContainer.value) {
    const paths = mapContainer.value.querySelectorAll('path');
    const svgElement = mapContainer.value.querySelector('svg');

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    let hasPartners = false;

    paths.forEach((path) => {
      // Set default style
      path.style.fill = '#e5e7eb'; // gray-200
      path.style.stroke = '#ffffff';
      path.style.strokeWidth = '0.5';
      path.style.transition = 'fill 0.2s ease';

      const id = path.getAttribute('id');
      if (id && partners[id]) {
        hasPartners = true;
        // Highlight partner countries
        path.style.fill = '#16a34a'; // green-600
        path.style.cursor = 'pointer';

        // Calculate bounds for zoom
        const bbox = path.getBBox();
        minX = Math.min(minX, bbox.x);
        minY = Math.min(minY, bbox.y);
        maxX = Math.max(maxX, bbox.x + bbox.width);
        maxY = Math.max(maxY, bbox.y + bbox.height);

        const enterListener = (e: MouseEvent) => {
          path.style.fill = '#15803d'; // green-700 on hover
          handleMouseEnter(id, e);
        };
        const leaveListener = () => {
          path.style.fill = '#16a34a'; // back to green-600
          hideTooltip();
        };

        path.addEventListener('mouseenter', enterListener);
        path.addEventListener('mouseleave', leaveListener);

        mouseEnterListeners.push({ el: path, listener: enterListener });
        mouseLeaveListeners.push({ el: path, listener: leaveListener });
      }
    });

    if (svgElement && hasPartners) {
      // Add padding around the bounding box
      const padding = 100;
      const viewBoxWidth = maxX - minX + padding * 2;
      const viewBoxHeight = maxY - minY + padding * 2;
      svgElement.setAttribute(
        'viewBox',
        `${minX - padding} ${minY - padding} ${viewBoxWidth} ${viewBoxHeight}`
      );
    }
  }
});

onBeforeUnmount(() => {
  mouseEnterListeners.forEach(({ el, listener }) => el.removeEventListener('mouseenter', listener));
  mouseLeaveListeners.forEach(({ el, listener }) => el.removeEventListener('mouseleave', listener));
});
</script>
