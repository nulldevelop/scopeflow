import { z } from 'zod'

export const contractSchema = z.object({
  title: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  contractNumber: z.string().optional(),
  clientId: z.string().min(1, 'Selecione um cliente'),
  quoteId: z.string().optional(),
  totalValue: z.number().min(0, 'Valor deve ser positivo'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  objectClause: z.string().optional(),
  timelineClause: z.string().optional(),
  paymentClause: z.string().optional(),
  ipClause: z.string().optional(),
  expiresAt: z.string().optional(),
})

export type ContractInput = z.infer<typeof contractSchema>
