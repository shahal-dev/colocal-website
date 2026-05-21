<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import worldSvg from '~/assets/world.svg?raw';

type Country = {
  iso: string;
  selectors: string[];
  name: string;
  institutions: string[];
};

type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const countries: Country[] = [
  {
    iso: 'AF',
    selectors: ['#AF'],
    name: 'Afghanistan',
    institutions: ['Kabul University'],
  },
  {
    iso: 'BD',
    selectors: ['#BD'],
    name: 'Bangladesh',
    institutions: ['Independent University, Bangladesh (IUB)'],
  },
  { iso: 'BJ', selectors: ['#BJ'], name: 'Benin', institutions: ['University of Parakou'] },
  {
    iso: 'BT',
    selectors: ['#BT'],
    name: 'Bhutan',
    institutions: ['Royal University of Bhutan'],
  },
  {
    iso: 'BF',
    selectors: ['#BF'],
    name: 'Burkina Faso',
    institutions: ['University Joseph Ki-Zerbo'],
  },
  {
    iso: 'CD',
    selectors: ['#CD'],
    name: 'Democratic Republic of Congo',
    institutions: ['Université Officielle de Bukavu'],
  },
  {
    iso: 'ET',
    selectors: ['#ET'],
    name: 'Ethiopia',
    institutions: ['Addis Ababa University'],
  },
  { iso: 'GM', selectors: ['#GM'], name: 'The Gambia', institutions: ['University of The Gambia'] },
  { iso: 'LR', selectors: ['#LR'], name: 'Liberia', institutions: ['University of Liberia'] },
  {
    iso: 'MW',
    selectors: ['#MW'],
    name: 'Malawi',
    institutions: ['Lilongwe University of Agriculture and Natural Resources (LUANAR)'],
  },
  {
    iso: 'MZ',
    selectors: ['#MZ'],
    name: 'Mozambique',
    institutions: ['Eduardo Mondlane University'],
  },
  {
    iso: 'NP',
    selectors: ['#NP'],
    name: 'Nepal',
    institutions: ['School of Environmental Science and Management (SchEMS)'],
  },
  {
    iso: 'RW',
    selectors: ['#RW'],
    name: 'Rwanda',
    institutions: ['University of Rwanda'],
  },
  {
    iso: 'SN',
    selectors: ['#SN'],
    name: 'Senegal',
    institutions: ['University of Cheikh Anta Diop'],
  },
  {
    iso: 'SD',
    selectors: ['#SD'],
    name: 'Sudan',
    institutions: ['University of Khartoum'],
  },
  {
    iso: 'TZ',
    selectors: ['#TZ'],
    name: 'Tanzania',
    institutions: ['University of Dar-es-Salaam'],
  },
  {
    iso: 'UG',
    selectors: ['#UG'],
    name: 'Uganda',
    institutions: ['Makerere University'],
  },
];

const countryLookup = new Map(countries.map((country) => [country.iso, country]));
const PRIMARY_VIEW_ISOS = countries.map((c) => c.iso);
const SUPPLEMENTAL_VIEW_ISOS: string[] = [];
const DEFAULT_INITIAL_ZOOM_EXP = 0;

const selectedCountryId = ref<string | null>(null);
const hoveredCountryId = ref<string | null>(null);
const selectedCountry = computed(() =>
  selectedCountryId.value ? (countryLookup.get(selectedCountryId.value) ?? null) : null
);

const svgContainer = ref<HTMLElement | null>(null);
const worldSvgContent = ref(worldSvg);

const isoToElements = new Map<string, Element[]>();
const isoToBoundingBox = new Map<string, BoundingBox>();
const attachedListeners: Array<{ element: Element; type: string; handler: EventListener }> = [];
const svgElement = ref<SVGSVGElement | null>(null);
const initialViewBox = ref<BoundingBox | null>(null);
const combinedBoundingBox = ref<BoundingBox | null>(null);
const defaultBoundingBox = ref<BoundingBox | null>(null);
const currentViewBox = ref<BoundingBox | null>(null);
const baseTargetViewBox = ref<BoundingBox | null>(null);
const zoomExponent = ref(DEFAULT_INITIAL_ZOOM_EXP);
let resizeObserver: ResizeObserver | null = null;
const animationDuration = 450;
let animationFrameId: number | null = null;
let animationStart: number | null = null;
let activeViewBoxTarget: BoundingBox | null = null;
let isPanning = false;
let panPointerId: number | null = null;
let panStartPoint: { x: number; y: number } | null = null;
let panStartViewBox: BoundingBox | null = null;
let panHasMoved = false;
let suppressClick = false;
let panListenersAttached = false;

const stopAnimation = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  animationStart = null;
  activeViewBoxTarget = null;
};

const DEFAULT_PADDING = 0.02;
const SELECTED_PADDING = 0.2;
const DEFAULT_SCALE = 1.0;
const SELECTED_SCALE = 2;
const ZOOM_STEP = 1.35;
const MIN_ZOOM_EXP = -2;
const MAX_ZOOM_EXP = 4;
const SUPPLEMENTAL_VISIBLE_RATIO = 0.2;

const parseViewBox = (value: string): BoundingBox | null => {
  const numbers = value
    .trim()
    .split(/[\s,]+/)
    .map((part) => Number.parseFloat(part));
  if (numbers.length !== 4 || numbers.some((n) => Number.isNaN(n))) {
    return null;
  }
  const [x, y, width, height] = numbers;
  if (x === undefined || y === undefined || width === undefined || height === undefined) {
    return null;
  }
  return { x, y, width, height };
};

const serializeViewBox = (box: BoundingBox) => `${box.x} ${box.y} ${box.width} ${box.height}`;

const mergeBoxes = (a: BoundingBox, b: BoundingBox): BoundingBox => {
  const minX = Math.min(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxX = Math.max(a.x + a.width, b.x + b.width);
  const maxY = Math.max(a.y + a.height, b.y + b.height);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

const extendBoundingBox = (
  base: BoundingBox,
  extras: BoundingBox[],
  visibleRatio = SUPPLEMENTAL_VISIBLE_RATIO
): BoundingBox => {
  if (!extras.length) {
    return { ...base };
  }

  const ratio =
    Number.isFinite(visibleRatio) && visibleRatio > 0 && visibleRatio <= 1
      ? visibleRatio
      : SUPPLEMENTAL_VISIBLE_RATIO;

  return extras.reduce<BoundingBox>(
    (acc, box) => {
      const accBottom = acc.y + acc.height;
      const boxBottom = box.y + box.height;
      const minX = Math.min(acc.x, box.x);
      const maxX = Math.max(acc.x + acc.width, box.x + box.width);
      const cutoffY = box.y + box.height * (1 - ratio);
      const newTop = Math.min(acc.y, cutoffY);
      const newBottom = Math.max(accBottom, boxBottom);
      return { x: minX, y: newTop, width: maxX - minX, height: newBottom - newTop };
    },
    { ...base }
  );
};

const padBox = (box: BoundingBox, ratio: number): BoundingBox => {
  const pad = Math.max(box.width, box.height) * ratio;
  return {
    x: box.x - pad,
    y: box.y - pad,
    width: box.width + pad * 2,
    height: box.height + pad * 2,
  };
};

const scaleBox = (box: BoundingBox, factor: number): BoundingBox => {
  if (!Number.isFinite(factor) || factor <= 0) {
    return box;
  }
  const deltaWidth = box.width * (factor - 1);
  const deltaHeight = box.height * (factor - 1);
  return {
    x: box.x - deltaWidth / 2,
    y: box.y - deltaHeight / 2,
    width: box.width * factor,
    height: box.height * factor,
  };
};

const normalizeAspect = (box: BoundingBox, targetAspect: number | null): BoundingBox => {
  if (!targetAspect || !Number.isFinite(targetAspect) || targetAspect <= 0) {
    return box;
  }

  const currentAspect = box.width / box.height;
  if (Math.abs(currentAspect - targetAspect) < 0.01) {
    return box;
  }

  if (currentAspect > targetAspect) {
    // Too wide; extend height
    const targetHeight = box.width / targetAspect;
    const delta = targetHeight - box.height;
    return { x: box.x, y: box.y - delta / 2, width: box.width, height: targetHeight };
  }

  // Too tall; extend width
  const targetWidth = box.height * targetAspect;
  const delta = targetWidth - box.width;
  return { x: box.x - delta / 2, y: box.y, width: targetWidth, height: box.height };
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

const computeTargetViewBox = (box: BoundingBox, paddingRatio: number, scaleFactor: number) => {
  const svg = svgElement.value;
  if (!svg) return null;

  const padded = padBox(box, paddingRatio);
  const rect = svg.getBoundingClientRect();
  const aspect = rect.width && rect.height ? rect.width / rect.height : null;
  const adjusted = normalizeAspect(padded, aspect);
  return scaleBox(adjusted, scaleFactor);
};

const applyZoomExponent = (box: BoundingBox, exponent: number): BoundingBox => {
  if (!Number.isFinite(exponent) || exponent === 0) {
    return box;
  }
  const factor = Math.pow(ZOOM_STEP, exponent);
  if (!Number.isFinite(factor) || factor <= 0) {
    return box;
  }
  const newWidth = box.width / factor;
  const newHeight = box.height / factor;
  return {
    x: box.x + (box.width - newWidth) / 2,
    y: box.y + (box.height - newHeight) / 2,
    width: newWidth,
    height: newHeight,
  };
};

const clampBoxToBounds = (box: BoundingBox, bounds: BoundingBox | null): BoundingBox => {
  if (!bounds) return box;
  // Allow aspect-ratio adjusted width/height, just keep center within bounds
  const clampedX = Math.min(
    Math.max(box.x, bounds.x - box.width * 0.8),
    bounds.x + bounds.width - box.width * 0.2
  );
  const clampedY = Math.min(
    Math.max(box.y, bounds.y - box.height * 0.8),
    bounds.y + bounds.height - box.height * 0.2
  );
  return { x: clampedX, y: clampedY, width: box.width, height: box.height };
};

const areBoxesClose = (a: BoundingBox | null, b: BoundingBox | null, epsilon = 0.25) => {
  if (!a || !b) return false;
  return (
    Math.abs(a.x - b.x) <= epsilon &&
    Math.abs(a.y - b.y) <= epsilon &&
    Math.abs(a.width - b.width) <= epsilon &&
    Math.abs(a.height - b.height) <= epsilon
  );
};

const animateToViewBox = (target: BoundingBox | null) => {
  const svg = svgElement.value;
  if (!svg || !target) return;

  if (animationFrameId !== null && areBoxesClose(activeViewBoxTarget, target)) {
    return;
  }

  const startBox =
    currentViewBox.value ?? parseViewBox(svg.getAttribute('viewBox') ?? '') ?? target;

  if (areBoxesClose(startBox, target, 0.05)) {
    svg.setAttribute('viewBox', serializeViewBox(target));
    currentViewBox.value = target;
    activeViewBoxTarget = null;
    return;
  }

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  animationFrameId = null;
  animationStart = null;
  activeViewBoxTarget = target;

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const step = (timestamp: number) => {
    if (animationStart === null) {
      animationStart = timestamp;
    }
    const elapsed = timestamp - animationStart;
    const progress = Math.min(elapsed / animationDuration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    const interpolated: BoundingBox = {
      x: lerp(startBox.x, target.x, eased),
      y: lerp(startBox.y, target.y, eased),
      width: lerp(startBox.width, target.width, eased),
      height: lerp(startBox.height, target.height, eased),
    };

    svg.setAttribute('viewBox', serializeViewBox(interpolated));

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(step);
    } else {
      currentViewBox.value = target;
      animationFrameId = null;
      animationStart = null;
      activeViewBoxTarget = null;
    }
  };

  animationFrameId = requestAnimationFrame(step);
};

const scheduleViewBoxUpdate = () => {
  nextTick(() => {
    if (isPanning) {
      return;
    }
    const targetIso = selectedCountryId.value;
    let baseBox: BoundingBox | null = null;

    if (targetIso) {
      const isoBox = isoToBoundingBox.get(targetIso) ?? null;
      const fallbackBox =
        isoBox ?? defaultBoundingBox.value ?? combinedBoundingBox.value ?? initialViewBox.value;
      if (!fallbackBox) return;
      baseBox = computeTargetViewBox(fallbackBox, SELECTED_PADDING, SELECTED_SCALE);
    } else if (baseTargetViewBox.value) {
      baseBox = baseTargetViewBox.value;
    } else {
      const fallback =
        defaultBoundingBox.value ?? combinedBoundingBox.value ?? initialViewBox.value;
      if (!fallback) return;
      baseBox = computeTargetViewBox(fallback, DEFAULT_PADDING, DEFAULT_SCALE);
    }

    if (!baseBox) return;

    baseTargetViewBox.value = { ...baseBox };

    const zoomedTarget = applyZoomExponent(baseBox, zoomExponent.value);
    const boundedTarget = clampBoxToBounds(zoomedTarget, initialViewBox.value);

    if (animationFrameId === null && areBoxesClose(currentViewBox.value, boundedTarget)) {
      return;
    }

    animateToViewBox(boundedTarget);
  });
};

const beginPan = (event: PointerEvent) => {
  if (
    !svgElement.value ||
    (event.pointerType === 'mouse' && event.button !== 0) ||
    (isPanning && panPointerId !== event.pointerId)
  ) {
    return;
  }

  if (event.pointerType !== 'mouse') {
    event.preventDefault();
  }

  const currentBox =
    currentViewBox.value ?? parseViewBox(svgElement.value.getAttribute('viewBox') ?? '') ?? null;

  if (!currentBox) {
    return;
  }

  stopAnimation();

  attachPanListeners();

  isPanning = true;
  panPointerId = event.pointerId;
  panStartPoint = { x: event.clientX, y: event.clientY };
  panStartViewBox = { ...currentBox };
  panHasMoved = false;
  suppressClick = false;
};

const updatePan = (event: PointerEvent) => {
  if (
    !isPanning ||
    panPointerId !== event.pointerId ||
    !svgElement.value ||
    !panStartPoint ||
    !panStartViewBox
  ) {
    return;
  }

  event.preventDefault();

  const rect = svgElement.value.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return;
  }

  const deltaX = event.clientX - panStartPoint.x;
  const deltaY = event.clientY - panStartPoint.y;

  if (!panHasMoved && Math.abs(deltaX) + Math.abs(deltaY) > 4) {
    panHasMoved = true;
  }

  const scaleX = panStartViewBox.width / rect.width;
  const scaleY = panStartViewBox.height / rect.height;

  const candidate: BoundingBox = {
    x: panStartViewBox.x - deltaX * scaleX,
    y: panStartViewBox.y - deltaY * scaleY,
    width: panStartViewBox.width,
    height: panStartViewBox.height,
  };

  const bounded = clampBoxToBounds(candidate, initialViewBox.value);
  svgElement.value.setAttribute('viewBox', serializeViewBox(bounded));
  currentViewBox.value = bounded;
};

const endPan = (event: PointerEvent) => {
  if (panPointerId !== event.pointerId) {
    return;
  }

  if (panHasMoved) {
    suppressClick = true;
    requestAnimationFrame(() => {
      suppressClick = false;
    });
    zoomExponent.value = 0;
    baseTargetViewBox.value = currentViewBox.value ? { ...currentViewBox.value } : null;
  }

  isPanning = false;
  panPointerId = null;
  panStartPoint = null;
  panStartViewBox = null;
  panHasMoved = false;
  detachPanListeners();
};

const handlePointerDown: EventListener = (event) => {
  if (event instanceof PointerEvent) {
    beginPan(event);
  }
};

const handlePointerMove: EventListener = (event) => {
  if (event instanceof PointerEvent) {
    updatePan(event);
  }
};

const handlePointerUp: EventListener = (event) => {
  if (event instanceof PointerEvent) {
    endPan(event);
  }
};

const handlePointerCancel: EventListener = (event) => {
  if (event instanceof PointerEvent) {
    endPan(event);
  }
};

const canZoomIn = computed(() => zoomExponent.value < MAX_ZOOM_EXP);
const canZoomOut = computed(() => zoomExponent.value > MIN_ZOOM_EXP);

const zoomIn = () => {
  if (!canZoomIn.value || isPanning) return;
  zoomExponent.value += 1;
  scheduleViewBoxUpdate();
};

const zoomOut = () => {
  if (!canZoomOut.value || isPanning) return;
  zoomExponent.value -= 1;
  scheduleViewBoxUpdate();
};

const attachPanListeners = () => {
  if (panListenersAttached) return;
  window.addEventListener('pointermove', handlePointerMove, { passive: false });
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointercancel', handlePointerCancel);
  panListenersAttached = true;
};

const detachPanListeners = () => {
  if (!panListenersAttached) return;
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerup', handlePointerUp);
  window.removeEventListener('pointercancel', handlePointerCancel);
  panListenersAttached = false;
};

const selectCountry = (iso: string) => {
  if (selectedCountryId.value === iso) {
    scheduleViewBoxUpdate();
    return;
  }
  selectedCountryId.value = iso;
};

const closePanel = () => {
  selectedCountryId.value = null;
  scheduleViewBoxUpdate();
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closePanel();
  }
};

const detachListeners = () => {
  attachedListeners.forEach(({ element, type, handler }) =>
    element.removeEventListener(type, handler)
  );
  attachedListeners.length = 0;
};

const updateStyles = () => {
  isoToElements.forEach((elements, iso) => {
    const isSelected = selectedCountryId.value === iso;
    const isHovered = hoveredCountryId.value === iso;
    elements.forEach((el) => {
      el.classList.add('country-shape');
      el.classList.toggle('is-selected', isSelected);
      el.classList.toggle('is-hovered', isHovered && !isSelected);
    });
  });
};

const bindSvg = () => {
  const host = svgContainer.value;
  if (!host) return;

  detachListeners();
  detachPanListeners();
  isoToElements.clear();
  isoToBoundingBox.clear();

  const svg = host.querySelector('svg');
  if (!svg) return;

  svgElement.value = svg as SVGSVGElement;

  svg.addEventListener('pointerdown', handlePointerDown);
  attachedListeners.push({ element: svg, type: 'pointerdown', handler: handlePointerDown });

  const svgClickHandler: EventListener = (event) => {
    if (suppressClick) return;
    const target = event.target as Element;
    if (!target.closest('.is-interactive')) {
      closePanel();
    }
  };
  svg.addEventListener('click', svgClickHandler);
  attachedListeners.push({ element: svg, type: 'click', handler: svgClickHandler });

  const rawViewBox = svg.getAttribute('viewBox') ?? svg.getAttribute('viewbox') ?? '0 0 2000 857';
  const parsedViewBox = parseViewBox(rawViewBox);
  if (parsedViewBox) {
    initialViewBox.value = parsedViewBox;
    if (!currentViewBox.value) {
      currentViewBox.value = parsedViewBox;
    }
  }

  svg.setAttribute('viewBox', rawViewBox);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.style.width = '';
  svg.style.height = '';

  countries.forEach((country) => {
    const nodes: Element[] = [];
    country.selectors.forEach((selector) => {
      svg.querySelectorAll(selector).forEach((node) => {
        const target = node as Element;
        nodes.push(target);
        target.classList.add('is-interactive');
        target.setAttribute('data-iso', country.iso);
        target.setAttribute('role', 'button');
        target.setAttribute('tabindex', '0');
        target.setAttribute('aria-label', country.name);

        const clickHandler: EventListener = () => {
          if (suppressClick) {
            return;
          }
          selectCountry(country.iso);
        };
        const enterHandler: EventListener = () => {
          hoveredCountryId.value = country.iso;
        };
        const leaveHandler: EventListener = () => {
          if (hoveredCountryId.value === country.iso) {
            hoveredCountryId.value = null;
          }
        };
        const keyHandler: EventListener = (event) => {
          if (event instanceof KeyboardEvent) {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              selectCountry(country.iso);
            }
            if (event.key === 'Escape') {
              closePanel();
            }
          }
        };

        target.addEventListener('click', clickHandler);
        target.addEventListener('mouseenter', enterHandler);
        target.addEventListener('mouseleave', leaveHandler);
        target.addEventListener('focus', enterHandler);
        target.addEventListener('blur', leaveHandler);
        target.addEventListener('keydown', keyHandler);

        attachedListeners.push({ element: target, type: 'click', handler: clickHandler });
        attachedListeners.push({ element: target, type: 'mouseenter', handler: enterHandler });
        attachedListeners.push({ element: target, type: 'mouseleave', handler: leaveHandler });
        attachedListeners.push({ element: target, type: 'focus', handler: enterHandler });
        attachedListeners.push({ element: target, type: 'blur', handler: leaveHandler });
        attachedListeners.push({ element: target, type: 'keydown', handler: keyHandler });
      });
    });

    if (nodes.length) {
      isoToElements.set(country.iso, nodes);
      const box = computeBoundingBox(nodes);
      if (box) {
        isoToBoundingBox.set(country.iso, box);
      }
    } else {
      console.warn(`No SVG nodes found for ${country.iso} using selectors`, country.selectors);
    }
  });

  const boxes = Array.from(isoToBoundingBox.values());
  if (boxes.length) {
    let merged = boxes[0]!;
    for (let index = 1; index < boxes.length; index += 1) {
      merged = mergeBoxes(merged, boxes[index]!);
    }
    combinedBoundingBox.value = merged;
  }

  const primaryBoxes = PRIMARY_VIEW_ISOS.map(
    (iso: string) => isoToBoundingBox.get(iso) ?? null
  ).filter((box): box is BoundingBox => Boolean(box));

  let baseDefault: BoundingBox | null = null;
  if (primaryBoxes.length) {
    baseDefault = primaryBoxes[0]!;
    for (let index = 1; index < primaryBoxes.length; index += 1) {
      baseDefault = mergeBoxes(baseDefault, primaryBoxes[index]!);
    }
  }

  if (!baseDefault) {
    baseDefault = combinedBoundingBox.value ?? initialViewBox.value ?? null;
  }

  if (baseDefault) {
    const supplementalBoxes = SUPPLEMENTAL_VIEW_ISOS.map(
      (iso: string) => isoToBoundingBox.get(iso) ?? null
    ).filter((box): box is BoundingBox => Boolean(box));
    defaultBoundingBox.value = extendBoundingBox(baseDefault, supplementalBoxes);
  } else {
    defaultBoundingBox.value = null;
  }

  baseTargetViewBox.value = null;
  updateStyles();
  scheduleViewBoxUpdate();
};

const handleResize = () => scheduleViewBoxUpdate();

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
  window.addEventListener('resize', handleResize);
  nextTick(() => {
    bindSvg();
    if (typeof ResizeObserver !== 'undefined' && svgContainer.value) {
      resizeObserver = new ResizeObserver(() => scheduleViewBoxUpdate());
      resizeObserver.observe(svgContainer.value);
    }
  });
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape);
  window.removeEventListener('resize', handleResize);
  resizeObserver?.disconnect();
  resizeObserver = null;
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  animationStart = null;
  activeViewBoxTarget = null;
  detachPanListeners();
  detachListeners();
  isoToElements.clear();
  isoToBoundingBox.clear();
});

watch([selectedCountryId, hoveredCountryId], () => {
  updateStyles();
});

watch(selectedCountryId, (iso) => {
  zoomExponent.value = iso ? 0 : DEFAULT_INITIAL_ZOOM_EXP;
  baseTargetViewBox.value = null;
  scheduleViewBoxUpdate();
});
</script>

<template>
  <div
    class="relative w-full aspect-square md:aspect-[2/1] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm"
  >
    <div class="map-stage h-full">
      <div class="zoom-controls">
        <button
          type="button"
          class="zoom-button"
          :disabled="!canZoomIn"
          aria-label="Zoom in"
          @click="zoomIn"
        >
          +
        </button>
        <button
          type="button"
          class="zoom-button"
          :disabled="!canZoomOut"
          aria-label="Zoom out"
          @click="zoomOut"
        >
          -
        </button>
      </div>

      <!-- eslint-disable-next-line vue/no-v-html -->
      <div ref="svgContainer" class="map-shell h-full w-full" v-html="worldSvgContent" />

      <Transition name="fade">
        <div v-if="selectedCountry" class="panel-layer">
          <div class="panel-backdrop" aria-hidden="true" @click="closePanel" />
          <div class="info-panel" role="dialog" :aria-label="selectedCountry.name">
            <button type="button" class="panel-close" @click="closePanel">
              <span class="sr-only">Close</span>
              <svg
                viewBox="0 0 24 24"
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>

            <p class="panel-eyebrow">{{ selectedCountry.name }}</p>
            <div class="space-y-4 hidden md:block">
              <div v-for="(inst, i) in selectedCountry.institutions" :key="i" class="flex flex-col">
                <h3 class="panel-title text-green-700 font-bold text-xl">{{ inst }}</h3>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.map-stage {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
}

.map-shell {
  position: relative;
  grid-area: 1 / 1;
  border-radius: 0;
  overflow: visible;
  width: 100%;
}

.map-shell :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  background: #f9fafb;
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
}

.map-shell :deep(svg:active) {
  cursor: grabbing;
}

.map-shell :deep(path) {
  fill: #e5e7eb;
  stroke: #ffffff;
  stroke-width: 0.5;
  transition:
    fill 0.2s ease,
    stroke 0.2s ease,
    filter 0.2s ease;
}

/* Highlighted countries */
.map-shell :deep(.country-shape) {
  cursor: pointer;
  fill: #16a34a;
  stroke: #ffffff;
  stroke-width: 0.8;
}

.map-shell :deep(.country-shape.is-hovered) {
  fill: #15803d;
}

.map-shell :deep(.country-shape.is-selected) {
  fill: #22c55e;
  stroke: #16a34a;
  filter: drop-shadow(0 0 12px rgba(34, 197, 94, 0.45));
}

.map-shell :deep(.country-shape:focus) {
  outline: none;
  filter: drop-shadow(0 0 12px rgba(34, 197, 94, 0.45));
}

.zoom-controls {
  position: absolute;
  top: clamp(0.75rem, 3vw, 1.5rem);
  left: clamp(0.75rem, 4vw, 1.5rem);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 3;
  pointer-events: auto;
}

.zoom-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #4b5563;
  font-size: 1.25rem;
  font-weight: 600;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.zoom-button:hover:not(:disabled) {
  background: #f3f4f6;
  color: #111827;
  transform: translateY(-1px);
}

.zoom-button:disabled {
  opacity: 0.45;
  cursor: default;
}

.panel-layer {
  grid-area: 1 / 1;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
  padding: clamp(1rem, 5vw, 2rem);
  padding-top: clamp(1rem, 6vh, 2rem);
}

.panel-backdrop {
  display: none;
}

.info-panel {
  position: sticky;
  top: clamp(1rem, 6vh, 2rem);
  align-self: flex-start;
  max-width: min(20rem, 90vw);
  margin-right: clamp(0rem, 3vw, 1rem);
  margin-top: clamp(0rem, 3vh, 0.5rem);
  background: #ffffff;
  color: #111827;
  border-radius: 1rem;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 1.25rem 1.5rem;
  pointer-events: auto;
  z-index: 2;
  border: 1px solid #e5e7eb;
}

.panel-close {
  position: absolute;
  top: -0.75rem;
  right: -0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  background: #ffffff;
  color: #6b7280;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: color 0.2s ease;
}

.panel-close:hover {
  color: #111827;
}

.panel-eyebrow {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #059669;
  margin-bottom: 0.25rem;
}

.panel-title {
  margin-bottom: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .panel-backdrop {
    display: block;
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    pointer-events: auto;
    z-index: 1;
  }

  .panel-layer {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    padding: 0 0 0.5rem 0.5rem;
    pointer-events: none;
    z-index: 10;
  }

  .info-panel {
    position: relative;
    width: 66%;
    max-width: none;
    margin: 0;
    padding: 1rem 1.25rem 1.25rem;
    border-radius: 0.75rem;
    pointer-events: auto;
    z-index: 2;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  }

  .panel-close {
    top: 0.5rem;
    right: 0.5rem;
    left: auto;
  }

  .panel-title {
    font-size: 1.125rem;
    line-height: 1.2;
  }
}
</style>
