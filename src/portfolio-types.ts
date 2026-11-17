export const portfolioKinds = [
  "HOMEPAGE",
  "HERO",
  "SERVICE",
  "SERVICE_CATEGORY",
  "PROJECT",
  "PROJECT_CATEGORY",
  "TECHNOLOGY",
  "ABOUT",
  "PROCESS",
  "CONTACT",
  "SOCIAL_LINK",
  "NAVIGATION",
  "SEO",
  "TESTIMONIAL",
  "DESIGN",
  "LEGAL",
] as const;
export type PortfolioKind = (typeof portfolioKinds)[number];
export type PortfolioLocale = "en" | "ru" | "zh" | "tk";
export interface PortfolioLocalized {
  en: string;
  ru?: string;
  zh?: string;
  tk?: string;
}
export interface PortfolioContent {
  title: PortfolioLocalized;
  description?: PortfolioLocalized;
  body?: PortfolioLocalized;
  eyebrow?: PortfolioLocalized;
  buttonLabel?: PortfolioLocalized;
  secondaryButtonLabel?: PortfolioLocalized;
  buttonUrl?: string;
  secondaryButtonUrl?: string;
  active?: boolean;
  mediaIds?: string[];
  coverMediaId?: string;
  imageMediaId?: string;
  logoMediaId?: string;
  faviconMediaId?: string;
  ogMediaId?: string;
  galleryMediaIds?: string[];
  categorySlug?: string;
  technologySlugs?: string[];
  icon?: string;
  startingPriceMinor?: number;
  priceCurrency?: string;
  estimatedDays?: number;
  catalogServiceId?: string;
  challenge?: PortfolioLocalized;
  solution?: PortfolioLocalized;
  results?: PortfolioLocalized;
  resultsEvidenceUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  completionDate?: string;
  featured?: boolean;
  seoTitle?: PortfolioLocalized;
  seoDescription?: PortfolioLocalized;
  email?: string;
  telegramUrl?: string;
  githubProfileUrl?: string;
  instagramUrl?: string;
  phone?: string;
  url?: string;
  sectionOrder?: string[];
  disabledSections?: string[];
  defaultLanguage?: PortfolioLocale;
  availableLanguages?: PortfolioLocale[];
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: "system" | "Manrope" | "Inter";
  items?: Array<{
    title: PortfolioLocalized;
    description?: PortfolioLocalized;
    url?: string;
    icon?: string;
  }>;
}
export interface PortfolioPublicEntry {
  id: string;
  kind: PortfolioKind;
  slug: string;
  sortOrder: number;
  content: PortfolioContent;
}
export interface PortfolioEntry extends PortfolioPublicEntry {
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  version: number;
  publishedVersion: number | null;
  createdAt: string;
  updatedAt: string;
}
export interface PortfolioDocument {
  version: string;
  entries: PortfolioPublicEntry[];
}
export interface PortfolioMedia {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  alt: PortfolioLocalized;
  createdAt: string;
  url: string;
}
export interface PortfolioInquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  serviceId: string | null;
  locale: PortfolioLocale;
  status: "NEW" | "IN_PROGRESS" | "PROCESSED";
  note: string | null;
  createdAt: string;
  updatedAt: string;
}
