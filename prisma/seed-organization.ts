import { prisma } from '@/lib/prisma'

export async function seedOrganization(organizationId: string) {
  // Atualmente vazio. O catálogo iniciará limpo.
  // Padrões podem ser adicionados via botão "Inicializar Padrões" no dashboard.
  console.log(`🌱 Organization ${organizationId} created. Catalog is empty.`)
}
