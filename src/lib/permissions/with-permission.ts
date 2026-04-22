import { checkPermission } from './check-permission'
import type { Action, ActionResponse, PermissionContext } from './types'

export function withPermission<T extends unknown[], R>(
  action: Action,
  fn: (ctx: PermissionContext, ...args: T) => Promise<ActionResponse<R>>,
) {
  return async (...args: T): Promise<ActionResponse<R>> => {
    // 1️⃣ Valida permissão
    const permission = await checkPermission(action)

    if (!permission.allowed) {
      return { success: false, error: permission.error }
    }

    // 2️⃣ Contexto injetado
    const ctx: PermissionContext = {
      userId: permission.userId,
      organizationId: permission.organizationId,
      role: permission.role,
      userName: permission.userName,
      userEmail: permission.userEmail,
    }

    // 3️⃣ Executa ação protegida
    return await fn(ctx, ...args)
  }
}
