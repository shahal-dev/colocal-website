import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'COLOCAL — Co-creating Knowledge for Local Climate Adaptation',
      titleTemplate: '%s',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        {
          name: 'description',
          content:
            'COLOCAL co-creates knowledge for locally led adaptation (LLA) to climate change with Global South universities in Bangladesh, Mozambique, Nepal, Uganda and Norway. A NORHED-II programme advancing the LUCCC consortium of LDC universities through joint research, PhD and Masters training, and South-South collaboration on climate adaptation.',
        },
        {
          name: 'keywords',
          content:
            'COLOCAL, LUCCC, locally led adaptation, LLA, climate change adaptation, climate adaptation research, climate change education, Global South universities, LDC universities, Least Developed Countries Universities Consortium on Climate Change, South-South collaboration, climate capacity building, NORHED-II, NORAD, ICCCAD, IUB, Independent University Bangladesh, Makerere University, MUCCRI, Eduardo Mondlane University, Pokhara University, SchEMS, Norwegian University of Life Sciences, Bangladesh, Mozambique, Nepal, Uganda, Norway, disaster management, pastoral adaptation, community resilience, climate policy, climate change PhD, climate change Masters, vulnerable communities, Paris Agreement Article 11, co-creating knowledge for local adaptation',
        },
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'COLOCAL / LUCCC' },
        { name: 'theme-color', content: '#15803d' },
        {
          name: 'google-site-verification',
          content: 'E4C8VPjbSKp-J314PbO-sggawNXkZPBmxJlrB828WmY',
        },

        { property: 'og:site_name', content: 'COLOCAL — LUCCC' },
        {
          property: 'og:title',
          content: 'COLOCAL — Co-creating Knowledge for Local Climate Adaptation | LUCCC',
        },
        {
          property: 'og:description',
          content:
            'COLOCAL co-creates knowledge with Global South universities in Bangladesh, Mozambique, Nepal, Uganda and Norway for locally led adaptation (LLA) to climate change — a NORHED-II programme advancing the LUCCC consortium of LDC universities.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:image', content: 'https://www.luccc.org/og-image.jpg' },
        { property: 'og:image:alt', content: 'COLOCAL — co-creating climate adaptation knowledge with Global South universities' },
        { property: 'og:image:width', content: '1280' },
        { property: 'og:image:height', content: '853' },

        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: 'COLOCAL — Co-creating Knowledge for Local Climate Adaptation | LUCCC',
        },
        {
          name: 'twitter:description',
          content:
            'Locally led adaptation (LLA) to climate change with Global South universities in Bangladesh, Mozambique, Nepal, Uganda and Norway. A NORHED-II programme advancing the LUCCC consortium.',
        },
        { name: 'twitter:image', content: 'https://www.luccc.org/og-image.jpg' },
        { name: 'twitter:image:alt', content: 'COLOCAL — co-creating climate adaptation knowledge with Global South universities' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': 'https://www.luccc.org/#organization',
                name: 'LUCCC',
                alternateName: ['COLOCAL', 'Least Developed Countries Universities Consortium on Climate Change'],
                url: 'https://www.luccc.org',
                logo: 'https://www.luccc.org/favicon.png',
                description:
                  'COLOCAL is a NORHED-II funded programme under the LUCCC consortium co-creating knowledge for locally led adaptation to climate change with Global South universities.',
                sameAs: [],
              },
              {
                '@type': 'WebSite',
                '@id': 'https://www.luccc.org/#website',
                url: 'https://www.luccc.org',
                name: 'COLOCAL — LUCCC',
                publisher: { '@id': 'https://www.luccc.org/#organization' },
                potentialAction: {
                  '@type': 'SearchAction',
                  target: 'https://www.luccc.org/?q={search_term_string}',
                  'query-input': 'required name=search_term_string',
                },
              },
            ],
          }),
        },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },

  modules: ['@nuxt/fonts', '@nuxt/icon', '@nuxt/image', '@nuxt/eslint', '@nuxtjs/mdc'],

  // @nuxt/image: allow IPX to optimize images served from the Strapi backend.
  // Strapi Cloud serves the API from `<id>.strapiapp.com` but uploaded media
  // from a separate `<id>.media.strapiapp.com` CDN host — both must be
  // whitelisted or @nuxt/image silently passes the original through unoptimized.
  //
  // provider is forced to 'ipx' (self-hosted, uses the `sharp` dependency)
  // instead of leaving it on 'auto' — on Vercel, 'auto' silently activates
  // the 'vercel' provider, which bills every resize against Vercel's Image
  // Optimization transformations quota and exhausted the free tier.
  image: {
    provider: 'ipx',
    densities: [1],
    domains: (() => {
      let host = 'localhost';
      try {
        host = new URL(process.env.NUXT_STRAPI_URL || 'http://localhost:1337').hostname;
      } catch {
        host = 'localhost';
      }
      // Derive the `.media.` CDN host (no-op for hosts without a subdomain, e.g. localhost).
      const mediaHost = host.replace(/^([^.]+)\./, '$1.media.');
      return Array.from(new Set([host, mediaHost]));
    })(),
  },

  // Static site generation
  ssr: true,

  nitro: {
    preset: 'vercel',
    prerender: {
      crawlLinks: true,
      routes: ['/', '/sitemap.xml'],
      failOnError: false,
    },
  },

  // Route rules for static generation
  routeRules: {
    '/': { prerender: true },
    '/about/**': { prerender: true },
    '/projects': { prerender: true },
    '/projects/**': { prerender: true },
    '/education-training': { prerender: true },
    '/education-training/**': { prerender: true },
    '/research-publications': { prerender: true },
    '/research-publications/**': { prerender: true },
    '/outreach': { prerender: true },
    '/outreach/**': { prerender: true },
    '/blog': { prerender: true },
    '/blog/**': { prerender: true },

    // Legacy URLs kept alive for inbound links and search engines
    '/news-events': { redirect: { to: '/outreach', statusCode: 301 } },
    '/news-events/**': { redirect: { to: '/outreach/**', statusCode: 301 } },
    '/resource-hub': { redirect: { to: '/research-publications', statusCode: 301 } },
    '/resource-hub/**': { redirect: { to: '/research-publications/**', statusCode: 301 } },
  },

  // Hooks to generate dynamic routes
  hooks: {
    async 'nitro:config'(nitroConfig) {
      if (nitroConfig.dev) return;

      const strapiUrl = process.env.NUXT_STRAPI_URL || 'http://localhost:1337';
      const token = process.env.NUXT_STRAPI_TOKEN || '';
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      try {
        // Fetch all projects
        const projectsRes = await fetch(`${strapiUrl}/api/projects?pagination[limit]=100`, {
          headers,
        });
        const projectsData = await projectsRes.json();
        const projects = projectsData.data || [];

        // Fetch all publications
        const pubsRes = await fetch(
          `${strapiUrl}/api/research-publications?pagination[limit]=1000`,
          { headers }
        );
        const pubsData = await pubsRes.json();
        const publications = pubsData.data || [];

        // Fetch all news/events
        const newsRes = await fetch(`${strapiUrl}/api/news-events?pagination[limit]=1000`, {
          headers,
        });
        const newsData = await newsRes.json();
        const newsEvents = newsData.data || [];

        // Fetch all education/training
        const eduRes = await fetch(`${strapiUrl}/api/education-trainings?pagination[limit]=1000`, {
          headers,
        });
        const eduData = await eduRes.json();
        const educationTrainings = eduData.data || [];

        const routes: string[] = [];

        // Generate project routes
        for (const project of projects) {
          const slug = project.attributes?.slug || project.slug;
          if (slug) {
            routes.push(`/projects/${slug}`);
            routes.push(`/projects/${slug}/research`);
            routes.push(`/projects/${slug}/outreach`);
            routes.push(`/projects/${slug}/education`);
            routes.push(`/projects/${slug}/team`);
            routes.push(`/projects/${slug}/blog`);
          }
        }

        // Generate publication routes (nested under projects)
        for (const pub of publications) {
          const id = pub.documentId || pub.id;
          const projectRel = pub.attributes?.project?.data;
          const slug = projectRel?.attributes?.slug || projectRel?.slug;
          if (id && slug) {
            routes.push(`/projects/${slug}/research/${id}`);
          }
        }

        // Generate news/event routes (nested under projects)
        for (const news of newsEvents) {
          const id = news.documentId || news.id;
          const projectRel = news.attributes?.project?.data;
          const slug = projectRel?.attributes?.slug || projectRel?.slug;
          if (id && slug) {
            routes.push(`/projects/${slug}/outreach/${id}`);
          }
        }

        // Generate education/training routes (nested under projects)
        for (const edu of educationTrainings) {
          const id = edu.documentId || edu.id;
          const projectRel = edu.attributes?.project?.data;
          const slug = projectRel?.attributes?.slug || projectRel?.slug;
          if (id && slug) {
            routes.push(`/projects/${slug}/education/${id}`);
          }
        }

        // Generate top-level routes (if any exist)
        routes.push('/education-training');
        routes.push('/research-publications');
        routes.push('/outreach');
        routes.push('/blog');

        nitroConfig.prerender = nitroConfig.prerender || {};
        nitroConfig.prerender.routes = nitroConfig.prerender.routes || [];
        nitroConfig.prerender.routes.push(...routes);

        console.log(`✅ Pre-rendering ${routes.length} dynamic routes`);
      } catch (error) {
        console.warn('⚠️  Failed to fetch dynamic routes for prerendering:', error);
      }
    },
  },

  fonts: {
    families: [
      {
        name: 'Open Sans',
        provider: 'google',
        weights: [400, 600, 700],
      },
      {
        name: 'Poppins',
        provider: 'google',
        weights: [400, 600, 700],
      },
    ],
  },

  // Runtime config for Strapi
  runtimeConfig: {
    strapi: {
      url: 'http://localhost:1337', // can be overridden by NUXT_STRAPI_URL
      token: '', // read-only API token; override via NUXT_STRAPI_TOKEN
    },
    public: {
      // expose only the URL if needed client-side; keep token private
      strapiUrl: 'http://localhost:1337',
    },
  },
});
