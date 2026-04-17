import { z } from 'zod'

// 🔹 Schema das variáveis
const envSchema = z.object({
  // 🔐 Auth
  AUTH_SECRET: z.string().min(10),

  // 🌐 OAuth
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),

  // 🗄️ Database
  DATABASE_HOST: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),

  // ⚙️ Ambiente
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // 🌍 Front/Auth URL
  NEXT_PUBLIC_AUTH_URL: z.string().url(),
})

// 🔹 Parse + validação
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Erro nas variáveis de ambiente:\n')
  console.error(parsed.error.format())
  process.exit(1)
}

// 🔹 Export seguro e tipado
export const env = parsed.data
