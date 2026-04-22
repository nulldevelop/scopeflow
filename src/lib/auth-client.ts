import { organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

const authConfig = {
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000',
  plugins: [organizationClient()],
}

export const authClient = createAuthClient(authConfig)

export const { signIn, signUp, signOut, useSession, organization } = authClient
