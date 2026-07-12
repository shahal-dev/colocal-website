import { computed } from 'vue';
import type { StrapiMedia } from '../../types/content';
import { excerpt } from '../utils/excerpt';

type MediaCandidate = StrapiMedia | string | null | undefined;

export type PageSeo = {
  /** Browser-tab / search-result title. */
  title: string;
  /** Share-card title; defaults to `title`. */
  ogTitle?: string | null;
  /** Plain text or markdown; stripped and truncated for the meta tags. */
  description?: string | null;
  /** Candidate share images in priority order; first usable one wins. */
  images?: MediaCandidate[];
};

const FALLBACK_IMAGE = { url: 'https://www.luccc.org/og-image.jpg', width: 1280, height: 853 };

// WhatsApp drops og:images over ~600 KB and Facebook is unreliable with
// multi-MB originals, so prefer Strapi's resized formats over the original
// upload (Strapi only generates formats smaller than the original).
function pickImage(candidates: MediaCandidate[] = []) {
  for (const media of candidates) {
    if (!media) continue;
    if (typeof media === 'string') {
      if (media.trim()) return { url: media.trim(), width: undefined, height: undefined };
      continue;
    }
    const fmt = media.formats?.large || media.formats?.medium;
    const url = fmt?.url || media.url;
    if (!url) continue;
    return {
      url,
      width: fmt?.width ?? media.width ?? undefined,
      height: fmt?.height ?? media.height ?? undefined,
    };
  }
  return FALLBACK_IMAGE;
}

/** Sets title, description and share-image (Open Graph + Twitter) meta for a page. */
export function usePageSeo(get: () => PageSeo) {
  const seo = computed(get);
  const image = computed(() => pickImage(seo.value.images));
  const ogTitle = () => seo.value.ogTitle || seo.value.title;
  const description = () => {
    const d = seo.value.description;
    return typeof d === 'string' ? excerpt(d, 160) : '';
  };

  useSeoMeta({
    title: () => seo.value.title,
    description,
    ogTitle,
    ogDescription: description,
    ogImage: () => image.value.url,
    ogImageAlt: ogTitle,
    ogImageWidth: () => image.value.width,
    ogImageHeight: () => image.value.height,
    twitterCard: 'summary_large_image',
    twitterTitle: ogTitle,
    twitterDescription: description,
    twitterImage: () => image.value.url,
    twitterImageAlt: ogTitle,
  });
}
