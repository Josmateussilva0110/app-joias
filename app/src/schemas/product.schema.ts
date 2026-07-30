import { z } from "zod";
import {
  jewelryDescriptionSchema,
  type CreateProductDTO,
  type ProductResponse,
  type UpdateProductDTO,
} from "@app/shared";

export const productFormSchema = z.object({
  jewelry_type: jewelryDescriptionSchema,
  customer_id: z
    .string()
    .uuid("Selecione um cliente."),
  value: z
    .string()
    .trim()
    .min(1, "Valor é obrigatório.")
    .refine((value) => {
      const normalized = Number(value.replace(",", "."));
      return !Number.isNaN(normalized) && normalized > 0;
    }, "Valor deve ser maior que zero."),
  payment_status: z.boolean(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

export function toProductFormData(product: ProductResponse): ProductFormData {
  return {
    jewelry_type: product.jewelry_type,
    customer_id: product.customer_id,
    value: product.value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    payment_status: product.payment_status,
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

export function toUpdateProductDTO(data: ProductFormData): UpdateProductDTO {
  return toCreateProductDTO(data);
}
