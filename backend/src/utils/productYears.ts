import { MIN_FILTER_YEAR } from "../constants/product.constants"

export function getAvailableYears(years: number[]) {
  const currentYear = new Date().getFullYear()
  const sortedYears = years
    .filter((year) => year >= MIN_FILTER_YEAR)
    .sort((a, b) => b - a)

  if (sortedYears.length === 0 && currentYear >= MIN_FILTER_YEAR) {
    return [currentYear]
  }

  return sortedYears
}
