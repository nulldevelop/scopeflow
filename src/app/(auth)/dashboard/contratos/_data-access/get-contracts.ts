import { prisma } from '@/lib/prisma'

export type OrgLegal = {
  document: string | null
  address: string | null
  legalRep: string | null
}

/** Extracts the CONTRATADA legal data stored in organization.metadata JSON. */
export function parseOrgLegal(metadata: string | null): OrgLegal {
  try {
    const parsed = metadata ? JSON.parse(metadata) : {}
    const legal = parsed?.legal ?? {}
    return {
      document: legal.document ?? null,
      address: legal.address ?? null,
      legalRep: legal.legalRep ?? null,
    }
  } catch {
    return { document: null, address: null, legalRep: null }
  }
}

export async function getContracts(organizationId: string) {
  try {
    const contracts = await prisma.contract.findMany({
      where: { organizationId },
      include: {
        client: true,
        organization: {
          select: { name: true, slug: true, logo: true, metadata: true },
        },
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
        organization: {
          select: { name: true, slug: true, logo: true, metadata: true },
        },
        quote: { select: { id: true, title: true } },
      },
    })
    if (!contract)
      return { success: false as const, error: 'Contrato não encontrado' }
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
        organization: {
          select: { name: true, slug: true, logo: true, metadata: true },
        },
      },
    })
    if (!contract)
      return { success: false as const, error: 'Contrato não encontrado' }
    return { success: true as const, contract }
  } catch (error) {
    console.error('[getPublicContractById Error]', error)
    return { success: false as const, error: 'Erro ao buscar contrato' }
  }
}
