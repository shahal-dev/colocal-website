// --- Raw Strapi REST shapes (subset we use) ---------------------------------
export type RawEntity<T> = { id: number; documentId?: string; attributes: T };
export type RawRelationOne<T> = { data: RawEntity<T> | null };
export type RawRelationMany<T> = { data: RawEntity<T>[] };

export type RawImageFormat = {
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

export type RawMediaAttributes = {
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, RawImageFormat>;
  mime?: string;
  size?: number;
  name?: string;
  provider?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type RawAuthorAttributes = {
  name: string;
  title?: string | null;
  avatar?: RawRelationOne<RawMediaAttributes>;
  email?: string | null;
  colocal: boolean;
  admin?: boolean;
  country?: 'norway' | 'bangladesh' | 'mozambique' | 'nepal' | 'uganda' | null;
};

export type RawTagComponent = { tag: string };
export type RawObjectiveComponent = { objective: string };
export type RawCountryComponent = { name: string };
export type RawEducationComponent = { type: string };
export type RawPublicationTypeComponent = { type: string };
export type RawThemeComponent = { theme: string };

export type RawPublicationAttributes = {
  title: string;
  secondary_title?: string | null;
  abstract: string;
  date: string;
  string_date?: string | null;
  authors_text?: string | null; // optional text field for author names
  tags?: RawTagComponent[] | null;
  url: string;
  file?: RawRelationOne<RawMediaAttributes>;
  image_cover?: RawRelationOne<RawMediaAttributes> | null;
  images?: RawRelationMany<RawMediaAttributes> | null;
  // project?: RawRelationOne<RawProjectAttributes> // avoid cycle
  publication_type?: RawPublicationTypeComponent; // component
  theme?: RawThemeComponent | null; // optional component
  country?: RawCountryComponent | null; // optional component
};

export type RawProjectAttributes = {
  shortTitle: string;
  longTitle: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  about: string;
  objectives?: RawObjectiveComponent[] | null;
  cover: RawRelationOne<RawMediaAttributes>;
  images?: RawRelationMany<RawMediaAttributes> | null;
  research_publications?: RawRelationMany<RawPublicationAttributes> | null;
  active?: boolean;
  programme?: boolean;
  education_trainings?: RawRelationMany<_RawEducationTrainingAttributes> | null;
  news_events?: RawRelationMany<_RawNewsEventAttributes> | null;
};

// Strapi list responses (raw vs flattened)
export type StrapiPagination = { page: number; pageSize: number; pageCount: number; total: number };
export type StrapiListResponseRaw<T> = {
  data: RawEntity<T>[];
  meta: { pagination: StrapiPagination };
};

// --- Flattened shapes (Strapi v5 or transform enabled) --------------------
export type FlatMedia = {
  id: number;
  documentId?: string;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, RawImageFormat>;
  mime?: string;
  size?: number;
  name?: string;
  provider?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type FlatAuthor = {
  id: number;
  documentId?: string;
  name: string;
  title?: string | null;
  avatar?: FlatMedia | null;
  email?: string | null;
  colocal: boolean;
  admin?: boolean;
  country?: 'norway' | 'bangladesh' | 'mozambique' | 'nepal' | 'uganda' | null;
};

export type FlatPublication = {
  id: number;
  documentId?: string;
  title: string;
  secondary_title?: string | null;
  abstract: string;
  date: string;
  string_date?: string | null;
  URL?: string; // original field name may be URL in Strapi
  url?: string; // or lower-case in some setups
  authors_text?: string | null; // optional text field for author names
  tags?: RawTagComponent[] | null;
  file?: FlatMedia | null;
  image_cover?: FlatMedia | null;
  images?: FlatMedia[] | null;
  publication_type?: RawPublicationTypeComponent; // component flattened
  theme?: RawThemeComponent | null; // optional component
  country?: RawCountryComponent | null; // optional component
};

export type FlatProject = {
  id: number;
  documentId?: string;
  shortTitle: string;
  longTitle: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  about: string;
  objectives?: RawObjectiveComponent[] | null;
  cover: FlatMedia;
  images?: FlatMedia[] | null;
  research_publications?: FlatPublication[] | null;
  active?: boolean;
  programme?: boolean;
  education_trainings?: _FlatEducationTraining[] | null;
  news_events?: _FlatNewsEvent[] | null;
};

export type StrapiListResponseFlat<T> = { data: T[]; meta: { pagination: StrapiPagination } };
export type StrapiListResponseUnion =
  | StrapiListResponseRaw<RawProjectAttributes>
  | StrapiListResponseFlat<FlatProject>;

// Additional raw/flat shapes for future endpoints --------------------------
export type _RawEducationTrainingAttributes = {
  title: string;
  secondary_title?: string | null;
  date: string;
  cover: RawRelationOne<RawMediaAttributes>;
  images?: RawRelationMany<RawMediaAttributes> | null;
  body: string;
  type?: RawEducationComponent | null;
  section?: 'module development' | 'short course' | 'training workshop' | null;
  lla: boolean;
  country?: RawCountryComponent | null;
};

export type _FlatEducationTraining = {
  id: number;
  documentId?: string;
  title: string;
  secondary_title?: string | null;
  date: string;
  cover: FlatMedia;
  images?: FlatMedia[] | null;
  body: string;
  type?: RawEducationComponent | null;
  section?: 'module development' | 'short course' | 'training workshop' | null;
  lla: boolean;
  country?: RawCountryComponent | null;
};

export type _RawNewsEventAttributes = {
  title: string;
  secondary_title?: string | null;
  date: string;
  cover: RawRelationOne<RawMediaAttributes>;
  images?: RawRelationMany<RawMediaAttributes> | null;
  body: string;
  section?: 'policy dialogue' | 'seminar and conference' | null;
  lla: boolean;
  blog?: boolean;
  authors?: RawRelationMany<RawAuthorAttributes>;
  country?: RawCountryComponent | null;
};

export type _FlatNewsEvent = {
  id: number;
  documentId?: string;
  title: string;
  secondary_title?: string | null;
  date: string;
  cover: FlatMedia;
  images?: FlatMedia[] | null;
  body: string;
  section?: 'policy dialogue' | 'seminar and conference' | null;
  lla: boolean;
  blog?: boolean;
  authors?: FlatAuthor[] | null;
  country?: RawCountryComponent | null;
};
