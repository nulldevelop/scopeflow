import { z } from 'zod'

export const createClientSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  document: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
})

export const updateClientSchema = createClientSchema.extend({
  id: z.string().uuid(),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
