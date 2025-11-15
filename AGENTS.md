# Agent Guidelines for CoLocal Website

## Project Structure
- Nuxt 4 (Vue 3) monorepo: `frontend/` (Nuxt app) + `cms/` (Strapi CMS)
- Frontend uses TypeScript with file-based routing in `app/pages/`, components in `app/components/`, composables in `composables/`, and server API routes in `server/api/`

## Build/Lint/Test Commands
- **Frontend dev**: `cd frontend && npm run dev` (http://localhost:3000)
- **CMS dev**: `cd cms && npm run develop` (http://localhost:1337)
- **Frontend build**: `cd frontend && npm run build`
- **Frontend preview**: `cd frontend && npm run preview`
- **Format code**: `cd frontend && npm run format` (Prettier)
- **Lint/fix**: `cd frontend && npm run lint` (ESLint with --fix)
- **Install deps**: `npm install` in respective directories

## Code Style Guidelines
- **Formatting**: 2 spaces, single quotes, semicolons, 100 char line length (see `.prettierrc`)
- **Imports**: Use `#imports` for Nuxt auto-imports, `~~/types/` for local types, relative imports for components
- **TypeScript**: Always use type annotations; prefer `type` over `interface`; use TypeScript `<script setup lang="ts">` in Vue SFCs
- **Vue**: Use `<script setup>` with `defineProps`/`defineEmits`; leverage Nuxt composables (useAsyncData, useFetch, useState, useHead)
- **Error handling**: Use try-catch for async operations; use `createError` in server routes; log errors with `console.error`
- **Naming**: camelCase for variables/functions, PascalCase for components/types, kebab-case for file names
- **Null safety**: Use optional chaining (`?.`) and nullish coalescing (`??`); handle null/undefined explicitly
