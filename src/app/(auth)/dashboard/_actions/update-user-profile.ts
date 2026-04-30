'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'
import type { DevProfile } from '@/types'

/**
 * Atualiza o perfil de desenvolvedor do usuário no banco de dados.
 */
export const updateUserProfile = withPermission(
  'update',
  'users',
  async (ctx, profile: DevProfile) => {
    try {
      await prisma.user.update({
        where: { id: ctx.userId },
        data: {
          developerProfile: profile,
        },
      })

      revalidatePath('/')

      return {
        success: true,
        data: profile,
      }
    } catch (error) {
      console.error('[updateUserProfile Error]', error)
      return {
        success: false,
        error: 'Erro ao atualizar o perfil de desenvolvedor.',
      }
    }
  },
)
