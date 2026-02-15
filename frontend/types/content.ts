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

// New simple components
export type Country = {
  name: string; // required text
};

export type Education = {
  type: string; // required text
};

export type PublicationType = {
  type: string; // required text
};

export type Theme = {
  theme: string; // required text
};

// --- Collection Types ----------------------------------------------------
export interface Author {
  id: number;
  name: string; // required
  title: string | null; // optional title/position
  avatar: StrapiMedia | null; // optional in Strapi → can be null
  email: string | null; // optional in Strapi → can be null
  research_publications: ResearchPublication[] | null; // optional in Strapi → can be null
  colocal: boolean; // required
  admin: boolean; // optional admin flag
  country: 'norway' | 'bangladesh' | 'mozambique' | 'nepal' | 'uganda' | null; // optional country
}

export interface ResearchPublication {
  id: number;
  title: string; // required
  secondaryTitle?: string | null;
  abstract: string; // required (RichText Markdown stored as string)
  date: string; // required (Date as ISO string)
  authors_text?: string | null; // optional text field for author names
  tags: Tag[] | null; // optional repeatable component → can be null
  url: string; // required
  file: StrapiMedia | null; // optional media → can be null
  imageCover?: StrapiMedia | null; // optional hero/feature image
  images?: StrapiMedia[] | null; // optional gallery
  project: Project | null; // optional relation (many-to-one to Project) → can be null
  publication_type: PublicationType; // required (component)
  theme?: Theme | null; // optional component → can be null
  country?: Country | null; // optional component → can be null
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
  news_events?: NewsEvent[] | null; // optional relation (many-to-many from News/Event)
  education_trainings?: EducationTraining[] | null; // optional relation (one-to-many from Education/Training)
}

// New collection types ----------------------------------------------------
export interface EducationTraining {
  id: number;
  title: string; // required
  secondaryTitle?: string | null;
  date: string; // required (Date as ISO string)
  cover: StrapiMedia; // required media
  images?: StrapiMedia[] | null; // optional gallery
  body: string; // required (RichText Markdown stored as string)
  type?: Education | null; // optional component
  section: 'module development' | 'short course' | 'training workshop' | null; // optional section
  lla: boolean; // required
  project?: Project | null; // optional relation (many-to-one to Project)
}

export interface NewsEvent {
  id: number;
  title: string; // required
  secondaryTitle?: string | null;
  date: string; // required (Date as ISO string)
  cover: StrapiMedia; // required media
  images?: StrapiMedia[] | null; // optional gallery
  body: string; // required (RichText Markdown stored as string)
  section: 'policy dialogue' | 'seminar and conference' | null; // optional section
  lla: boolean; // required
  blog?: boolean; // optional flag for blog posts
  authors?: Author[] | null; // optional relation (one-to-many to Author)
  projects?: Project[] | null; // optional relation (many-to-many to Project)
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

// --- Components used on About page --------------------------------------
export interface Quote {
  body: string; // quote text
  author: Author; // relation to Author
}
