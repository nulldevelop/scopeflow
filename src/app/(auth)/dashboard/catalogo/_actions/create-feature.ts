'use server'

import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'


export const createFeatureAction = withPermission(
  'create',
  async (
    ctx,
    data: {
      name: string
      description?: string
      baseHours: number
      complexity?: string
      categoryId?: string | null
    },
  ) => {
    const result = await prisma.feature.create({
      data: {
        name: data.name,
        description: data.description,
        baseHours: data.baseHours,
        complexity: data.complexity || 'media',
        categoryId: data.categoryId || null,
        organizationId: ctx.organizationId,
      },
    })
    return { success: true, data: result }
  },
  { module: 'features' },
)

export const updateFeatureAction = withPermission(
  'update',
  async (
    ctx,
    id: string,
    data: {
      name?: string
      description?: string
      baseHours?: number
      complexity?: string
      categoryId?: string | null
    },
  ) => {
    const result = await prisma.feature.update({
      where: { id },
      data,
    })
    return { success: true, data: result }
  },
  { module: 'features' },
)

export const deleteFeatureAction = withPermission(
  'delete',
  async (ctx, id: string) => {
    await prisma.feature.delete({ where: { id } })
    return { success: true, data: undefined }
  },
  { module: 'features' },
)
