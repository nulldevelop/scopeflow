import { prisma } from '@/lib/prisma'

export async function seedDefaultCategories(organizationId: string) {
  const defaultCategories = [
    'Autenticação',
    'Pagamentos',
    'Dashboard',
    'E-mail',
    'Upload',
    'CMS',
    'API',
    'Integrações',
    'Outro',
  ]

  await prisma.category.createMany({
    data: defaultCategories.map((name) => ({
      name,
      organizationId,
    })),
  })

  return await prisma.category.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      name: 'asc',
    },
  })
}
