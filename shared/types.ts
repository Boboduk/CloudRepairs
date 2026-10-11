import type { AboutContent, HomeContent, ProductContent, SiteSettings, TrainingContent } from "./defaults";
import type { PageKey } from "./schema";

export interface MediaRef {
  id: number;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface PageData<T> {
  sections: T;
  order: string[];
  seoTitle: string;
  seoDescription: string;
}

export interface NewsListItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | null;
  cover: MediaRef | null;
}
export interface NewsItem extends NewsListItem {
  body: string;
  seoTitle: string;
  seoDescription: string;
}

export interface Partner {
  id: number;
  name: string;
  url: string;
  description: string;
  logo: MediaRef | null;
}

export interface CaseLink {
  label: string;
  href: string;
}
export interface CaseListItem {
  id: number;
  slug: string;
  title: string;
  client: string;
  excerpt: string;
  cover: MediaRef | null;
  hasPage: boolean;
}
export interface CaseItem extends CaseListItem {
  body: string;
  images: MediaRef[];
  links: CaseLink[];
  partner: Partner | null;
  seoTitle: string;
  seoDescription: string;
}

export interface ProductListItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: MediaRef | null;
  /** Куда ведёт карточка: внешняя/внутренняя ссылка или собственная страница продукта */
  href: string | null;
  linkLabel: string;
}
export interface ProductItem extends ProductListItem {
  body: string;
  seoTitle: string;
  seoDescription: string;
}

export interface SiteData {
  settings: SiteSettings;
  pages: {
    home: PageData<HomeContent>;
    training: PageData<TrainingContent>;
    about: PageData<AboutContent>;
    product: PageData<ProductContent>;
  };
  news: NewsListItem[];
  partners: Partner[];
  cases: CaseListItem[];
  products: ProductListItem[];
}

export type DetailKind = "news" | "cases" | "products";

/** Данные страницы, которые сервер встраивает в HTML для гидратации */
export interface InitialData {
  site: SiteData;
  path: string;
  detail: { kind: DetailKind; slug: string; item: NewsItem | CaseItem | ProductItem | null } | null;
  loadedAt: number;
}

export type { PageKey };
