'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/permissions/with-permission'
import { settingsSchema, type SettingsInput } from '../_schemas/settings'

export const updateSettingsAction = withPermission<[SettingsInput], null>(
  'update',
  'organizations', // Using organizations module for general settings
  async (ctx, values) => {
    try {
      const validatedFields = settingsSchema.safeParse(values)
      if (!validatedFields.success) {
        return { success: false, error: 'Dados inválidos.' }
      }

      const data = validatedFields.data

      // 1. Update User (Better-Auth handles this usually, but we update our DB too)
      await prisma.user.update({
        where: { id: ctx.userId },
        data: {
          name: data.name,
          email: data.email,
        },
      })

      // 2. Update Organization Metadata
      const org = await prisma.organization.findUnique({
        where: { id: ctx.organizationId },
        select: { metadata: true },
      })

      const existingMetadata = org?.metadata ? JSON.parse(org.metadata) : {}
      
      const newMetadata = {
        ...existingMetadata,
        answers: {
          ...existingMetadata.answers,
          taxPercentage: data.taxPercentage,
          workHoursDay: data.workHoursDay,
          workDaysMonth: data.workDaysMonth,
          desiredSalary: data.desiredSalary,
          fixedCosts: data.fixedCosts,
          profitMargin: data.profitMargin,
        },
        updatedAt: new Date().toISOString(),
      }

      await prisma.organization.update({
        where: { id: ctx.organizationId },
        data: {
          metadata: JSON.stringify(newMetadata),
        },
      })

      revalidatePath('/dashboard/configuracoes')
      return { success: true, data: null }
    } catch (error) {
      console.error('[Update Settings Action Error]', error)
      return { success: false, error: 'Erro ao salvar configurações.' }
    }
  },
)
