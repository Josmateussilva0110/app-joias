import { ListProductsQueryDTO, ProductFilterOptions } from "@app/shared";

export type PaymentFilter = "all" | "paid" | "unpaid";

export type ProductFilters = {
  payment: PaymentFilter;
  month: number | null;
  year: number | null;
  customerName: string;
  jewelryName: string;
};

export type ProductSummary = {
  count: number;
  total: number;
};

export function toSelectValue(value: string | number | null) {
  return value === null ? "all" : String(value);
}

export function mapFilterOptionsToSelect(
  options: ProductFilterOptions["years"] | ProductFilterOptions["months"]
) {
  return options.map((option) => ({
    value: toSelectValue(option.value),
    label: option.label,
  }));
}

export function toListProductsQuery(filters: ProductFilters): ListProductsQueryDTO {
  return {
    customer_name: filters.customerName.trim() || undefined,
    jewelry_type: filters.jewelryName.trim() || undefined,
    payment: filters.payment,
    month: filters.month ?? undefined,
    year: filters.year ?? undefined,
  };
}

export function parseMonthFilter(value: string): number | null {
  return value === "all" ? null : Number(value);
}

export function parseYearFilter(value: string): number | null {
  return value === "all" ? null : Number(value);
}

export function toMonthFilterValue(month: number | null) {
  return month === null ? "all" : String(month);
}

export function toYearFilterValue(year: number | null) {
  return year === null ? "all" : String(year);
}
