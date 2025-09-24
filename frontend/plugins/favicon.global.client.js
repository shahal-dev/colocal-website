export default defineNuxtPlugin(async () => {
  try {
    const { favicon } = await $fetch('/api/global');
    if (!favicon || !favicon.url) return;

    // Pick a reasonable PNG size if available; else use original
    const formats = favicon.formats || {};
    const candidateKeys = ['thumbnail', 'small', '32x32', '16x16'];
    let href = favicon.url;
    for (const k of candidateKeys) {
      if (formats[k] && formats[k].url) {
        href = formats[k].url;
        break;
      }
    }

    // Let Nuxt manage the head; adding after default entries helps override
    useHead({
      link: [
        { rel: 'icon', type: 'image/png', href: href, sizes: 'any' },
        { rel: 'shortcut icon', type: 'image/png', href: href, sizes: 'any' },
      ],
    });
  } catch (e) {
    // Silently ignore; site will use default favicon.ico
    console.warn('Favicon plugin: unable to load global favicon', e);
  }
});
