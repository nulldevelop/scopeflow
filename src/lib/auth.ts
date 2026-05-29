import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { organization } from 'better-auth/plugins'
import { prisma } from './prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

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

  plugins: [organization()],
  advanced: {
    cookiePrefix: 'scopeflow',
  },
  databaseHooks: {
    session: {
      create: {
        // Toda sessão nova (ex.: login em outro navegador) nasce sem organização
        // ativa. Se o usuário já pertence a uma organização, ativamos a primeira
        // aqui — evita mandar de volta para o onboarding quem já se cadastrou.
        before: async (session) => {
          const membership = await prisma.member.findFirst({
            where: { userId: session.userId },
            orderBy: { createdAt: 'asc' },
            select: { organizationId: true },
          })

          return {
            data: {
              ...session,
              activeOrganizationId:
                membership?.organizationId ?? session.activeOrganizationId,
            },
          }
        },
      },
    },
  },
  user: {
    additionalFields: {
      developerProfile: {
        type: 'string',
        required: false,
      },
    },
  },
})
