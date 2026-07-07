import { z } from 'zod'

export const updateLeadInputSchema = z.object({
  stage: z
    .enum(['NEW', 'CONTACTED', 'PROPOSAL_SENT', 'NEGOTIATING', 'WON', 'LOST'])
    .optional(),
  notes: z.string().optional(),
})

export type UpdateLeadInput = z.infer<typeof updateLeadInputSchema>
