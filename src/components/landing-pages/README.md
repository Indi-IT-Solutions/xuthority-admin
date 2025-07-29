# Landing Pages Module

This module provides a modular, maintainable structure for managing landing page content. The original monolithic `LandingPagesPage.tsx` has been broken down into smaller, reusable components.

## Structure

```
landing-pages/
├── types/
│   └── index.ts              # TypeScript type definitions
├── schemas/
│   └── index.ts              # Zod validation schemas
├── forms/
│   ├── FormField.tsx         # Reusable form field component
│   ├── FormFactory.tsx       # Factory to render appropriate forms
│   ├── HeroForm.tsx          # Hero section form
│   ├── CategoriesForm.tsx    # Categories form
│   ├── CtaForm.tsx           # CTA form (reusable for review/vendor)
│   ├── InsightsForm.tsx      # Insights form
│   ├── TestimonialsForm.tsx  # Testimonials form
│   ├── PopularForm.tsx       # Popular software form
│   ├── FeaturesForm.tsx      # Features form
│   ├── PricingForm.tsx       # Pricing form
│   ├── MainCtaForm.tsx       # Main CTA form
│   ├── MissionForm.tsx       # Mission form
│   ├── ValuesForm.tsx        # Values form
│   ├── TeamForm.tsx          # Team form
│   └── ContactForm.tsx       # Contact form
├── sections/
│   ├── config.ts             # Section configurations
│   ├── TabNavigation.tsx     # Tab navigation component
│   ├── Sidebar.tsx           # Section sidebar
│   ├── FormContainer.tsx     # Form container
│   └── Breadcrumb.tsx        # Breadcrumb component
├── LandingPagesContainer.tsx # Main container component
└── index.ts                  # Module exports
```

## Key Benefits

### 1. **Separation of Concerns**
- **Types**: Centralized type definitions for all form data
- **Schemas**: Zod validation schemas for each section
- **Forms**: Individual form components for each section type
- **UI Components**: Reusable UI components for navigation and layout

### 2. **Maintainability**
- Each form component is focused on a single responsibility
- Easy to add new sections or modify existing ones
- Clear separation between validation, types, and UI

### 3. **Reusability**
- `FormField` component can be reused across all forms
- `FormFactory` pattern makes it easy to add new form types
- UI components can be reused in other parts of the application

### 4. **Type Safety**
- Strong TypeScript typing throughout
- Zod schemas provide runtime validation
- Type-safe form handling

## Usage

The main page component is now simplified to just:

```tsx
import { LandingPagesContainer } from "@/components/landing-pages";

const LandingPagesPage = () => {
  return <LandingPagesContainer />;
};
```

## Adding New Sections

To add a new section:

1. **Add types** in `types/index.ts`
2. **Add schema** in `schemas/index.ts`
3. **Create form component** in `forms/`
4. **Add to config** in `sections/config.ts`
5. **Update FormFactory** to include the new form

## Form Components

Each form component follows the same pattern:
- Accepts `register` and `errors` props from react-hook-form
- Uses the reusable `FormField` component
- Focused on a single section type

## Validation

All forms use Zod schemas for validation:
- Runtime type checking
- Custom error messages
- Consistent validation across all sections

## State Management

The main container manages:
- Active tab state
- Selected section state
- Form state via react-hook-form
- Form submission and validation

This modular approach makes the codebase more maintainable, testable, and scalable. 