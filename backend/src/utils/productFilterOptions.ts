import {
  ProductFilterOptions,
} from "@app/shared"

import { getAvailableYears } from "./productYears"

const PAYMENT_OPTIONS: ProductFilterOptions["payments"] = [
  { value: "all", label: "Todos" },
  { value: "paid", label: "Pago" },
  { value: "unpaid", label: "Devendo" },
]

const MONTH_LABELS = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
    new Date(2024, index, 1)
  )
)

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function buildMonthOptions(months: number[]): ProductFilterOptions["months"] {
  return [
    { value: null, label: "Todos os meses" },
    ...months.map((month) => ({
      value: month,
      label: capitalize(MONTH_LABELS[month - 1] ?? String(month)),
    })),
  ]
}

function buildYearOptions(years: number[]): ProductFilterOptions["years"] {
  return [
    { value: null, label: "Todos os anos" },
    ...years.map((year) => ({
      value: year,
      label: String(year),
    })),
  ]
}

function buildDefaults(years: number[]): ProductFilterOptions["defaults"] {
  const currentYear = new Date().getFullYear()

  const defaultYear = years.includes(currentYear)
    ? currentYear
    : years[0] ?? null

  return {
    year: defaultYear,
    month: null,
    payment: "all",
  }
}

export function buildProductFilterOptions(
  availableYears: number[],
  availableMonths: number[]
): ProductFilterOptions {
  const years = getAvailableYears(availableYears)
  const sortedMonths = [...availableMonths].sort((a, b) => a - b)

  return {
    years: buildYearOptions(years),
    months: buildMonthOptions(sortedMonths),
    payments: PAYMENT_OPTIONS,
    defaults: buildDefaults(years),
  }
}

export type FilterOptionsSource = {
  year?: number
}
