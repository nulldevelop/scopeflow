export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type Module =
  | 'categories'
  | 'features'
  | 'quotes'
  | 'clients'
  | 'organizations'
  | 'users'

export type WithPermissionOptions = {
  module: Module
  log?: string
}

export type PermissionResult =
  | {
      allowed: true
      userId: string
      organizationId: string
      role: string
      userName: string
      userEmail: string
    }
  | {
      allowed: false
      error: string
    }

export type AuditLogExtra = {
  entityId?: string
  entityName?: string
  description?: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
}

export type PermissionContext = {
  userId: string
  organizationId: string
  role: string
  userName: string
  userEmail: string
  log: (extra: AuditLogExtra) => void
}
