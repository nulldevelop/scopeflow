import { checkPermission } from './check-permission'
import type {
  Action,
  ActionResponse,
  Module,
  PermissionContext,
  WithPermissionOptions,
} from './types'

export function withPermission<T extends unknown[], R>(
  action: Action,
  fn: (ctx: PermissionContext, ...args: T) => Promise<ActionResponse<R>>,
  options: WithPermissionOptions | Module,
) {
  return async (...args: T): Promise<ActionResponse<R>> => {
    const opts: WithPermissionOptions =
      typeof options === 'string' ? { module: options } : options

    if (!opts.module) {
      return { success: false, error: 'Módulo não informado' }
    }

    const permission = await checkPermission(action, opts.module)

    if (!permission.allowed) {
      return { success: false, error: permission.error }
    }

    const ctx: PermissionContext = {
      userId: permission.userId,
      organizationId: permission.organizationId,
      role: permission.role,
      userName: permission.userName,
      userEmail: permission.userEmail,
      log: () => {},
    }

    return fn(ctx, ...args)
  }
}
