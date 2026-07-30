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
  customer_id: z.uuid("Selecione um cliente válido."),
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
      data.customer_id !== undefined ||
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
  customer_id: z.uuid(),
  customer_name: z.string(),
  jewelry_type: jewelryTypeEnum,
  value: z.number(),
  payment_status: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;

export const paymentFilterEnum = z.enum(["all", "paid", "unpaid"]);

export const PRODUCTS_PAGE_SIZE = 20;
export const PRODUCTS_MAX_PAGE_SIZE = 50;

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
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PRODUCTS_MAX_PAGE_SIZE)
    .optional()
    .default(PRODUCTS_PAGE_SIZE),
});

export const productSummarySchema = z.object({
  count: z.number(),
  total: z.number(),
});

export const productListResultSchema = z.object({
  items: z.array(productResponseSchema),
  summary: productSummarySchema.optional(),
  has_any: z.boolean().optional(),
  available_years: z.array(z.number().int()).optional(),
  page: z.number().int(),
  limit: z.number().int(),
  has_more: z.boolean(),
  total: z.number().int(),
});

export type ListProductsQueryDTO = z.input<typeof listProductsQuerySchema>;
export type ListProductsQuery = z.output<typeof listProductsQuerySchema>;
export type ProductSummary = z.infer<typeof productSummarySchema>;
export type ProductListResult = z.infer<typeof productListResultSchema>;

type CustomerRelation = { name: string } | { name: string }[] | null | undefined;

function getCustomerName(customers: CustomerRelation): string {
  if (!customers) return "Cliente";
  if (Array.isArray(customers)) return customers[0]?.name ?? "Cliente";
  return customers.name ?? "Cliente";
}

export function mapProductRow(row: {
  id: string;
  created_by: string;
  customer_id: string;
  jewelry_type: JewelryType;
  value: number | string;
  payment_status: boolean;
  created_at: string;
  updated_at: string;
  customers?: CustomerRelation;
}): ProductResponse {
  return {
    id: row.id,
    created_by: row.created_by,
    customer_id: row.customer_id,
    customer_name: getCustomerName(row.customers),
    jewelry_type: row.jewelry_type,
    value: typeof row.value === "string" ? Number(row.value) : row.value,
    payment_status: row.payment_status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
