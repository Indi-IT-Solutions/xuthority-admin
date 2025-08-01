# Asset Configuration System

This document explains the centralized asset configuration system implemented for the Xuthority Admin application.

## Overview

The asset configuration system provides a centralized way to manage all asset paths with the admin base path (`/admin`). This ensures that all assets are properly loaded from the correct path and eliminates the need to manually update asset paths throughout the application.

## Files

- `src/config/assets.ts` - Main asset configuration file
- `src/config/constants.ts` - Re-exports asset configuration for convenience

## Usage

### 1. Import Asset Configuration

```typescript
import { ASSETS, getAssetPath, getDashboardIcon, getLogoPath } from '@/config/constants';
```

### 2. Using Predefined Asset Paths

#### Dashboard Icons
```typescript
// Instead of: src="/admin/dashboard/speedometer.svg"
<img src={ASSETS.DASHBOARD.SPEEDOMETER} alt="Dashboard" />

// Available dashboard icons:
ASSETS.DASHBOARD.SPEEDOMETER
ASSETS.DASHBOARD.CATEGORY_2
ASSETS.DASHBOARD.PEOPLE
ASSETS.DASHBOARD.STAR
ASSETS.DASHBOARD.MEDAL
ASSETS.DASHBOARD.TASK_SQUARE
ASSETS.DASHBOARD.TAG_2
ASSETS.DASHBOARD.COMMAND_SQUARE
ASSETS.DASHBOARD.SETTING_2
```

#### Logos
```typescript
// Instead of: src="/admin/xuthority_logo.svg"
<img src={ASSETS.LOGOS.MAIN} alt="Xuthority Logo" />

// Instead of: src="/admin/xuthority_sm_logo.svg"
<img src={ASSETS.LOGOS.SMALL} alt="Xuthority Logo" />
```

#### SVG Assets
```typescript
// Instead of: src="/admin/svg/home_bg.svg"
<img src={ASSETS.SVG.HOME_BG} alt="Background" />
```

### 3. Using Utility Functions

#### getAssetPath()
For any asset path that's not predefined:

```typescript
import { getAssetPath } from '@/config/constants';

// Instead of: src="/admin/custom/image.png"
<img src={getAssetPath('custom/image.png')} alt="Custom Image" />

// Instead of: src="/admin/dashboard/new-icon.svg"
<img src={getAssetPath('dashboard/new-icon.svg')} alt="New Icon" />
```

#### getDashboardIcon()
For dashboard icons with type safety:

```typescript
import { getDashboardIcon } from '@/config/constants';

<img src={getDashboardIcon('SPEEDOMETER')} alt="Dashboard" />
```

#### getLogoPath()
For logos with type safety:

```typescript
import { getLogoPath } from '@/config/constants';

<img src={getLogoPath('main')} alt="Main Logo" />
<img src={getLogoPath('small')} alt="Small Logo" />
```

## Benefits

1. **Centralized Management**: All asset paths are managed in one place
2. **Type Safety**: TypeScript provides autocomplete and error checking
3. **Easy Updates**: Change the base path once to update all assets
4. **Consistency**: Ensures all assets use the correct admin base path
5. **Maintainability**: Easy to add new assets and update existing ones

## Adding New Assets

### 1. Add to Predefined Assets

Edit `src/config/assets.ts`:

```typescript
export const ASSETS = {
  // ... existing assets
  
  // New category
  NEW_CATEGORY: {
    ASSET_1: `${ADMIN_BASE_PATH}/new-category/asset1.svg`,
    ASSET_2: `${ADMIN_BASE_PATH}/new-category/asset2.png`,
  },
  
  // Or add to existing category
  DASHBOARD: {
    // ... existing dashboard icons
    NEW_ICON: `${ADMIN_BASE_PATH}/dashboard/new-icon.svg`,
  },
} as const;
```

### 2. Use getAssetPath() for Dynamic Assets

For assets that don't need to be predefined:

```typescript
<img src={getAssetPath('dynamic/path/to/asset.svg')} alt="Dynamic Asset" />
```

## Migration Guide

### Before (Manual Paths)
```typescript
<img src="/dashboard/speedometer.svg" alt="Dashboard" />
<img src="/xuthority_logo.svg" alt="Logo" />
<img src="/svg/home_bg.svg" alt="Background" />
```

### After (Centralized Configuration)
```typescript
import { ASSETS } from '@/config/constants';

<img src={ASSETS.DASHBOARD.SPEEDOMETER} alt="Dashboard" />
<img src={ASSETS.LOGOS.MAIN} alt="Logo" />
<img src={ASSETS.SVG.HOME_BG} alt="Background" />
```

## Configuration

The base path is configured in `src/config/assets.ts`:

```typescript
const ADMIN_BASE_PATH = '/admin';
```

To change the base path for all assets, simply update this constant.

## Best Practices

1. **Always use the asset configuration** instead of hardcoded paths
2. **Use predefined assets** when available for better type safety
3. **Use getAssetPath()** for dynamic or one-off assets
4. **Add new assets to the configuration** if they're used in multiple places
5. **Import from constants** to get the re-exported configuration

## Troubleshooting

### Asset Not Loading
1. Check that the asset exists in the `public` directory
2. Verify the path in the asset configuration
3. Ensure the asset is being served correctly by the development server

### TypeScript Errors
1. Make sure you're importing from `@/config/constants`
2. Check that the asset key exists in the configuration
3. Use the correct type for utility functions

### Build Issues
1. Ensure all assets referenced in the configuration exist
2. Check that the base path matches your deployment configuration
3. Verify that the Vite configuration is set up correctly 
 