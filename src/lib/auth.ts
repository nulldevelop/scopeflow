import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { organization } from 'better-auth/plugins'
import { env } from './env'
import { prisma } from './prisma'

// 🔹 Configuração principal
export const auth = betterAuth({
  // 🔐 Secret
  secret: env.AUTH_SECRET,

  // 🗄️ Banco
  database: prismaAdapter(prisma, {
    provider: 'mysql',
  }),

  // 🔹 Sessão
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
    additionalFields: {
      activeOrganizationId: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },

  plugins: [organization()],
})

// 🔹 Tipos inferidos
export type Session = typeof auth.$Infer.Session
