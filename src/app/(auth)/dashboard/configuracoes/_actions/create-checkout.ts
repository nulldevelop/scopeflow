'use server'

import { headers } from 'next/headers'
import { abacatePay } from '@/lib/abacate-pay'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function createCheckoutAction(planId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user || !session?.session?.activeOrganizationId) {
      return { success: false, error: 'Não autenticado' }
    }

    const org = await prisma.organization.findUnique({
      where: { id: session.session.activeOrganizationId },
    })

    if (!org) {
      return { success: false, error: 'Organização não encontrada' }
    }

    // 1. Garantir que o cliente existe no AbacatePay
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

    // 2. Buscar o produto no AbacatePay (ID externo deve bater com o plano)
    const products = await abacatePay.products.list()
    const product = products.find((p) => p.externalId === planId)

    if (!product) {
      return { success: false, error: 'Plano não configurado no AbacatePay' }
    }

    // 3. Criar Checkout de Assinatura
    const checkout = await abacatePay.checkouts.create({
      customerId: abacateCustomerId!,
      externalId: `checkout_${org.id}_${Date.now()}`,
      items: [{ id: product.id, quantity: 1 }],
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/configuracoes?tab=pagamento`,
      completionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/configuracoes?tab=pagamento&success=true`,
    })

    return { success: true, data: { url: checkout.url } }
  } catch (error) {
    console.error('[Create Checkout Action Error]', error)
    return { success: false, error: 'Erro ao iniciar checkout.' }
  }
}
