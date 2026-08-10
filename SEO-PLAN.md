# SEO Change Plan

Context: ranking the "colocal" brand term higher is mostly an off-site authority problem
(domain is `luccc.org`, not a colocal-branded domain; competitor is an established chocolate
brand). This document only covers the **on-site technical fixes** found by reading the code —
things that are real, verifiable bugs/gaps, not guesses. Off-site actions (backlinks, Search
Console, social profiles) are listed at the bottom as things only the project team can do.

Nothing here is implemented yet — this is the proposal to review before I touch code.

---

## 1. Duplicate content across mirrored URLs (canonical tags fight each other)

**Finding:** the same Strapi entity is rendered at 2–3 different URLs, and every page
self-canonicalizes (`frontend/app/app.vue:7-13` sets `<link rel="canonical">` to
`https://www.luccc.org` + the *current* path on every route, with no exceptions). That means
Google sees near-identical content as separate pages, each claiming to be the canonical one —
which splits ranking signal instead of consolidating it.

Confirmed overlaps:
| Content type | URLs serving the same entity |
|---|---|
| Publication | `/projects/{slug}/research/{id}` **and** `/resource-hub/{id}` |
| News/event | `/projects/{slug}/outreach/{id}` **and** `/news-events/{id}` |
| Education/training | `/projects/{slug}/education/{id}` **and** `/education-training/{id}` **and** `/resource-hub/{id}` |

All of these are also listed as separate `<url>` entries in `sitemap.xml.ts`, so we're actively
telling Google to index both copies.

**Proposed fix:** pick one URL per entity as canonical (the project-nested one, e.g.
`/projects/{slug}/research/{id}`, since it has richer context/breadcrumbs) and point the
"hub" copy's canonical tag at it instead of itself.

Example — `frontend/app/pages/resource-hub/[id].vue`:

```ts
// before: no canonical override, app.vue's global self-canonical applies
usePageSeo(() => {
  const i = item.value;
  return {
    title: i?.title ? `${i.title} — Resource Hub` : 'Resource Hub',
    ogTitle: i?.title,
    description: i?.abstract || i?.body,
    images: [i?.imageCover, i?.cover, ...(i?.images || [])],
  };
});

// after: still renders normally, but tells Google the "real" URL is the project page
usePageSeo(() => {
  const i = item.value;
  return {
    title: i?.title ? `${i.title} — Resource Hub` : 'Resource Hub',
    ogTitle: i?.title,
    description: i?.abstract || i?.body,
    images: [i?.imageCover, i?.cover, ...(i?.images || [])],
  };
});

useHead(() => {
  const projectSlug = publication.value?.project?.slug || education.value?.project?.slug;
  if (!projectSlug) return {};
  const canonicalPath = publication.value
    ? `/projects/${projectSlug}/research/${id}`
    : `/projects/${projectSlug}/education/${id}`;
  return { link: [{ rel: 'canonical', href: `https://www.luccc.org${canonicalPath}` }] };
});
```

Same pattern applies to `news-events/[id].vue` (canonicalize to
`/projects/{slug}/outreach/{id}`) and `education-training/[id].vue` (canonicalize to
`/projects/{slug}/education/{id}`).

**Sitemap:** once canonical tags point elsewhere, also stop listing the non-canonical URL in
`sitemap.xml.ts` (currently pushes both `/resource-hub/{id}` and the project-nested URL for
every publication/education item — `frontend/server/routes/sitemap.xml.ts:148-218`).

**Risk:** low. Doesn't change what users see, only which URL search engines are told to prefer.
If an item has no parent project (orphaned), fall back to self-canonical (current behavior).

---

## 2. Missing meta on the project blog listing page

**Finding:** `frontend/app/pages/projects/[slug]/blog.vue` is a real content page (paginated
grid of COLOCAL blog posts) but never calls `useHead`/`useSeoMeta`/`usePageSeo`. It silently
inherits the global default title/description from `nuxt.config.ts`
(`"COLOCAL — Co-creating Knowledge for Local Climate Adaptation"`), same as the homepage. Every
project's blog listing currently has an identical, non-descriptive `<title>` — a second,
smaller instance of the duplicate-content problem above, and a missed chance to rank for
"[project name] blog" type queries.

Example fix, mirroring the pattern already used in `frontend/app/pages/news-events.vue:6-8`:

```ts
// added near the top of <script setup>, after `slug` is defined
useHead({
  title: `COLOCAL Blog — ${slug}`,
});
```

Better version once project data is available in this file (it currently only reads
`newsData`/`authorsData`, not the project name) — fetch or reuse the shared project state
(`project:${slug}`, already populated by the parent `projects/[slug].vue`) so the title uses
the project's actual name instead of the raw slug.

**Risk:** none — additive only.

---

## 3. Empty `sameAs` in the Organization schema (needs input from you)

**Finding:** `frontend/nuxt.config.ts` already ships an `Organization` JSON-LD block
(`'@id': 'https://www.luccc.org/#organization'`) but `sameAs: []` is empty. `sameAs` is how you
tell Google "this entity is the same as these other verified profiles" — it's one of the
strongest, cheapest signals for disambiguating a brand name in the Knowledge Graph (this is
literally the mechanism that helps Google tell your "colocal" apart from an unrelated
chocolate brand).

**What I need from you:** COLOCAL's official LinkedIn/X/YouTube/Facebook page URLs, and any
Wikipedia/Wikidata entry if one exists. Once I have them:

```ts
// before
sameAs: [],

// after (example — replace with your real profile URLs)
sameAs: [
  'https://www.linkedin.com/company/colocal-luccc',
  'https://twitter.com/colocal_luccc',
],
```

**Risk:** none, but it's a no-op fix without real URLs — I won't fabricate placeholder links.

---

## Not code changes (listed for completeness, not part of this plan)

These are the things that actually move the needle on beating an established consumer brand for
the bare word "colocal" — none of them are a file I can edit:
- Backlinks from partner university sites, NORAD/NORHED-II pages, press coverage.
- Google Search Console: confirm current position/impressions for the query "colocal" (baseline
  before/after).
- Google Business Profile listings for partner institutions, if applicable.
- Wikipedia/Wikidata entry, if COLOCAL/LUCCC meets notability guidelines.

---

## Suggested order

1. Fix #2 (blog.vue meta) — trivial, zero risk.
2. Fix #1 (canonicals + sitemap dedup) — moderate, touches 3 files, should be tested against a
   live Strapi instance before merging (need to confirm `project.slug` is actually present on
   the `publication`/`education`/`news` fetch responses used in those three `[id].vue` files).
3. Fix #3 — blocked on you providing real profile URLs.

Let me know which of these to implement, or if you want #1 scoped down further (e.g. just stop
double-listing in the sitemap without touching canonical tags, as a smaller first step).
