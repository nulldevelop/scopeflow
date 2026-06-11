'use server'

import { createHash } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function publicSignContract(
  id: string,
  signerName: string,
  slug: string,
) {
  if (!id || !signerName?.trim() || !slug) {
    return { success: false, error: 'Parâmetros obrigatórios ausentes.' }
  }

  if (signerName.length > 200) {
    return { success: false, error: 'Nome muito longo.' }
  }

  try {
    // Scope by both id AND org slug to prevent IDOR across tenants
    const contract = await prisma.contract.findFirst({
      where: { id, organization: { slug } },
      include: { organization: { select: { slug: true } } },
    })

    if (!contract) return { success: false, error: 'Contrato não encontrado.' }
    if (contract.status !== 'enviado') {
      return {
        success: false,
        error: 'Este contrato não está disponível para assinatura.',
      }
    }
    if (contract.clientSigned) {
      return { success: false, error: 'Contrato já assinado.' }
    }

    const signedAt = new Date()
    const hashContent = `${contract.id}-client-${signerName}-${signedAt.toISOString()}`
    const hash = createHash('sha256')
      .update(hashContent)
      .digest('hex')
      .toUpperCase()
      .slice(0, 16)

    await prisma.contract.update({
      where: { id, organizationId: contract.organizationId },
      data: {
        clientSigned: true,
        clientSignedAt: signedAt,
        clientSignerName: signerName.trim(),
        clientSignatureHash: hash,
        status: 'assinado',
      },
    })

    revalidatePath(`/${slug}/contrato/${id}`)
    revalidatePath('/dashboard/contratos')
    revalidatePath(`/dashboard/contratos/${id}`)

    return { success: true, data: null }
  } catch (error) {
    console.error('[publicSignContract Error]', error)
    return { success: false, error: 'Erro ao assinar contrato.' }
  }
}
