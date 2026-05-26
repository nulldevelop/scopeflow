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

    // 2. Mapeamento de Planos para IDs de Produto no AbacatePay
    const PRODUCT_IDS: Record<string, string | undefined> = {
      pro: process.env.ABACATEPAY_PRODUCT_PRO,
      equipe: process.env.ABACATEPAY_PRODUCT_EQUIPE,
    }

    const abacateProductId = PRODUCT_IDS[planId]

    if (!abacateProductId) {
      return {
        success: false,
        error: 'Plano não mapeado no sistema (Variável de ambiente ausente)',
      }
    }

    // Buscar o produto para garantir que ele existe
    const products = await abacatePay.products.list()
    const product = products.find((p) => p.id === abacateProductId)

    if (!product) {
      return { success: false, error: 'Plano não encontrado no AbacatePay' }
    }

    // 3. Criar Checkout de Assinatura
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_AUTH_URL ||
      'http://localhost:3000'
    const checkout = await abacatePay.checkouts.create({
      customerId: abacateCustomerId!,
      externalId: `checkout_${org.id}_${Date.now()}`,
      items: [{ id: product.id, quantity: 1 }],
      returnUrl: `${baseUrl}/dashboard/configuracoes?tab=pagamento`,
      completionUrl: `${baseUrl}/dashboard/configuracoes?tab=pagamento&success=true`,
    })

    return { success: true, data: { url: checkout.url } }
  } catch (error) {
    console.error('[Create Checkout Action Error]', error)
    return { success: false, error: 'Erro ao iniciar checkout.' }
  }
}
