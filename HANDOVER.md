# CoLocal Website - Project Handover Document

## 1. Project Overview
The CoLocal website is a monorepo application consisting of a modern frontend and a headless Content Management System (CMS). 
- **Frontend**: Nuxt 4 (Vue 3) with a strong emphasis on Server-Side Generation (SSG) for high performance and SEO.
- **CMS**: Strapi 5 (Node.js) serving as the headless backend for content administration.

## 2. Technology Stack
### Frontend
- **Framework**: Nuxt 4 (Vue 3, Composition API)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- **Maps**: Leaflet (`leaflet`, `@types/leaflet`)
- **Icons & Images**: Nuxt Icon (`@nuxt/icon`), Nuxt Image (`@nuxt/image`)
- **Markdown Processing**: `@nuxtjs/mdc`

### CMS (Backend)
- **Framework**: Strapi 5.23.4
- **Language**: TypeScript / Node.js
- **Database**: SQLite (default local development via `better-sqlite3`) and PostgreSQL (`pg`) configuration for production.
- **Plugins**: `@strapi/plugin-cloud`, `@strapi/plugin-users-permissions`

## 3. Architecture & Data Flow
- **BFF (Backend for Frontend) Pattern**: The frontend utilizes Nitro server API routes (e.g., `frontend/server/api/projects.get.ts`) to fetch raw data from Strapi. These routes act as an adapter layer, transforming Strapi's complex responses into clean domain models.
- **Pre-rendering (SSG)**: The Nuxt application is configured for Static Site Generation via Vercel Nitro presets. During the build phase (via the `nitro:config` hook in `nuxt.config.ts`), the application fetches all dynamic entities from Strapi (Projects, Publications, News, Education) and pre-renders their respective dynamic routes.
- **Asset Management**: Strapi media assets (images/documents) are mapped to absolute URLs in the Nitro API layer, ensuring they load properly on the frontend regardless of the environment.

## 4. Type System & Data Mapping
A critical part of the frontend architecture is how it handles types from Strapi. The project strictly separates the *raw API responses* from the *clean domain models* used in the UI. 

This is managed through two main type files in `frontend/types/`:

### `raw-strapi-types.ts`
This file contains the types that exactly match what the Strapi REST API returns.
- **Purpose**: To provide strict typing for the initial fetch requests made by Nitro server routes.
- **Structure**: It handles Strapi's deeply nested object structures (e.g., wrappers like `data` and `attributes`). 

### `content.ts`
This file contains the clean, app-friendly domain models used by the Vue components.
- **Purpose**: To provide a simple, flat structure for the UI to consume, hiding Strapi's complexity.
- **Structure**: Direct properties without `data` or `attributes` wrappers.

### How to Use Them
1. **Fetching**: In a Nitro API route (e.g., `server/api/projects.get.ts`), you fetch data using types from `raw-strapi-types.ts`.
2. **Mapping**: The API route acts as a mapper, extracting the inner data into a clean `Project` object defined in `content.ts`.
3. **Consuming**: The Vue components use composables like `useFetch('/api/projects')` which returns the clean `Project[]` array. Components should **never** import from `raw-strapi-types.ts`.

## 5. Environment Variables & Configuration
To run the project locally or in production, you must configure environment variables.

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:
- `NUXT_STRAPI_URL`: The base URL for the Strapi instance (e.g., `http://localhost:1337` for local development, or the Strapi Cloud URL for production).
- `NUXT_STRAPI_TOKEN`: A read-only API token generated from the Strapi Admin Panel required to fetch data.

### CMS (`cms/.env`)
Create a `.env` file in the `cms/` directory (Strapi will generate a default one during first-time setup, but you need):
- `HOST=0.0.0.0`
- `PORT=1337`
- `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`: Security keys (can be auto-generated).
- `DATABASE_CLIENT`: `sqlite` for local dev (default). Production uses PostgreSQL (`pg`) injected via Strapi Cloud.

## 6. Local Development & First-Time Setup
1. **Install Dependencies**: 
   - Navigate to `frontend/` and run `npm install`.
   - Navigate to `cms/` and run `npm install`.
2. **First-Time CMS Setup**:
   - Run `cd cms && npm run build` followed by `npm run develop`.
   - Open `http://localhost:1337/admin` in your browser. Since the local SQLite database is empty initially, you will be prompted to create the **first admin user**.
   - Create the user to access the local admin panel. 
   - *Note: Local development uses an empty SQLite database by default. You may need to manually enter dummy content or import a database dump to fully test the frontend.*
3. **Start Frontend**:
   - Ensure the CMS is running and you have generated a local API token (add to `frontend/.env`).
   - Run `cd frontend && npm run dev`.

## 7. Deployment, Hosting & Credentials
- **Frontend Deployment (Vercel)**: The frontend is hosted on Vercel. It is directly connected to the GitHub repository and automatically pulls and deploys updates from the `main` branch. Environment variables (`NUXT_STRAPI_URL`, `NUXT_STRAPI_TOKEN`) are configured in the Vercel dashboard.
- **CMS Hosting (Strapi Cloud)**: The Strapi backend is hosted on Strapi Cloud using their subscription plan. This abstracts away database provisioning (PostgreSQL) and server management.
- **Access & Credentials**: 
  - **Fahmid Mohtasin** holds the primary admin credentials and billing access for the Strapi Cloud production instance and the Vercel project.
  - Reach out to Fahmid to get an Admin User account created for the production Strapi panel or for access to Vercel/GitHub secrets.

## 8. Branching Strategy & CI/CD
- **Branching Strategy**: The project follows a simple feature-branch workflow. 
  - `main` is the production branch.
  - Create feature branches (e.g., `feature/add-gallery`, `fix/nav-bug`) and open Pull Requests against `main`.
- **CI/CD Pipeline**: 
  - There are no custom GitHub Actions currently configured.
  - **Vercel** handles the frontend CI/CD natively: Opening a PR generates a preview deployment. Merging to `main` triggers a production build and deployment.
- **Testing**: **There are no automated tests (unit, integration, or e2e) currently implemented in this project.** Testing is done manually during local development and via Vercel preview links.

## 9. Key Project Structure
```text
colocal-website/
├── frontend/                     # Nuxt 4 Application
│   ├── app/                      # Vue components and File-based routing system
│   ├── assets/                   # Global CSS (`main.css`)
│   ├── composables/              # Vue Composition API hooks
│   ├── server/api/               # Nitro API routes proxying/mapping Strapi responses
│   ├── types/                    # TypeScript definitions (raw-strapi-types.ts, content.ts)
│   └── nuxt.config.ts            # Nuxt configuration, pre-rendering rules, modules
├── cms/                          # Strapi 5 CMS
│   ├── config/                   # Database (database.ts) and server configuration
│   └── src/api/                  # Content-Types schemas and controllers
├── AGENTS.md                     # AI Agent Guidelines: Context, code style, and commands 
│                                 # meant for tools like GitHub Copilot or Cursor to follow.
└── HANDOVER.md                   # This document
```

## 10. Content Models (Strapi)
The CMS relies on several relational models. Understanding these is key to working with the API:

**Core Entities:**
- `project`: The central hub entity of the site. Everything (publications, news, etc.) revolves around or links to a project.
- `about`: Single type managing the global "About Us" page content.
- `home`: Single type managing the homepage hero and featured sections.
- `global`: Single type for global settings (navigation, footer links, site-wide SEO).
- `team`: Collection of team members displayed on the site.

**Project Sub-Entities (Relations):**
- `research-publication`: Academic papers or articles, strongly linked to a specific `project`.
- `news-event`: Updates, seminars, or policy dialogues, often linked to `projects`.
- `education-training`: Courses and workshops associated with a `project`.
- `resource`: General downloadable files or links.

**Taxonomy/Metadata:**
- `author`: Used to attribute `research-publications` or `news-events`. Can be internal team members or external contributors.
- `category` / `article`: Standard blog tagging and content structures.

## 11. Known Issues & Tech Debt
- **Circular Dependencies in Types/Mapping**: Because `Projects` contain `Publications`, and `Publications` contain `Projects`, the Nitro API mapping logic (in `frontend/server/api/projects.get.ts` etc.) actively avoids deep recursion to prevent infinite loops and massive payload sizes. Be careful when adding new bi-directional relations in Strapi.
- **Database Synchronization**: There is currently no automated script to sync the production Strapi Cloud database to the local SQLite database. Developers must manually recreate content structures locally or use Strapi's data transfer features if needed.
- **Lack of Automated Tests**: As noted above, the absence of a test suite means manual regression testing is required before merging PRs.

## 12. Points of Contact
For questions regarding the handover, architecture, or access, please contact:
- **Adib Ashraf**: (Previous Developer / Technical Architect)
- **Fahmid Mohtasin**: (Project Admin / Access Control for Vercel & Strapi Cloud)
