import { dash } from '@better-auth/infra'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { organization } from 'better-auth/plugins'
import { prisma } from './prisma'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'mysql',
  }),

  // Garante que o state do OAuth seja mantido corretamente em dev
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutos de cache local
    },
  },

  cookies: {
    sessionToken: {
      name: 'scopeflow.session_token',
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

  plugins: [
    organization(),
    dash(),
  ],
})
