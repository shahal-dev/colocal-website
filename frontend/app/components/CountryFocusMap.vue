<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import worldSvg from '~/assets/world.svg?raw';

const props = defineProps<{
  country: {
    id: string;
    name: string;
    iso: string;
    selectors: string[];
    partner: string;
    description: string;
  };
}>();

const svgContainer = ref<HTMLElement | null>(null);
const worldSvgContent = ref(worldSvg);
const viewBoxValue = ref('0 0 2000 857');
const mapSvgElement = ref<SVGSVGElement | null>(null);

const paddingFactor = 0.5; // Amount of space around the selected country (ratio of max dimension)

type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const computeBoundingBox = (elements: Element[]): BoundingBox | null => {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  elements.forEach((element) => {
    if ('getBBox' in element && typeof (element as SVGGraphicsElement).getBBox === 'function') {
      const bbox = (element as SVGGraphicsElement).getBBox();
      if (bbox.width === 0 && bbox.height === 0) return;
      minX = Math.min(minX, bbox.x);
      minY = Math.min(minY, bbox.y);
      maxX = Math.max(maxX, bbox.x + bbox.width);
      maxY = Math.max(maxY, bbox.y + bbox.height);
    }
  });

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY)
  ) {
    return null;
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

const bindSvg = () => {
  const host = svgContainer.value;
  if (!host) return;

  const svg = host.querySelector('svg');
  if (!svg) return;

  mapSvgElement.value = svg as SVGSVGElement;
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.style.width = '100%';
  svg.style.height = '100%';

  // Make unselected countries dark
  const allPaths = svg.querySelectorAll('path');
  allPaths.forEach((path) => {
    path.style.fill = '#072c27'; // Dark theme default
    path.style.stroke = 'rgba(12, 62, 53, 0.75)';
    path.style.strokeWidth = '0.4';
  });

  const targetElements: Element[] = [];

  // Highlight selected country
  if (props.country && props.country.selectors) {
    props.country.selectors.forEach((selector) => {
      svg.querySelectorAll(selector).forEach((node) => {
        const path = node as SVGElement;
        targetElements.push(path);
        // Highlight styles (matching the screenshot's bright green)
        path.style.fill = '#86efac';
        path.style.stroke = '#22c55e';
        path.style.strokeWidth = '0.5';
      });
    });
  }

  // Calculate bounding box and set zoom
  if (targetElements.length > 0) {
    const bbox = computeBoundingBox(targetElements);
    if (bbox) {
      // Add padding
      const maxDim = Math.max(bbox.width, bbox.height);
      const pad = maxDim * paddingFactor;

      const targetViewBox = {
        x: bbox.x - pad,
        y: bbox.y - pad,
        width: bbox.width + pad * 2,
        height: bbox.height + pad * 2,
      };

      const newViewBoxStr = `${targetViewBox.x} ${targetViewBox.y} ${targetViewBox.width} ${targetViewBox.height}`;
      svg.setAttribute('viewBox', newViewBoxStr);
      viewBoxValue.value = newViewBoxStr; // Sync with overlay
    }
  }
};

onMounted(() => {
  nextTick(() => {
    bindSvg();
  });
});

watch(
  () => props.country,
  () => {
    nextTick(() => {
      bindSvg();
    });
  },
  { deep: true }
);
</script>

<template>
  <div class="relative w-full h-full min-h-[50vh] flex items-center justify-center overflow-hidden">
    <!-- Map Background SVG -->
    <!-- eslint-disable vue/no-v-html -->
    <div ref="svgContainer" class="absolute inset-0 map-shell" v-html="worldSvgContent" />
    <!-- eslint-enable vue/no-v-html -->
  </div>
</template>

<style scoped>
.map-shell :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
