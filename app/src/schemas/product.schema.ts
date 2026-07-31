import { z } from "zod";
import {
  jewelryDescriptionSchema,
  type CreateProductDTO,
  type ProductResponse,
  type UpdateProductDTO,
} from "@app/shared";
import {
  formatProductPurchaseDate,
  purchaseDateToISO,
} from "@/features/products/constants/product-labels";

const purchaseDateSchema = z
  .string()
  .trim()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Informe a data no formato DD/MM/AAAA.");

export const productFormSchema = z.object({
  jewelry_type: jewelryDescriptionSchema,
  customer_id: z.string().uuid("Selecione um cliente."),
  value: z
    .string()
    .trim()
    .min(1, "Valor é obrigatório.")
    .refine((value) => {
      const normalized = Number(value.replace(",", "."));
      return !Number.isNaN(normalized) && normalized > 0;
    }, "Valor deve ser maior que zero."),
  payment_status: z.boolean(),
  purchase_date: purchaseDateSchema.optional(),
});

export const productEditFormSchema = productFormSchema.extend({
  purchase_date: purchaseDateSchema,
});

export type ProductFormData = z.infer<typeof productFormSchema>;
export type ProductEditFormData = z.infer<typeof productEditFormSchema>;

export function toProductFormData(product: ProductResponse): ProductEditFormData {
  return {
    jewelry_type: product.jewelry_type,
    customer_id: product.customer_id,
    value: product.value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    payment_status: product.payment_status,
    purchase_date: formatProductPurchaseDate(product.created_at),
  };
}

export function toCreateProductDTO(data: ProductFormData): CreateProductDTO {
  return {
    jewelry_type: data.jewelry_type.trim(),
    customer_id: data.customer_id,
    value: Number(data.value.replace(",", ".")),
    payment_status: data.payment_status,
  };
}

export function toUpdateProductDTO(data: ProductEditFormData): UpdateProductDTO {
  return {
    ...toCreateProductDTO(data),
    created_at: purchaseDateToISO(data.purchase_date),
  };
}
