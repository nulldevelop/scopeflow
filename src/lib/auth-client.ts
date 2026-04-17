import { createAuthClient } from 'better-auth/react'
import { env } from './env'

// 🔹 Configuração centralizada
const authConfig = {
  baseURL: env.NEXT_PUBLIC_AUTH_URL,
}

// 🔹 Instância do client
const authClient = createAuthClient(authConfig)

// 🔹 Exportações
export const signIn = authClient.signIn
export const signUp = authClient.signUp
export const signOut = authClient.signOut
export const useSession = authClient.useSession
