'use server'

import { headers } from 'next/headers'
import { abacatePay, createPlanCheckout } from '@/lib/abacate-pay'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function createCheckoutAction(planId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user || !session?.session?.activeOrganizationId) {
      return { success: false, error: 'Não autenticado' }
    }

    const org = await prisma.organization.findUnique({
      where: { id: session.session.activeOrganizationId },
      select: { id: true, name: true, abacateCustomerId: true },
    })

    if (!org) {
      return { success: false, error: 'Organização não encontrada' }
    }

    let abacateCustomerId = org.abacateCustomerId
    if (!abacateCustomerId) {
      const customer = await abacatePay.customers.create({
        email: session.user.email,
        name: org.name,
      })
      abacateCustomerId = customer.id
      await prisma.organization.update({
        where: { id: org.id },
        data: { abacateCustomerId },
      })
    }

    const checkout = await createPlanCheckout(
      planId,
      abacateCustomerId as string,
      org.id,
      '/dashboard/configuracoes?tab=pagamento',
      '/dashboard/configuracoes?tab=pagamento&success=true',
    )

    return { success: true, data: { url: checkout.url } }
  } catch (error) {
    console.error('[Create Checkout Action Error]', error)
    return { success: false, error: 'Erro ao iniciar checkout.' }
  }
}
