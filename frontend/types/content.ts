// Shared Strapi types and app domain models for content used in the frontend
// These are app-friendly shapes (not the raw Strapi REST shape with data/attributes)

// --- Media ---------------------------------------------------------------
export type StrapiImageFormat = {
  ext?: string | null;
  url: string;
  hash?: string;
  mime?: string;
  name?: string;
  path?: string | null;
  size?: number;
  width?: number;
  height?: number;
};

export type StrapiMedia = {
  id: number;
  url: string; // absolute or relative URL (depends on Strapi config)
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
    [key: string]: StrapiImageFormat | undefined;
  };
  mime?: string;
  size?: number;
  name?: string;
  provider?: string;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
};

// --- Components ----------------------------------------------------------
export type Objective = {
  objective: string; // required text
};

export type Tag = {
  tag: string; // required text
};

// --- Collection Types ----------------------------------------------------
export interface Author {
  id: number;
  name: string; // required
  avatar: StrapiMedia | null; // optional in Strapi → can be null
  email: string | null; // optional in Strapi → can be null
  research_publications: ResearchPublication[] | null; // optional in Strapi → can be null
  colocal: boolean; // required
}

export interface ResearchPublication {
  id: number;
  title: string; // required
  abstract: string; // required (RichText Markdown stored as string)
  date: string; // required (Date as ISO string)
  authors: Author[]; // required relation (one-to-many to Author)
  tags: Tag[] | null; // optional repeatable component → can be null
  url: string; // required
  file: StrapiMedia | null; // optional media → can be null
  project: Project | null; // optional relation (many-to-one to Project) → can be null
  lla: boolean | false; // whether it is a LLA publication (default: false)
}

export interface Project {
  id: number;
  shortTitle: string; // required
  longTitle: string; // required
  slug: string; // required
  shortDescription: string; // required
  longDescription: string; // required (RichText Markdown stored as string)
  about: string; // required (RichText Markdown stored as string)
  objectives: Objective[] | null; // optional repeatable component → can be null
  cover: StrapiMedia; // required media
  images: StrapiMedia[] | null; // optional multiple media → can be null
  research_publications: ResearchPublication[] | null; // optional relation (one-to-many) → can be null
  active: boolean | false; // whether the project is active
  programme: boolean | false; // whether it is a programme
}

// --- Helpers -------------------------------------------------------------
// Optionally export a helper to represent paginated lists
export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};
