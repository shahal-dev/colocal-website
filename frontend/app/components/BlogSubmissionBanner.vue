<script setup lang="ts">
/**
 * "Click here to send submissions" banner — the call to action that replaced
 * the plain mailto line on the blog pages. The wording lives in the artwork,
 * so the alt text has to carry it for screen readers and for the case where
 * the image fails to load.
 *
 * The artwork is 16:9, which at the full width of a listing page is ~650px
 * tall and buries the posts, so the `strip` variant both caps the width and
 * crops the artwork to a banner band. The headline occupies roughly 29%–71%
 * of the artwork's height, so the tightest ratio used (32:9, exactly double
 * 16:9, showing the middle half) still leaves a margin above and below it —
 * don't crop tighter than that. In the narrow post sidebar the full 16:9 is
 * only ~170px tall and cropping would eat into the left-aligned headline, so
 * there it renders whole.
 */
withDefaults(
  defineProps<{
    variant?: 'strip' | 'full';
  }>(),
  { variant: 'full' }
);

const SUBMISSIONS_EMAIL = 'maeeshasiddiqui1@gmail.com';
</script>

<template>
  <a
    :href="`mailto:${SUBMISSIONS_EMAIL}`"
    class="group block overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
    :class="
      variant === 'strip'
        ? 'mx-auto w-full max-w-xl aspect-[2/1] sm:aspect-[3/1] md:aspect-[32/9]'
        : ''
    "
    :aria-label="`Click here to send blog submissions to ${SUBMISSIONS_EMAIL}`"
  >
    <img
      src="/blog-submissions-banner.svg"
      alt="Click here to send submissions"
      class="block w-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
      :class="variant === 'strip' ? 'h-full' : 'h-auto'"
      loading="lazy"
    />
  </a>
</template>
