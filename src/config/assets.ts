// Asset configuration for the admin application
// This provides a centralized way to handle asset paths with the admin base path

const ADMIN_BASE_PATH = '/admin';

/**
 * Asset path configuration
 * Provides centralized asset path management with admin base path
 */
export const ASSETS = {
  // Base path for all assets
  BASE_PATH: ADMIN_BASE_PATH,
  
  // Dashboard icons
  DASHBOARD: {
    SPEEDOMETER: `${ADMIN_BASE_PATH}/dashboard/speedometer.svg`,
    CATEGORY_2: `${ADMIN_BASE_PATH}/dashboard/category-2.svg`,
    PEOPLE: `${ADMIN_BASE_PATH}/dashboard/people.svg`,
    STAR: `${ADMIN_BASE_PATH}/dashboard/star.svg`,
    MEDAL: `${ADMIN_BASE_PATH}/dashboard/medal.svg`,
    TASK_SQUARE: `${ADMIN_BASE_PATH}/dashboard/task-square.svg`,
    TAG_2: `${ADMIN_BASE_PATH}/dashboard/tag-2.svg`,
    COMMAND_SQUARE: `${ADMIN_BASE_PATH}/dashboard/command-square.svg`,
    SETTING_2: `${ADMIN_BASE_PATH}/dashboard/setting-2.svg`,
  },
  
  // Logos
  LOGOS: {
    MAIN: `${ADMIN_BASE_PATH}/xuthority_logo.svg`,
    SMALL: `${ADMIN_BASE_PATH}/xuthority_sm_logo.svg`,
  },
  
  // SVG assets
  SVG: {
    HOME_BG: `${ADMIN_BASE_PATH}/svg/home_bg.svg`,
  },
} as const;

/**
 * Utility function to get asset path with admin base path
 * @param path - The asset path relative to public directory
 * @returns The full asset path with admin base path
 */
export const getAssetPath = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${ADMIN_BASE_PATH}/${cleanPath}`;
};

/**
 * Utility function to get dashboard icon path
 * @param iconName - The name of the dashboard icon
 * @returns The full path to the dashboard icon
 */
export const getDashboardIcon = (iconName: keyof typeof ASSETS.DASHBOARD): string => {
  return ASSETS.DASHBOARD[iconName];
};

/**
 * Utility function to get logo path
 * @param logoType - The type of logo ('main' or 'small')
 * @returns The full path to the logo
 */
export const getLogoPath = (logoType: 'main' | 'small'): string => {
  return logoType === 'main' ? ASSETS.LOGOS.MAIN : ASSETS.LOGOS.SMALL;
}; 