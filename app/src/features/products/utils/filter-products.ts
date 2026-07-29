import { ListProductsQueryDTO } from "@app/shared";
import { JEWELRY_TYPE_OPTIONS } from "../constants/product-labels";

export type PaymentFilter = "all" | "paid" | "unpaid";
export type JewelryTypeFilter =
  | NonNullable<ListProductsQueryDTO["jewelry_type"]>
  | "all";

export type ProductFilters = {
  payment: PaymentFilter;
  month: number | null;
  year: number | null;
  customerName: string;
  jewelryType: JewelryTypeFilter;
};

export type ProductSummary = {
  count: number;
  total: number;
};

const MONTH_LABELS = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
    new Date(2024, index, 1)
  )
);

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getDefaultProductFilters(): ProductFilters {
  const now = new Date();

  return {
    payment: "all",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    customerName: "",
    jewelryType: "all",
  };
}

export function buildMonthOptions() {
  return [
    { value: "all", label: "Todos os meses" },
    ...MONTH_LABELS.map((label, index) => ({
      value: String(index + 1),
      label: capitalize(label),
    })),
  ];
}

export const MIN_FILTER_YEAR = 2026;

export function buildYearOptions(availableYears: number[] = []) {
  const currentYear = new Date().getFullYear();
  const years =
    availableYears.length > 0
      ? availableYears.filter((year) => year >= MIN_FILTER_YEAR)
      : currentYear >= MIN_FILTER_YEAR
        ? [currentYear]
        : [];

  return [
    { value: "all", label: "Todos os anos" },
    ...years.map((year) => ({
      value: String(year),
      label: String(year),
    })),
  ];
}

export function buildJewelryFilterOptions() {
  return [
    { value: "all" as const, label: "Todas categorias" },
    ...JEWELRY_TYPE_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
    })),
  ];
}

export function buildPaymentFilterOptions() {
  return [
    { value: "all" as const, label: "Todos" },
    { value: "paid" as const, label: "Pago" },
    { value: "unpaid" as const, label: "Devendo" },
  ];
}

export function toListProductsQuery(filters: ProductFilters): ListProductsQueryDTO {
  return {
    customer_name: filters.customerName.trim() || undefined,
    jewelry_type: filters.jewelryType === "all" ? undefined : filters.jewelryType,
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
