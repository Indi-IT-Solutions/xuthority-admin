export type PageType = "user" | "vendor" | "about";

export interface SectionItem {
  id: string;
  label: string;
  icon: any;
}

export interface SectionInfo {
  title: string;
  description: string;
}

export interface HeroSectionData {
  heading: string;
  subtext: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface CategoriesData {
  title: string;
  description: string;
  categories?: Array<{
    name: string;
    icon?: string;
  }>;
}

export interface ReviewCtaData {
  heading: string;
  subheading: string;
  buttonText: string;
  buttonLink: string;
}

export interface InsightsData {
  title: string;
  description: string;
  insights?: Array<{
    stat: string;
    label: string;
  }>;
}

export interface TestimonialsData {
  title: string;
  testimonials?: Array<{
    quote: string;
    author: string;
    role?: string;
    company?: string;
  }>;
}

export interface VendorCtaData {
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface PopularData {
  title: string;
  subtitle?: string;
  software?: Array<{
    name: string;
    category: string;
    rating?: number;
  }>;
}

export interface FeaturesData {
  title: string;
  subtitle?: string;
  features?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
}

export interface PricingData {
  title: string;
  plans?: Array<{
    name: string;
    price: string;
    features?: string[];
  }>;
}

export interface CtaData {
  heading: string;
  subheading: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export interface MissionData {
  heading: string;
  content: string;
  image?: string;
}

export interface ValuesData {
  title: string;
  values?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
}

export interface TeamData {
  title: string;
  members?: Array<{
    name: string;
    role: string;
    bio?: string;
    image?: string;
  }>;
}

export interface ContactData {
  title: string;
  email: string;
  phone?: string;
  address?: string;
  hours?: string;
}

export type FormData = 
  | HeroSectionData
  | CategoriesData
  | ReviewCtaData
  | InsightsData
  | TestimonialsData
  | VendorCtaData
  | PopularData
  | FeaturesData
  | PricingData
  | CtaData
  | MissionData
  | ValuesData
  | TeamData
  | ContactData; 