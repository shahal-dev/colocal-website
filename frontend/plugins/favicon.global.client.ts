import { defineNuxtPlugin, useHead } from '#imports';

export default defineNuxtPlugin(async () => {
  try {
    const { favicon } = await $fetch<{ favicon: { url: string } | null }>('/api/global');
    if (!favicon?.url) return;

    const iconUrl = favicon.url;
    const icoHref = '/favicon.ico'; // fallback if any

    const head = useHead({
      link: [
        { rel: 'icon', type: 'image/png', href: iconUrl },
        { rel: 'icon', type: 'image/x-icon', href: icoHref },
      ],
    });
    return head;
  } catch (e) {
    // Silently ignore; site will use default favicon.ico
    console.warn('Favicon plugin: unable to load global favicon', e);
  }
});
