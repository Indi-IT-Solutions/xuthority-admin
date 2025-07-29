import { ChevronRight } from "lucide-react";
import { SectionItem, SectionInfo } from "../types";

export const userPageSections: SectionItem[] = [
  { id: "hero", label: "Hero Section", icon: ChevronRight },
  { id: "categories", label: "Software Categories Overview", icon: ChevronRight },
  { id: "review-cta", label: "Leave a Review CTA", icon: ChevronRight },
  { id: "insights", label: "Buyer Behavior Insights", icon: ChevronRight },
  { id: "testimonials", label: "Testimonials", icon: ChevronRight },
  { id: "vendor-cta", label: "Vendor CTA – Claim Profile", icon: ChevronRight },
  { id: "popular", label: "Popular Software & Solutions", icon: ChevronRight },
];

export const vendorPageSections: SectionItem[] = [
  { id: "hero", label: "Hero Section", icon: ChevronRight },
  { id: "trusted-tech", label: "Trusted Tech Sales Overview", icon: ChevronRight },
  { id: "reach-buyers", label: "Reach More Software Buyers", icon: ChevronRight },
];

export const aboutPageSections: SectionItem[] = [
  { id: "hero", label: "Hero Section", icon: ChevronRight },
  { id: "values", label: "Our Values section", icon: ChevronRight },
  { id: "mission-support", label: "Mission/Support Section", icon: ChevronRight },
];

export const sectionInfoMap: Record<string, SectionInfo> = {
  hero: {
    title: "Hero Section",
    description: "Edit the main headline, subtext, and search functionality shown on the homepage."
  },
  categories: {
    title: "Software Categories Overview",
    description: "Add, edit, or reorder the most popular software categories displayed on the homepage."
  },
  "review-cta": {
    title: "Leave a Review CTA",
    description: "Update the headline, message, and visual for the review invitation section."
  },
  insights: {
    title: "Buyer Behavior Insights",
    description: "Add or update insights, report links, and visuals related to software buying trends."
  },
  testimonials: {
    title: "Testimonials",
    description: "Manage user testimonials to showcase real experiences and build trust."
  },
  "vendor-cta": {
    title: "Vendor CTA – Claim Profile",
    description: "Edit the content and visuals that encourage vendors to claim their profiles."
  },
  popular: {
    title: "Popular Software & Solutions",
    description: "Add or manage top-performing software and solutions displayed on the homepage."
  },
  features: {
    title: "Features & Benefits",
    description: "Highlight the key features and benefits of your service."
  },
  pricing: {
    title: "Pricing Plans",
    description: "Configure your pricing plans and options."
  },
  cta: {
    title: "Get Started CTA",
    description: "Configure the main call-to-action section."
  },
  mission: {
    title: "Our Mission",
    description: "Define your company's mission statement."
  },
  values: {
    title: "Our Values section",
    description: "Upload image and add, edit data to Our Values section on the homepage."
  },
  team: {
    title: "Meet the Team",
    description: "Introduce your team members."
  },
  contact: {
    title: "Contact Information",
    description: "Provide contact details for your company."
  },
  "trusted-tech": {
    title: "Trusted Tech Sales Overview",
    description: "Add, edit, or reorder the top Trusted Tech Sales Overview on the homepage."
  },
  "reach-buyers": {
    title: "Reach More Software Buyers",
    description: "Upload image and add, edit data to Reach More Software Buyers on the homepage."
  },
  "mission-support": {
    title: "Mission/Support Section",
    description: "Upload image and add, edit data to Mission/Support Section on the homepage."
  }
};

export const getSections = (pageType: "user" | "vendor" | "about"): SectionItem[] => {
  switch (pageType) {
    case "user":
      return userPageSections;
    case "vendor":
      return vendorPageSections;
    case "about":
      return aboutPageSections;
    default:
      return userPageSections;
  }
};

export const getSectionInfo = (sectionId: string): SectionInfo => {
  return sectionInfoMap[sectionId] || {
    title: "Section",
    description: "Configure this section."
  };
}; 