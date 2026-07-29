import { z } from "zod";

export const jewelryTypeEnum = z.enum([
  "colar",
  "brinco",
  "pulseira",
  "anel",
  "tornozeleira",
  "broche",
  "relogio",
  "conjunto",
  "bracelete",
  "outro",
]);

export type JewelryType = z.infer<typeof jewelryTypeEnum>;

export const createProductSchema = z.object({
  jewelry_type: jewelryTypeEnum,
  customer_name: z
    .string()
    .trim()
    .min(1, "Nome do cliente é obrigatório.")
    .max(120, "Nome do cliente deve ter no máximo 120 caracteres."),
  value: z
    .number({ error: "Valor é obrigatório." })
    .positive("Valor deve ser maior que zero.")
    .max(999999999.99, "Valor muito alto."),
  payment_status: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine(
    (data) =>
      data.jewelry_type !== undefined ||
      data.customer_name !== undefined ||
      data.value !== undefined ||
      data.payment_status !== undefined,
    { message: "Informe ao menos um campo para atualizar." }
  );

export const productIdParamSchema = z.object({
  id: z.uuid("ID do produto inválido."),
});

export const productResponseSchema = z.object({
  id: z.uuid(),
  created_by: z.uuid(),
  jewelry_type: jewelryTypeEnum,
  customer_name: z.string(),
  value: z.number(),
  payment_status: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;

export const paymentFilterEnum = z.enum(["all", "paid", "unpaid"]);

export const listProductsQuerySchema = z.object({
  customer_name: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(120).optional()
  ),
  jewelry_type: jewelryTypeEnum.optional(),
  payment: paymentFilterEnum.optional().default("all"),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export const productSummarySchema = z.object({
  count: z.number(),
  total: z.number(),
});

export const productListResultSchema = z.object({
  items: z.array(productResponseSchema),
  summary: productSummarySchema,
  has_any: z.boolean(),
  available_years: z.array(z.number().int()),
});

export type ListProductsQueryDTO = z.input<typeof listProductsQuerySchema>;
export type ListProductsQuery = z.output<typeof listProductsQuerySchema>;
export type ProductSummary = z.infer<typeof productSummarySchema>;
export type ProductListResult = z.infer<typeof productListResultSchema>;

export function mapProductRow(row: {
  id: string;
  created_by: string;
  jewelry_type: JewelryType;
  customer_name: string;
  value: number | string;
  payment_status: boolean;
  created_at: string;
  updated_at: string;
}): ProductResponse {
  return {
    id: row.id,
    created_by: row.created_by,
    jewelry_type: row.jewelry_type,
    customer_name: row.customer_name,
    value: typeof row.value === "string" ? Number(row.value) : row.value,
    payment_status: row.payment_status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
