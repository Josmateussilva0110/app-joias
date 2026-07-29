import { z } from "zod";
import {
  createProductSchema,
  jewelryTypeEnum,
  type CreateProductDTO,
} from "@app/shared";

export const productFormSchema = z.object({
  jewelry_type: jewelryTypeEnum,
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

export function toCreateProductDTO(data: ProductFormData): CreateProductDTO {
  return {
    jewelry_type: data.jewelry_type,
    customer_id: data.customer_id,
    value: Number(data.value.replace(",", ".")),
    payment_status: data.payment_status,
  };
}
