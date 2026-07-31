import {
  AnalyticsRankItem,
  AnalyticsTrendPoint,
  ListProductsQuery,
  MONTH_SHORT_LABELS,
  ProductAnalytics,
} from "@app/shared"

type CustomerRelation = { name: string } | { name: string }[] | null | undefined

export type AnalyticsSourceRow = {
  value: number | string
  payment_status: boolean
  jewelry_type: string
  created_at: string
  customers?: CustomerRelation
}

function parseValue(value: number | string) {
  const parsed = typeof value === "string" ? Number(value) : value
  return Number.isFinite(parsed) ? parsed : 0
}

function getCustomerName(customers: CustomerRelation) {
  if (!customers) return "Cliente"
  if (Array.isArray(customers)) return customers[0]?.name ?? "Cliente"
  return customers.name ?? "Cliente"
}

export const ANALYTICS_TOP_RANK_LIMIT = 5;

function aggregateRank(
  rows: AnalyticsSourceRow[],
  pickName: (row: AnalyticsSourceRow) => string,
  limit = ANALYTICS_TOP_RANK_LIMIT
): AnalyticsRankItem[] {
  const totals = new Map<string, { total: number; count: number }>()

  for (const row of rows) {
    const name = pickName(row)
    const current = totals.get(name) ?? { total: 0, count: 0 }
    current.total += parseValue(row.value)
    current.count += 1
    totals.set(name, current)
  }

  return [...totals.entries()]
    .map(([name, stats]) => ({
      name,
      total: stats.total,
      count: stats.count,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}

function buildMonthlyTrend(
  rows: AnalyticsSourceRow[],
  filters: Pick<ListProductsQuery, "month" | "year">
): AnalyticsTrendPoint[] {
  const targetYear = filters.year ?? new Date().getFullYear()

  return MONTH_SHORT_LABELS.map((label, index) => {
    const month = index + 1
    const monthRows = rows.filter((row) => {
      const date = new Date(row.created_at)
      return date.getFullYear() === targetYear && date.getMonth() + 1 === month
    })

    const total = monthRows.reduce((sum, row) => sum + parseValue(row.value), 0)

    return {
      month,
      label,
      total,
      count: monthRows.length,
    }
  })
}

export function buildProductAnalytics(
  rows: AnalyticsSourceRow[],
  filters: Pick<ListProductsQuery, "month" | "year">,
  availableYears: number[]
): ProductAnalytics {
  const total = rows.reduce((sum, row) => sum + parseValue(row.value), 0)
  const count = rows.length

  let paidTotal = 0
  let paidCount = 0
  let unpaidTotal = 0
  let unpaidCount = 0

  for (const row of rows) {
    const value = parseValue(row.value)
    if (row.payment_status) {
      paidTotal += value
      paidCount += 1
    } else {
      unpaidTotal += value
      unpaidCount += 1
    }
  }

  return {
    summary: {
      count,
      total,
      average_ticket: count > 0 ? total / count : 0,
      unpaid_total: unpaidTotal,
      unpaid_count: unpaidCount,
    },
    monthly_trend: buildMonthlyTrend(rows, filters),
    payment_split: {
      paid: { total: paidTotal, count: paidCount },
      unpaid: { total: unpaidTotal, count: unpaidCount },
    },
    top_jewelry: aggregateRank(rows, (row) => row.jewelry_type),
    top_customers: aggregateRank(rows, (row) => getCustomerName(row.customers)),
    available_years: availableYears,
  }
}
