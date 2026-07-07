import { z } from 'zod'

export const addLeadActivityInputSchema = z.object({
  content: z.string().min(1, 'Escreva algo antes de salvar.').max(5000),
})

export type AddLeadActivityInput = z.infer<typeof addLeadActivityInputSchema>
