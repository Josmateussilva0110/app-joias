import { z } from "zod";
import { createCustomerSchema, type CreateCustomerDTO } from "@app/shared";

export const customerFormSchema = z.object({
  name: createCustomerSchema.shape.name,
  phone: createCustomerSchema.shape.phone,
  birth_date: z
    .string()
    .trim()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Informe a data no formato DD/MM/AAAA."),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

export function toCreateCustomerDTO(data: CustomerFormData): CreateCustomerDTO {
  const [day, month, year] = data.birth_date.split("/");

  return {
    name: data.name,
    phone: data.phone,
    birth_date: `${year}-${month}-${day}`,
  };
}
