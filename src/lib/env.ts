import { z } from 'zod'

// 🔹 Schema para servidor (Secrets)
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  AUTH_SECRET: z.string().min(10, 'A AUTH_SECRET deve ter pelo menos 10 caracteres'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID é obrigatório'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET é obrigatório'),
  GITHUB_CLIENT_ID: z.string().min(1, 'GITHUB_CLIENT_ID é obrigatório'),
  GITHUB_CLIENT_SECRET: z.string().min(1, 'GITHUB_CLIENT_SECRET é obrigatório'),
  DATABASE_HOST: z.string().min(1, 'DATABASE_HOST é obrigatório'),
  DATABASE_USER: z.string().min(1, 'DATABASE_USER é obrigatório'),
  DATABASE_PASSWORD: z.string().min(1, 'DATABASE_PASSWORD é obrigatório'),
  DATABASE_NAME: z.string().min(1, 'DATABASE_NAME é obrigatório'),
})

// 🔹 Schema para o cliente (Públicas)
const clientSchema = z.object({
  NEXT_PUBLIC_AUTH_URL: z.string().url('NEXT_PUBLIC_AUTH_URL deve ser uma URL válida'),
})

const isServer = typeof window === 'undefined'

// 🔹 Processamento das variáveis
const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  AUTH_SECRET: process.env.AUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_NAME: process.env.DATABASE_NAME,
  NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
}

// 🔹 Validação e interceptação de erros
const errors: string[] = []

if (isServer) {
  const serverResult = serverSchema.safeParse(processEnv)
  if (!serverResult.success) {
    serverResult.error.issues.forEach((issue) => {
      errors.push(`[SERVIDOR] ${issue.path.join('.')}: ${issue.message}`)
    })
  }
}

const clientResult = clientSchema.safeParse(processEnv)
if (!clientResult.success) {
  clientResult.error.issues.forEach((issue) => {
    errors.push(`[CLIENTE] ${issue.path.join('.')}: ${issue.message}`)
  })
}

// 🔹 Exibe erros se houver, mas permite que o app continue com fallbacks
if (errors.length > 0) {
  console.error('❌ Erro nas variáveis de ambiente:\n' + errors.join('\n'))
}

// 🔹 Export seguro e tipado
export const env = {
  ...processEnv,
  NODE_ENV: (process.env.NODE_ENV as any) || 'development',
  // Fallbacks para evitar crashes imediatos
  NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000',
} as z.infer<typeof serverSchema> & z.infer<typeof clientSchema>
