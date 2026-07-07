import { z } from 'zod'

export const createLeadInputSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().optional(),
  address: z.string().optional(),
  category: z.string().optional(),
  website: z.string().optional(),
})

export type CreateLeadInput = z.infer<typeof createLeadInputSchema>

export const updateLeadInputSchema = z.object({
  stage: z
    .enum(['NEW', 'CONTACTED', 'PROPOSAL_SENT', 'NEGOTIATING', 'WON', 'LOST'])
    .optional(),
  notes: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  category: z.string().optional(),
  website: z.string().optional(),
})

export type UpdateLeadInput = z.infer<typeof updateLeadInputSchema>
