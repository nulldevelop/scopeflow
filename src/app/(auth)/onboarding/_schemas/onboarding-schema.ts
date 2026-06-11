import { z } from 'zod'

// Garante que um campo numérico (armazenado como string) não seja negativo.
const nonNegativeNumeric = (message: string) =>
  z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val === undefined || val === '') return true
        const n = Number(val)
        return !Number.isNaN(n) && n >= 0
      },
      { message },
    )

export const onboardingSchema = z.object({
  // Identidade
  orgName: z
    .string()
    .min(3, 'O nome da organização deve ter pelo menos 3 caracteres'),
  slug: z
    .string()
    .min(3, 'O slug deve ter pelo menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug inválido'),

  // Perfil e Segmento
  profile: z.enum([
    'landing_page',
    'frontend',
    'backend',
    'fullstack',
    'saas_startup',
  ]),

  // Respostas Dinâmicas
  answers: z.object({
    // Senioridade (prêmio sobre o valor/hora)
    seniorityLevel: z.enum(['junior', 'pleno', 'senior']).optional(),

    // Dados Financeiros (Calculadora)
    companyName: z.string().optional(),
    taxRegime: z.string().optional(),
    taxPercentage: nonNegativeNumeric('O imposto não pode ser negativo'),
    workHoursDay: nonNegativeNumeric('As horas não podem ser negativas'),
    workDaysMonth: nonNegativeNumeric('Os dias não podem ser negativos'),
    desiredSalary: nonNegativeNumeric('O valor não pode ser negativo'),
    fixedCosts: nonNegativeNumeric('Os custos não podem ser negativos'),
    contingencyReserve: nonNegativeNumeric('O valor não pode ser negativo'),
    profitMargin: nonNegativeNumeric('A margem não pode ser negativa'),

    // Legados/Específicos
    hourlyRate: z.string().optional(),
    techStack: z.string().optional(),
    workModel: z.string().optional(),
    services: z.string().optional(),
    productName: z.string().optional(),
    stage: z.string().optional(),
    experience: z.string().optional(),
    mainLanguage: z.string().optional(),
  }),

  // Plano
  plan: z.enum(['free', 'pro', 'equipe']),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>
