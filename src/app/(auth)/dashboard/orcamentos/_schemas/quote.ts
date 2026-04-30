import { z } from 'zod'

export const quoteItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'O nome é obrigatório'),
  description: z.string().optional().nullable(),
  hours: z.coerce.number().min(0, 'A quantidade de horas deve ser positiva'),
  unitValue: z.coerce.number().min(0, 'O valor unitário deve ser positivo'),
  order: z.number().int().default(0),
  featureId: z.string().optional().nullable(),
})

export const createQuoteSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().optional().nullable(),
  clientId: z.string().uuid('Selecione um cliente válido').optional().nullable(),
  totalHours: z.coerce.number().min(0),
  totalValue: z.coerce.number().min(0),
  hourlyRate: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  urgencyFee: z.coerce.number().min(0).default(0),
  entryAmount: z.coerce.number().min(0).default(0),
  installments: z.coerce.number().int().min(1).default(1),
  expirationDate: z.date().optional().nullable(),
  items: z.array(quoteItemSchema).optional().default([]),
})

export const updateQuoteSchema = createQuoteSchema.extend({
  id: z.string().uuid(),
  status: z.string().optional(),
})

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>
export type QuoteItemInput = z.infer<typeof quoteItemSchema>
