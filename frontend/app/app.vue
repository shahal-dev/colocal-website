<script setup lang="ts">
// Per-route og:url + canonical. Without this, every page inherits the
// hardcoded home-page og:url, and Facebook/WhatsApp canonicalize any shared
// link back to https://www.luccc.org/ and use the home page's OG tags.
// Pages that set their own og:url/canonical (registered later) still win.
const route = useRoute();
useHead(() => {
  const url = `https://www.luccc.org${route.path}`;
  return {
    meta: [{ property: 'og:url', content: url }],
    link: [{ rel: 'canonical', href: url }],
  };
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
