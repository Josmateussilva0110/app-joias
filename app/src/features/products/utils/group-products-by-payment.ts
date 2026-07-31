import type { ProductResponse } from "@app/shared";
import { getPaymentStatusLabel } from "../constants/product-labels";

export type ProductSection = {
  title: string;
  isPaid: boolean;
  data: ProductResponse[];
};

const SECTION_ORDER = [
  { paid: false, title: getPaymentStatusLabel(false) },
  { paid: true, title: getPaymentStatusLabel(true) },
] as const;

export function groupProductsByPayment(products: ProductResponse[]): ProductSection[] {
  const buckets = new Map<boolean, ProductResponse[]>();

  for (const product of products) {
    const key = product.payment_status;
    const list = buckets.get(key);

    if (list) {
      list.push(product);
      continue;
    }

    buckets.set(key, [product]);
  }

  return SECTION_ORDER.flatMap(({ paid, title }) => {
    const data = buckets.get(paid);

    if (!data?.length) {
      return [];
    }

    return [{ title, isPaid: paid, data }];
  });
}

export function formatProductDay(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(new Date(isoDate));
}

export function formatProductMonthShort(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(new Date(isoDate))
    .replace(".", "")
    .slice(0, 3)
    .toUpperCase();
}
