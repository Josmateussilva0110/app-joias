export function formatChartCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatChartAxisValue(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildYAxisLabels(maxValue: number, sections = 4) {
  if (maxValue <= 0) {
    return ["0"];
  }

  const step = maxValue / sections;

  return Array.from({ length: sections + 1 }, (_, index) =>
    formatChartAxisValue(Math.round(step * index))
  );
}

export function getChartMaxValue(values: number[]) {
  const max = Math.max(...values, 0);
  if (max === 0) return 100;

  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  return Math.ceil(max / magnitude) * magnitude;
}
