import { z } from "zod";

export const heroSectionSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  subtext: z.string().min(1, "Subtext is required"),
  buttonText: z.string().min(1, "Button text is required"),
  buttonLink: z.string().min(1, "Button link is required"),
});

export const categoriesSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  categories: z.array(z.object({
    id: z.string().min(1, "Category ID is required"),
    name: z.string().min(1, "Category name is required"),
    products: z.array(z.object({
      id: z.string().min(1, "Product ID is required"),
      name: z.string().min(1, "Product name is required"),
      logo: z.string().optional(),
    })).min(1, "At least one product is required").max(9, "Maximum 9 products per category"),
  })).min(1, "At least one category is required"),
});

export const reviewCtaSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  subheading: z.string().min(1, "Subheading is required"),
  buttonText: z.string().min(1, "Button text is required"),
  buttonLink: z.string().min(1, "Button link is required"),
});

export const insightsSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  subtext: z.string().min(1, "Subtext is required"),
  buttonText: z.string().min(1, "Button text is required"),
  buttonLink: z.string().min(1, "Button link is required"),
});

export const testimonialsSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  testimonials: z.array(z.object({
    id: z.string().min(1, "Testimonial ID is required"),
    text: z.string().min(1, "Testimonial text is required"),
    userName: z.string().min(1, "User name is required"),
    userImage: z.string().optional(),
  })).min(1, "At least one testimonial is required"),
});

export const vendorCtaSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  subtext: z.string().min(1, "Subtext is required"),
  buttonText: z.string().min(1, "Button text is required"),
  buttonLink: z.string().min(1, "Button link is required"),
});

export const popularSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  solutions: z.array(z.object({
    id: z.string().min(1, "Solution ID is required"),
    name: z.string().min(1, "Software & Solution is required"),
    types: z.array(z.object({
      id: z.string().min(1, "Type ID is required"),
      name: z.string().min(1, "Type name is required"),
    })).min(1, "At least one type is required").max(4, "Maximum 4 types allowed"),
  })).min(1, "At least one software & solution is required"),
});

export const featuresSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  features: z.array(z.object({
    title: z.string().min(1, "Feature title is required"),
    description: z.string().min(1, "Description is required"),
    icon: z.string().optional(),
  })).min(1, "At least one feature is required"),
});

export const pricingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  plans: z.array(z.object({
    name: z.string().min(1, "Plan name is required"),
    price: z.string().min(1, "Price is required"),
    features: z.array(z.string().min(1, "Feature is required")).min(1, "At least one feature is required"),
  })).min(1, "At least one plan is required"),
});

export const ctaSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  subheading: z.string().min(1, "Subheading is required"),
  primaryButtonText: z.string().min(1, "Primary button text is required"),
  primaryButtonLink: z.string().min(1, "Primary button link is required"),
  secondaryButtonText: z.string().min(1, "Secondary button text is required"),
  secondaryButtonLink: z.string().min(1, "Secondary button link is required"),
});

export const missionSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  content: z.string().min(1, "Content is required"),
  image: z.string().min(1, "Image URL is required"),
});

export const valuesSchema = z.object({
  title: z.string().min(1, "Title is required"),
  values: z.array(z.object({
    title: z.string().min(1, "Value title is required"),
    description: z.string().min(1, "Description is required"),
    icon: z.string().optional(),
  })).min(1, "At least one value is required"),
});

export const teamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  members: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    role: z.string().min(1, "Role is required"),
    bio: z.string().min(1, "Bio is required"),
    image: z.string().min(1, "Image URL is required"),
  })).min(1, "At least one team member is required"),
});

export const contactSchema = z.object({
  title: z.string().min(1, "Title is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  hours: z.string().min(1, "Hours is required"),
});

// Additional vendor-specific schemas
export const trustedTechSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  subtext: z.string().min(1, "Subtext is required"),
  buttonText: z.string().min(1, "Button text is required"),
  buttonLink: z.string().min(1, "Button link is required"),
});

export const reachBuyersSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  subtext: z.string().min(1, "Subtext is required"),
  buttonText: z.string().min(1, "Button text is required"),
  buttonLink: z.string().min(1, "Button link is required"),
});

export const schemas = {
  hero: heroSectionSchema,
  categories: categoriesSchema,
  "review-cta": reviewCtaSchema,
  insights: insightsSchema,
  testimonials: testimonialsSchema,
  "vendor-cta": vendorCtaSchema,
  popular: popularSchema,
  features: featuresSchema,
  pricing: pricingSchema,
  cta: ctaSchema,
  mission: missionSchema,
  values: valuesSchema,
  team: teamSchema,
  contact: contactSchema,
  "trusted-tech": trustedTechSchema,
  "reach-buyers": reachBuyersSchema,
} as const;

export type SchemaKey = keyof typeof schemas; 