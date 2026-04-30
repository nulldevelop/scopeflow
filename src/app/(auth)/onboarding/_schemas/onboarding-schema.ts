import { z } from 'zod'

export const onboardingSchema = z.object({
  // Identidade
  orgName: z.string().min(3, 'O nome da organização deve ter pelo menos 3 caracteres'),
  slug: z.string().min(3, 'O slug deve ter pelo menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'Slug inválido'),
  
  // Perfil e Segmento
  profile: z.enum(['landing_page', 'frontend', 'backend', 'fullstack', 'software_house', 'saas_startup'], {
    required_error: 'Selecione um perfil de trabalho',
  }),
  
  // Respostas Dinâmicas
  answers: z.object({
    // Dados Financeiros (Calculadora)
    companyName: z.string().optional(),
    taxRegime: z.string().optional(),
    taxPercentage: z.string().optional(),
    workHoursDay: z.string().optional(),
    workDaysMonth: z.string().optional(),
    desiredSalary: z.string().optional(),
    fixedCosts: z.string().optional(),
    contingencyReserve: z.string().optional(),
    profitMargin: z.string().optional(),
    
    // Legados/Específicos
    hourlyRate: z.string().optional(),
    techStack: z.string().optional(),
    workModel: z.string().optional(),
    teamSize: z.string().optional(),
    services: z.string().optional(),
    productName: z.string().optional(),
    stage: z.string().optional(),
    experience: z.string().optional(),
    mainLanguage: z.string().optional(),
  }),
  
  // Plano
  plan: z.enum(['free', 'basic', 'pro']),
  
  // Convites Opcionais
  invites: z.array(z.string().email('E-mail inválido')),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>
