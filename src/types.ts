export interface GeneralInfo {
  url: string;
  domain: string;
  isHttps: boolean;
  language: string;
  charset: string;
  generator: string;
  author: string;
  viewport: string;
}

export interface SeoInfo {
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;
  robots: string;
  keywords: string;
}

export interface OpenGraphInfo {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  siteName: string;
  locale: string;
}

export interface TwitterCardInfo {
  card: string;
  title: string;
  description: string;
  image: string;
  creator: string;
}

export interface BrandingInfo {
  favicon: string;
  appleTouchIcon: string;
  themeColor: string;
  manifest: string;
}

export interface TechnicalInfo {
  viewport: string;
  charset: string;
  language: string;
  generator: string;
  author: string;
  canonical: string;
  isHttps: boolean;
}

export interface SeoScoreInfo {
  score: number;
  rating: "Excellent" | "Good" | "Needs Improvement" | "Poor";
}

export interface InspectionResult {
  general: GeneralInfo;
  seo: SeoInfo;
  openGraph: OpenGraphInfo;
  twitterCard: TwitterCardInfo;
  branding: BrandingInfo;
  technical: TechnicalInfo;
  seoScore: SeoScoreInfo;
}
