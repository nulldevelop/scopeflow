import { z } from 'zod'

function isValidCPF(digits: string): boolean {
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[9], 10)) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i], 10) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[10], 10)) return false

  return true
}

function formatCPF(digits: string): string {
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

function formatPhone(digits: string): string {
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

const documentSchema = z
  .string()
  .optional()
  .nullable()
  .transform((val) => {
    if (val === undefined) return undefined
    if (val === null) return null
    return val.replace(/\D/g, '')
  })
  .refine(
    (digits) => {
      if (digits === undefined || digits === null || digits === '') return true
      return digits.length === 11 && isValidCPF(digits)
    },
    { message: 'CPF inválido' },
  )
  .transform((digits) => {
    if (!digits || digits.length !== 11) return digits
    return formatCPF(digits)
  })

const phoneSchema = z
  .string()
  .optional()
  .nullable()
  .transform((val) => {
    if (val === undefined) return undefined
    if (val === null) return null
    return val.replace(/\D/g, '')
  })
  .refine(
    (digits) => {
      if (digits === undefined || digits === null || digits === '') return true
      return digits.length >= 10 && digits.length <= 11
    },
    { message: 'Telefone inválido' },
  )
  .transform((digits) => {
    if (!digits || digits.length < 10) return digits
    return formatPhone(digits)
  })

export const createClientSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  document: documentSchema,
  phone: phoneSchema,
  address: z.string().optional().or(z.literal('')),
})

export const updateClientSchema = createClientSchema.extend({
  id: z.string().uuid(),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
