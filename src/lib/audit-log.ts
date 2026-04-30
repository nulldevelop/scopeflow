export type AuditLogInput = {
	action: string
	entity: string
	entityId?: string
	entityName?: string
	userId: string
	userName: string
	userEmail: string
	organizationId: string
	description?: string
	before?: Record<string, unknown>
	after?: Record<string, unknown>
}

export type AuditLogExtra = Partial<
	Pick<
		AuditLogInput,
		'entityId' | 'entityName' | 'description' | 'before' | 'after'
	>
>

/**
 * Grava um log de uma ação realizada no sistema.
 * @param {AuditLogInput} input - Dados do log a ser gravado.
 * @throws {Error} - Se houver um erro ao gravar o log.
 */
export async function logAction(input: AuditLogInput) {
	console.log('[AuditLog]', input)
}
