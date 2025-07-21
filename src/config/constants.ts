export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROUTES = {
  ADMIN_LOGIN: '/admin/login',
  ADMIN_FORGOT_PASSWORD: '/admin/forgot-password',
  ADMIN_RESET_PASSWORD: '/admin/reset-password',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
} as const; 