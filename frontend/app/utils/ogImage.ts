import type { StrapiMedia } from '../../types/content';

export type OgImage = {
  url: string;
  width?: number;
  height?: number;
};

export const FALLBACK_OG_IMAGE: OgImage = {
  url: 'https://www.luccc.org/og-image.jpg',
  width: 1280,
  height: 853,
};

type MediaCandidate = StrapiMedia | string | null | undefined;

/**
 * Pick the best Open Graph image from a list of candidate media
 * (cover first, then carousel images, etc.).
 *
 * Social crawlers choke on original uploads: WhatsApp silently drops
 * og:images larger than ~600 KB and Facebook's first scrape is unreliable
 * with multi-MB files, so prefer Strapi's resized `large`/`medium` formats
 * (Strapi only generates formats smaller than the original, so the original
 * is used when it's already small enough to have no formats).
 */
export function ogImageMeta(...candidates: MediaCandidate[]): OgImage {
  for (const media of candidates) {
    if (!media) continue;
    if (typeof media === 'string') {
      if (media.trim()) return { url: media.trim() };
      continue;
    }
    const best = media.formats?.large || media.formats?.medium;
    const url = best?.url || media.url;
    if (!url) continue;
    return {
      url,
      width: best?.width ?? media.width ?? undefined,
      height: best?.height ?? media.height ?? undefined,
    };
  }
  return FALLBACK_OG_IMAGE;
}

/** Standard og:image / twitter:image meta entries for useHead(). */
export function ogImageTags(img: OgImage, alt: string) {
  return [
    { property: 'og:image', content: img.url },
    { property: 'og:image:alt', content: alt },
    ...(img.width ? [{ property: 'og:image:width', content: String(img.width) }] : []),
    ...(img.height ? [{ property: 'og:image:height', content: String(img.height) }] : []),
    { name: 'twitter:image', content: img.url },
    { name: 'twitter:image:alt', content: alt },
  ];
}
