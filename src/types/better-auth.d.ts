import { auth } from '@/lib/auth'

declare module 'better-auth' {
  interface Session {
    activeOrganizationId?: string | null
  }

  interface User {
    // Campos adicionais do usuário se houver (ex: role global)
  }
}

// Opcional: exportar tipos inferidos do Better Auth
export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.User
