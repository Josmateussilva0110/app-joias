import type { ProductResponse } from "@app/shared";

export function sortProductsDescending(products: ProductResponse[]) {
  return [...products].sort((a, b) => {
    const dateDiff =
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

    if (dateDiff !== 0) {
      return dateDiff;
    }

    return b.id.localeCompare(a.id);
  });
}
