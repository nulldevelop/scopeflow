import { dash } from '@better-auth/infra'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { organization } from 'better-auth/plugins'
import { prisma } from './prisma'

// 🔹 Configuração principal
export const auth = betterAuth({
  secret: process.env.AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'mysql',
  }),

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
  },

  // 🔹 JWT
  jwt: {
    secret: process.env.AUTH_SECRET,
  },

  // 🍪 Cookies
  cookies: {
    sessionToken: {
      name: 'auth_token',
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
    },
  },

  // 🌐 OAuth
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },

  plugins: [organization(), dash()],
})
