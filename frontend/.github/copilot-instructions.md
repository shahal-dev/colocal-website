# Copilot Instructions for AI Coding Agents

## Project Overview
- This is a Nuxt 4 (Vue 3) monorepo with at least two main folders: `frontend/` (Nuxt app) and `cms/` (Strapi CMS).
- The `frontend/` directory contains a Nuxt app using TypeScript, with source code in `app/` (including `pages/`, `assets/`, etc.).
- The project uses modern Nuxt conventions: file-based routing, auto-imports, and composables.

## Key Workflows
- **Install dependencies:** Use your preferred package manager (`npm install`, `yarn install`, `pnpm install`, or `bun install`).
- **Development server:** Start with `npm run dev` (or equivalent for your package manager). Default port is `http://localhost:3000`.
- **Production build:** Use `npm run build` and preview with `npm run preview`.

## Code Structure & Patterns
- **Pages:** Located in `app/pages/`. Each `.vue` file is a route. Example: `app/pages/index.vue` is the home page.
- **Global styles:** In `app/assets/css/main.css`.
- **Configuration:** Main config in `nuxt.config.ts`. TypeScript is used throughout.
- **Public assets:** Place static files in `public/`.
- **ESLint:** Project uses strict linting (see `eslint.config.mjs`). Follows Nuxt/Vue/TypeScript best practices.

## Conventions & Best Practices
- **Use Nuxt composables and auto-imports** for state, routing, and utilities.
- **Prefer `defineProps`/`defineEmits`** in Vue SFCs for props/events.
- **Follow ESLint rules** (auto-fix with `npm run lint` if available).
- **TypeScript:** Use type annotations and interfaces for all new code.
- **Component structure:** Organize reusable components in `app/components/` (if present).

## Integration & Extensibility
- **External APIs:** Integrate via server routes or composables as per Nuxt 3 conventions.
- **CMS:** If integrating with `cms/`, coordinate via API endpoints or shared types (not detailed here).

## References
- [Nuxt 4 Docs](https://nuxt.com/docs/4.x/getting-started/introduction)
- See `frontend/README.md` for up-to-date workflow commands.
- See `nuxt.config.ts` and `eslint.config.mjs` for project-specific configuration.

---

**When in doubt, prefer idiomatic Nuxt 4 and Vue 3 patterns.**
