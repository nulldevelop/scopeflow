import { checkPermission } from './check-permission'
import type {
  Action,
  ActionResponse,
  Module,
  PermissionContext,
  WithPermissionOptions,
} from './types'

/**
 * Wrapper profissional para Server Actions que valida permissões e provê contexto.
 * @param action Ação desejada (create, read, etc)
 * @param module Módulo onde a ação ocorre
 * @param fn A função da Action que será executada se permitido
 */
export function withPermission<TArgs extends unknown[], TResponse>(
  action: Action,
  module: Module,
  fn: (ctx: PermissionContext, ...args: TArgs) => Promise<ActionResponse<TResponse>>,
) {
  return async (...args: TArgs): Promise<ActionResponse<TResponse>> => {
    try {
      const permission = await checkPermission(action, module)

      if (!permission.allowed) {
        return { success: false, error: permission.error }
      }

      const ctx: PermissionContext = {
        userId: permission.userId,
        organizationId: permission.organizationId,
        role: permission.role,
        userName: permission.userName,
        userEmail: permission.userEmail,
        log: (extra) => {
          console.log(`[AuditLog] User ${permission.userId} performed ${action} on ${module}`, extra)
        },
      }

      return await fn(ctx, ...args)
    } catch (error) {
      console.error(`[withPermission Error] ${module}:${action}`, error)
      return {
        success: false,
        error: 'Ocorreu um erro inesperado ao processar sua solicitação.'
      }
    }
  }
}
