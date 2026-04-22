import { createAuthClient } from 'better-auth/react'
import { organizationClient } from 'better-auth/client/plugins'
import { env } from './env'

// 🔹 Configuração centralizada
const authConfig = {
  baseURL: env.NEXT_PUBLIC_AUTH_URL,
  plugins: [organizationClient()],
}

// 🔹 Instância do client
export const authClient = createAuthClient(authConfig)

// 🔹 Exportações
export const { signIn, signUp, signOut, useSession, organization } = authClient
