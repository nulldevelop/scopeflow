import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
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
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
  },

  // 🔹 JWT
  jwt: {
    secret: env.AUTH_SECRET,
  },

  // 🍪 Cookies
  cookies: {
    sessionToken: {
      name: 'auth_token',
      options: {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
    },
  },

  // 🌐 OAuth
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
})
