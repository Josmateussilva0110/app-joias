export const AUTH_ROUTES = {
  refresh: "/auth/refresh",
  login: "/login",
  register: "/register",
  logout: "/logout",
  passwordResetRequest: "/auth/password-reset-request",
} as const;

export const PROFILE_ROUTES = {
  profile: "/profile",
  password: "/profile/password",
} as const;

export const PRODUCT_ROUTES = {
  list: "/products",
  create: "/products",
  analytics: "/products/analytics",
  filters: "/products/filters",
} as const;

export const CUSTOMER_ROUTES = {
  list: "/customers",
  create: "/customers",
} as const;

export const NOTIFICATION_ROUTES = {
  registerToken: "/notifications/register-token",
  settings: "/notifications/settings",
} as const;
