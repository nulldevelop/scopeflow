import { dash } from '@better-auth/infra'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { organization } from 'better-auth/plugins'
import { prisma } from './prisma'

export const auth = betterAuth({
  secret: process.env.AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'mysql',
  }),

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutos de cache local
    },
  },

  // O Better-Auth já gerencia o JWT internamente com a strategy 'jwt'
  // Mas podemos customizar o payload se necessário no futuro

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
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },

  plugins: [
    organization({
      // Garante que a organização ativa seja persistida e acessível
      persistActiveOrganization: true,
    }),
    dash(),
  ],
})
