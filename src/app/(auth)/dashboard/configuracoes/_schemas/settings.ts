import { z } from 'zod'

export const settingsSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  taxPercentage: z.string(),
  workHoursDay: z.string(),
  workDaysMonth: z.string(),
  desiredSalary: z.string(),
  fixedCosts: z.string(),
  profitMargin: z.string(),
})

export type SettingsInput = z.infer<typeof settingsSchema>
