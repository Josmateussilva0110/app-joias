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

export function formatProductPurchaseDate(isoDate: string) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export function purchaseDateToISO(date: string) {
  const [day, month, year] = date.split("/");
  return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0).toISOString();
}
