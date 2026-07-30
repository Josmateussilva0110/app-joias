export function clampEarningsPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

export function parseEarningsPercentInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return 0;
  }

  return clampEarningsPercent(Number(digits));
}

export function calculateEarningsAmount(grossTotal: number, percent: number) {
  return grossTotal * (clampEarningsPercent(percent) / 100);
}
