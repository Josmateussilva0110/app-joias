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

export const CUSTOMERS_PAGE_SIZE = 30;
export const CUSTOMERS_MAX_PAGE_SIZE = 100;
export const CUSTOMERS_PICKER_LIMIT = 200;

export const listCustomersQuerySchema = z.object({
  name: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(120).optional()
  ),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(CUSTOMERS_MAX_PAGE_SIZE)
    .optional()
    .default(CUSTOMERS_PAGE_SIZE),
});

export const customerListResultSchema = z.object({
  items: z.array(customerResponseSchema),
  page: z.number().int(),
  limit: z.number().int(),
  has_more: z.boolean(),
  total: z.number().int(),
});

export type ListCustomersQueryDTO = z.input<typeof listCustomersQuerySchema>;
export type ListCustomersQuery = z.output<typeof listCustomersQuerySchema>;
export type CustomerListResult = z.infer<typeof customerListResultSchema>;

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
