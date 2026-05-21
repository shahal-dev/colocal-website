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
            'COLOCAL builds capacity in Global South universities for education and research on locally led climate change adaptation in Bangladesh, Mozambique, Nepal, and Uganda.',
        },
        {
          name: 'keywords',
          content:
            'COLOCAL, locally led adaptation, LLA, climate change adaptation research, Global South university capacity building, LUCCC, Least Developed Countries Universities Consortium on Climate Change, South-South collaboration, NORHED-II, NORAD, Bangladesh, Mozambique, Nepal, Uganda, Norway',
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
          content: 'COLOCAL: Climate Adaptation Knowledge',
        },
        {
          property: 'og:description',
          content:
            'Empowering universities in the Global South to lead climate change adaptation research and education.',
        },
        { property: 'og:url', content: 'https://www.luccc.org/' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:image', content: 'https://www.luccc.org/favicon.png' },
        { property: 'og:image:alt', content: 'COLOCAL logo' },

        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: 'COLOCAL: Climate Adaptation Knowledge',
        },
        {
          name: 'twitter:description',
          content:
            'Empowering universities in the Global South to lead climate change adaptation research and education.',
        },
        { name: 'twitter:image', content: 'https://www.luccc.org/favicon.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://www.luccc.org/' },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },

  modules: ['@nuxt/fonts', '@nuxt/icon', '@nuxt/image', '@nuxt/eslint', '@nuxtjs/mdc'],

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
    '/news-events': { prerender: true },
    '/news-events/**': { prerender: true },
    '/resource-hub': { prerender: true },
    '/resource-hub/**': { prerender: true },
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
          }
        }

        // Generate publication routes (nested under projects)
        for (const pub of publications) {
          const id = pub.id;
          const projectRel = pub.attributes?.project?.data;
          const slug = projectRel?.attributes?.slug || projectRel?.slug;
          if (id && slug) {
            routes.push(`/projects/${slug}/research/${id}`);
          }
        }

        // Generate news/event routes (nested under projects)
        for (const news of newsEvents) {
          const id = news.id;
          const projectRel = news.attributes?.project?.data;
          const slug = projectRel?.attributes?.slug || projectRel?.slug;
          if (id && slug) {
            routes.push(`/projects/${slug}/outreach/${id}`);
          }
        }

        // Generate education/training routes (nested under projects)
        for (const edu of educationTrainings) {
          const id = edu.id;
          const projectRel = edu.attributes?.project?.data;
          const slug = projectRel?.attributes?.slug || projectRel?.slug;
          if (id && slug) {
            routes.push(`/projects/${slug}/education/${id}`);
          }
        }

        // Generate top-level routes (if any exist)
        routes.push('/education-training');
        routes.push('/news-events');
        routes.push('/resource-hub');

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
