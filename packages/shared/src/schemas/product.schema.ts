import { z } from "zod";

export const jewelryDescriptionSchema = z
  .string()
  .trim()
  .min(1, "Informe a joia.")
  .max(120, "Descrição muito longa (máx. 120 caracteres).");

export const createProductSchema = z.object({
  jewelry_type: jewelryDescriptionSchema,
  customer_id: z.uuid("Selecione um cliente válido."),
  value: z
    .number({ error: "Valor é obrigatório." })
    .positive("Valor deve ser maior que zero.")
    .max(999999999.99, "Valor muito alto."),
  payment_status: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema
  .extend({
    created_at: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Data da compra inválida.",
      }),
  })
  .partial()
  .refine(
    (data) =>
      data.jewelry_type !== undefined ||
      data.customer_id !== undefined ||
      data.value !== undefined ||
      data.payment_status !== undefined ||
      data.created_at !== undefined,
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
  jewelry_type: z.string(),
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
  jewelry_type: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(120).optional()
  ),
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

export const productAnalyticsQuerySchema = listProductsQuerySchema.omit({
  page: true,
  limit: true,
});

export const analyticsTrendPointSchema = z.object({
  month: z.number().int().min(1).max(12),
  label: z.string(),
  total: z.number(),
  count: z.number(),
});

export const analyticsRankItemSchema = z.object({
  name: z.string(),
  total: z.number(),
  count: z.number(),
});

export const analyticsPaymentSplitSchema = z.object({
  paid: z.object({
    total: z.number(),
    count: z.number(),
  }),
  unpaid: z.object({
    total: z.number(),
    count: z.number(),
  }),
});

export const analyticsSummarySchema = z.object({
  count: z.number(),
  total: z.number(),
  average_ticket: z.number(),
  unpaid_total: z.number(),
  unpaid_count: z.number(),
});

export const productAnalyticsSchema = z.object({
  summary: analyticsSummarySchema,
  monthly_trend: z.array(analyticsTrendPointSchema),
  payment_split: analyticsPaymentSplitSchema,
  top_jewelry: z.array(analyticsRankItemSchema),
  top_customers: z.array(analyticsRankItemSchema),
  available_years: z.array(z.number().int()),
});

export type ProductAnalyticsQueryDTO = z.input<typeof productAnalyticsQuerySchema>;
export type ProductAnalyticsQuery = z.output<typeof productAnalyticsQuerySchema>;
export type ProductAnalytics = z.infer<typeof productAnalyticsSchema>;
export type AnalyticsTrendPoint = z.infer<typeof analyticsTrendPointSchema>;
export type AnalyticsRankItem = z.infer<typeof analyticsRankItemSchema>;

export const filterSelectOptionSchema = z.object({
  value: z.union([z.string(), z.number(), z.null()]),
  label: z.string(),
});

export const productFilterOptionsSchema = z.object({
  years: z.array(filterSelectOptionSchema),
  months: z.array(filterSelectOptionSchema),
  payments: z.array(
    z.object({
      value: paymentFilterEnum,
      label: z.string(),
    })
  ),
  defaults: z.object({
    year: z.number().int().nullable(),
    month: z.number().int().nullable(),
    payment: paymentFilterEnum,
  }),
});

export const productFiltersQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export type ProductFilterOptions = z.infer<typeof productFilterOptionsSchema>;
export type ProductFiltersQueryDTO = z.input<typeof productFiltersQuerySchema>;
export type ProductFiltersQuery = z.output<typeof productFiltersQuerySchema>;

export const MONTH_SHORT_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

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
  jewelry_type: string;
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
