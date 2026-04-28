import { organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000',
  session: {
    // Mantém a sessão sincronizada entre abas
    activeSessionsLimit: 1,
  },
  plugins: [
    organizationClient({
      // Facilita a gestão de membros e convites no frontend
    }),
  ],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  organization,
  listOrganizations,
  setActiveOrganization,
} = authClient
