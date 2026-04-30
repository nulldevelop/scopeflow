import type { auth } from '@/lib/auth'

declare module 'better-auth' {
  interface User {
    developerProfile?: string | null
  }
  interface Session {
    activeOrganizationId?: string | null
  }
}

declare module 'better-auth/react' {
  interface User {
    developerProfile?: string | null
  }
}

declare module 'better-auth/client' {
  interface User {
    developerProfile?: string | null
  }
}

// Opcional: exportar tipos inferidos do Better Auth
export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.User
