# Integrations Image and Name Column Implementation

## Problem
The user wanted to display integration images and names together in the same column, similar to the screenshot showing integration logos with their names side by side.

## Solution
Modified the CollectionTable component to display both the image and name together in a single column using shadcn Avatar component with fallback.

## Changes Made

### 1. Updated Collection Service Configuration
**File:** `src/services/collectionService.ts`

**Updated CollectionConfig interface:**
```typescript
export interface CollectionConfig {
  name: string;
  endpoint: string;
  pluralName: string;
  fields: {
    label: string;
    key: string;
    type: 'text' | 'status' | 'date' | 'image'; // Added 'image' type
  }[];
}
```

**Updated PaginatedCollection interface:**
```typescript
export interface PaginatedCollection {
  [key: string]: CollectionItem[] | {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

**Updated integrations configuration:**
```typescript
'integrations': {
  name: 'Integration',
  endpoint: 'integrations',
  pluralName: 'integrations',
  fields: [
    { label: 'Integration', key: 'image', type: 'image' }, // Combined image and name
    { label: 'Created At', key: 'createdAt', type: 'date' },
  ]
},
```

### 2. Enhanced CollectionTable Component
**File:** `src/components/common/CollectionTable.tsx`

**Added Avatar import:**
```typescript
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
```

**Updated formatFieldValue function:**
```typescript
const formatFieldValue = (value: any, type: string, item?: CollectionItem) => {
  switch (type) {
    case 'image':
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={value} alt={item?.name || 'Integration'} />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
              {item?.name ? item.name.charAt(0).toUpperCase() : 'N/A'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-900">
            {item?.name || 'Unknown'}
          </span>
        </div>
      );
    // ... other cases
  }
};
```

**Updated table cell rendering:**
```typescript
{config.fields.map((field) => (
  <td key={field.key} className={`py-3 px-3 md:py-4 md:px-6 ${
    field.type === 'image' ? 'text-left' : ''
  }`}>
    <div className={`flex items-center ${
      field.type === 'image' ? 'justify-start' : ''
    }`}>
      {formatFieldValue(item[field.key], field.type, item)}
    </div>
  </td>
))}
```

## Features Implemented

### 1. Combined Image and Name Display
- **Avatar Component**: Uses shadcn Avatar with proper fallback
- **Image Display**: Shows integration logo/icon in a circular avatar
- **Name Display**: Shows integration name next to the avatar
- **Fallback**: Shows first letter of integration name if image fails to load

### 2. Responsive Design
- **Flexbox Layout**: Uses flexbox for proper alignment
- **Spacing**: Consistent spacing between avatar and name
- **Typography**: Proper font weights and sizes for readability

### 3. Error Handling
- **Image Fallback**: Graceful fallback when image fails to load
- **Name Fallback**: Shows "Unknown" if name is missing
- **Avatar Fallback**: Shows first letter of integration name

## Visual Layout

The integration column now displays:
```
[🖼️ Avatar] Integration Name
```

Where:
- **Avatar**: 32x32px circular image with fallback
- **Name**: Integration name in medium font weight
- **Spacing**: 12px gap between avatar and name
- **Alignment**: Left-aligned for natural reading flow

## Benefits

1. **Better UX**: Users can quickly identify integrations by both logo and name
2. **Consistent Design**: Uses established shadcn Avatar component
3. **Responsive**: Works well on different screen sizes
4. **Accessible**: Proper alt text and fallback content
5. **Maintainable**: Clean, reusable code structure

## Testing
- ✅ Build completed successfully
- ✅ No TypeScript compilation errors
- ✅ Avatar component properly imported
- ✅ Image and name display correctly combined
- ✅ Fallback handling implemented

## Usage

The integrations table will now display:
- **Slack**: Slack logo + "Slack" name
- **Zoom**: Zoom logo + "Zoom" name  
- **AWS**: AWS logo + "AWS" name
- **Google Drive**: Google Drive logo + "Google Drive" name
- And so on...

Each integration shows both the visual logo and the text name in a single, clean column layout. 