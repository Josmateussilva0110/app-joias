import { KpiGrid, type KpiItem } from "@/components/ui/kpi-grid";
import { formatCurrency } from "../constants/product-labels";
import type { ProductSummary } from "../utils/filter-products";

type ProductsSummaryProps = {
  summary: ProductSummary;
  unpaidCount: number;
};

export function ProductsSummary({ summary, unpaidCount }: ProductsSummaryProps) {
  const items: KpiItem[] = [
    {
      label: "Total",
      value: formatCurrency(summary.total),
    },
    {
      label: "Qtd.",
      value: String(summary.count),
    },
    {
      label: "Em aberto",
      value: String(unpaidCount),
      tone: unpaidCount > 0 ? "danger" : "default",
    },
  ];

  return <KpiGrid items={items} />;
}
