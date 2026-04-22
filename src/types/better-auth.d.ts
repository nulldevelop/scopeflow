import 'better-auth'

declare module 'better-auth' {
  interface Session {
    activeOrganizationId?: string
  }
}
