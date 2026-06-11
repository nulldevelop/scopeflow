'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Exclui permanentemente a conta do usuário autenticado.
 *
 * Remove, em uma única transação:
 *  - As organizações das quais o usuário é OWNER (cascateia clientes,
 *    orçamentos, contratos, catálogo, assinaturas e faturas).
 *  - O próprio usuário (cascateia sessões, contas OAuth, vínculos de
 *    membro e convites enviados).
 *
 * Operação irreversível.
 */
export async function deleteAccountAction(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return { success: false, error: 'Usuário não autenticado.' }
    }

    const userId = session.user.id

    // Organizações em que este usuário é o dono. Para um app solo, é a sua
    // própria organização; removê-la evita deixar dados órfãos sem membros.
    const ownedMemberships = await prisma.member.findMany({
      where: { userId, role: 'owner' },
      select: { organizationId: true },
    })
    const ownedOrgIds = ownedMemberships.map((m) => m.organizationId)

    await prisma.$transaction(async (tx) => {
      if (ownedOrgIds.length > 0) {
        await tx.organization.deleteMany({
          where: { id: { in: ownedOrgIds } },
        })
      }

      await tx.user.delete({ where: { id: userId } })
    })

    return { success: true }
  } catch (error) {
    console.error('[Delete Account Action Error]', error)
    return { success: false, error: 'Erro ao excluir a conta.' }
  }
}
