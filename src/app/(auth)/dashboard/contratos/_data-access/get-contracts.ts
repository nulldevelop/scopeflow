import { prisma } from '@/lib/prisma'

export async function getContracts(organizationId: string) {
  try {
    const contracts = await prisma.contract.findMany({
      where: { organizationId },
      include: {
        client: true,
        organization: { select: { name: true, slug: true, logo: true } },
        quote: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true as const, contracts }
  } catch (error) {
    console.error('[getContracts Error]', error)
    return { success: false as const, error: 'Erro ao buscar contratos' }
  }
}

export async function getContractById(organizationId: string, id: string) {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id, organizationId },
      include: {
        client: true,
        organization: { select: { name: true, slug: true, logo: true } },
        quote: { select: { id: true, title: true } },
      },
    })
    if (!contract) return { success: false as const, error: 'Contrato não encontrado' }
    return { success: true as const, contract }
  } catch (error) {
    console.error('[getContractById Error]', error)
    return { success: false as const, error: 'Erro ao buscar contrato' }
  }
}

export async function getPublicContractById(id: string, slug: string) {
  try {
    const contract = await prisma.contract.findFirst({
      where: { id, organization: { slug } },
      include: {
        client: true,
        organization: { select: { name: true, slug: true, logo: true } },
      },
    })
    if (!contract) return { success: false as const, error: 'Contrato não encontrado' }
    return { success: true as const, contract }
  } catch (error) {
    console.error('[getPublicContractById Error]', error)
    return { success: false as const, error: 'Erro ao buscar contrato' }
  }
}
