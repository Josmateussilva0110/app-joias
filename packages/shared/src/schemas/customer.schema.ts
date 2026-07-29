import { z } from "zod";
import {
  CUSTOMER_PHONE_INVALID_MESSAGE,
  isValidBrazilianPhone,
  stripPhoneDigits,
} from "../utils/phone";

export const customerPhoneSchema = z
  .string()
  .trim()
  .transform(stripPhoneDigits)
  .refine(isValidBrazilianPhone, {
    message: CUSTOMER_PHONE_INVALID_MESSAGE,
  });

export const createCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório.")
    .max(120, "Nome deve ter no máximo 120 caracteres."),
  phone: customerPhoneSchema,
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento inválida. Use AAAA-MM-DD."),
});

export const updateCustomerSchema = createCustomerSchema
  .partial()
  .refine(
    (data) =>
      data.name !== undefined ||
      data.phone !== undefined ||
      data.birth_date !== undefined,
    { message: "Informe ao menos um campo para atualizar." }
  );

export const customerIdParamSchema = z.object({
  id: z.uuid("ID do cliente inválido."),
});

export const customerResponseSchema = z.object({
  id: z.uuid(),
  created_by: z.uuid(),
  name: z.string(),
  phone: z.string(),
  birth_date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CreateCustomerDTO = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof updateCustomerSchema>;
export type CustomerResponse = z.infer<typeof customerResponseSchema>;

export function mapCustomerRow(row: {
  id: string;
  created_by: string;
  name: string;
  phone: string;
  birth_date: string;
  created_at: string;
  updated_at: string;
}): CustomerResponse {
  return {
    id: row.id,
    created_by: row.created_by,
    name: row.name,
    phone: row.phone,
    birth_date: row.birth_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
