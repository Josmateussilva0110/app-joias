import { z } from "zod"

export const UpdateEarningsPercentSchema = z.object({
  earnings_percent: z.coerce.number().int().min(0).max(100),
})

export type UpdateEarningsPercentDTO = z.infer<typeof UpdateEarningsPercentSchema>
