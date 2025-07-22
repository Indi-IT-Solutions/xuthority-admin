# SVG Assets

This directory contains reusable SVG icon components for the application.

## Components

### GoogleIcon
- **File**: `GoogleIcon.tsx`
- **Usage**: Social login button for Google authentication
- **Props**: 
  - `className?: string` - CSS classes (default: "mr-2 h-4 w-4")
  - `size?: number` - Icon size in pixels (default: 16)

### LinkedInIcon
- **File**: `LinkedInIcon.tsx`
- **Usage**: Social login button for LinkedIn authentication
- **Props**:
  - `className?: string` - CSS classes (default: "mr-2 h-4 w-4")
  - `size?: number` - Icon size in pixels (default: 16)

## Usage

```tsx
import { GoogleIcon, LinkedInIcon } from "@/assets/svg";

// Default usage
<GoogleIcon />

// Custom styling
<LinkedInIcon className="mr-3 h-6 w-6" size={24} />
```

## Adding New Icons

1. Create a new TypeScript file for your icon component
2. Follow the existing pattern with props for `className` and `size`
3. Export the component as default
4. Add the export to `index.ts`
5. Update this README with documentation

## Guidelines

- Use TypeScript interfaces for props
- Provide sensible defaults for className and size
- Keep icons simple and reusable
- Use consistent naming conventions
- Export all icons through the index file 