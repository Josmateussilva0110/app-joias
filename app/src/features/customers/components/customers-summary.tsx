import { KpiGrid } from "@/components/ui/kpi-grid";

type CustomersSummaryProps = {
  count: number;
};

export function CustomersSummary({ count }: CustomersSummaryProps) {
  return (
    <KpiGrid
      items={[
        {
          label: "Cadastrados",
          value: String(count),
        },
      ]}
    />
  );
}
