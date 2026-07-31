export const MIN_FILTER_YEAR = 2026

export const PRODUCT_BASE_SELECT =
  "id, created_by, customer_id, jewelry_type, value, payment_status, created_at, updated_at"

export const PRODUCT_SELECT = `${PRODUCT_BASE_SELECT}, customers(name)`
