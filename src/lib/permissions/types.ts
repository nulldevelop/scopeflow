export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

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

export type PermissionContext = {
  userId: string
  organizationId: string
  role: string
  userName: string
  userEmail: string
}
