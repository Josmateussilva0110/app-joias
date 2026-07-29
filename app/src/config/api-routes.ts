export const AUTH_ROUTES = {
  refresh: "/auth/refresh",
  login: "/login",
  register: "/register",
  logout: "/logout",
} as const;

export const PRODUCT_ROUTES = {
  list: "/products",
  create: "/products",
} as const;

export const CUSTOMER_ROUTES = {
  list: "/customers",
  create: "/customers",
} as const;
