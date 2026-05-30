'use server'

import { createHash } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function publicSignContract(id: string, signerName: string) {
  if (!id || !signerName?.trim()) {
    return { success: false, error: 'Nome do assinante é obrigatório.' }
  }

  try {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { organization: { select: { slug: true } } },
    })

    if (!contract) return { success: false, error: 'Contrato não encontrado.' }
    if (contract.status !== 'enviado') {
      return { success: false, error: 'Este contrato não está disponível para assinatura.' }
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
      where: { id },
      data: {
        clientSigned: true,
        clientSignedAt: signedAt,
        clientSignerName: signerName.trim(),
        clientSignatureHash: hash,
        status: 'assinado',
      },
    })

    revalidatePath(`/${contract.organization.slug}/contrato/${id}`)
    revalidatePath('/dashboard/contratos')
    revalidatePath(`/dashboard/contratos/${id}`)

    return { success: true, data: null }
  } catch (error) {
    console.error('[publicSignContract Error]', error)
    return { success: false, error: 'Erro ao assinar contrato.' }
  }
}

export async function publicCancelContractSign(id: string) {
  return { success: true, data: null }
}
