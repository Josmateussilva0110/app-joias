import { JewelryType } from "@app/shared";

export const JEWELRY_TYPE_LABELS: Record<JewelryType, string> = {
  colar: "Colar",
  brinco: "Brinco",
  pulseira: "Pulseira",
  anel: "Anel",
  tornozeleira: "Tornozeleira",
  broche: "Broche",
  relogio: "Relógio",
  conjunto: "Conjunto",
  bracelete: "Bracelete",
  outro: "Outro",
};

export const JEWELRY_TYPE_OPTIONS = Object.entries(JEWELRY_TYPE_LABELS).map(
  ([value, label]) => ({
    value: value as JewelryType,
    label,
  })
);

export function getPaymentStatusLabel(isPaid: boolean) {
  return isPaid ? "Pago" : "Devendo";
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatProductDate(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}
