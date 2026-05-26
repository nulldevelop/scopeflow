'use server'

import { cookies, headers } from 'next/headers'
import { abacatePay } from '@/lib/abacate-pay'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { seedOrganization } from '../../../../../prisma/seed-organization'
import {
  type OnboardingInput,
  onboardingSchema,
} from '../_schemas/onboarding-schema'

export async function completeOnboardingAction(values: OnboardingInput) {
  try {
    // ... (keep 1. Validar Schema)
    const validatedFields = onboardingSchema.safeParse(values)
    if (!validatedFields.success) {
      return { success: false, error: 'Dados inválidos.' }
    }

    const data = validatedFields.data
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { success: false, error: 'Usuário não autenticado.' }
    }

    // 2. Criar ou Buscar Organização
    let org = await prisma.organization.findFirst({
      where: { slug: data.slug },
    })

    let isNewOrg = false
    if (!org) {
      // Criar organização via API do Better-Auth para garantir consistência
      const newOrgResponse = await auth.api.createOrganization({
        headers: await headers(),
        body: {
          name: data.orgName,
          slug: data.slug,
        },
      })

      if (!newOrgResponse) {
        return { success: false, error: 'Erro ao criar organização.' }
      }

      org = await prisma.organization.findUnique({
        where: { slug: data.slug },
      })
      isNewOrg = true
    }

    if (!org) {
      return { success: false, error: 'Erro ao processar organização.' }
    }

    // 3. Popular dados iniciais se for nova organização
    if (isNewOrg) {
      await seedOrganization(org.id)
    }

    // Garantir que o cliente AbacatePay existe para a org
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

    // 4. Salvar configurações de perfil e plano no banco
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        metadata: JSON.stringify({
          profile: data.profile,
          answers: data.answers,
          plan: data.plan,
          onboardedAt: new Date().toISOString(),
        }),
      },
    })

    // 4. Atualizar o perfil do desenvolvedor no usuário
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        developerProfile: data.profile,
      },
    })

    // 5. Definir a organização como ativa na sessão (Server-side)
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: { organizationId: org.id },
    })

    // 6. Forçar o cookie no navegador para o Middleware reconhecer imediatamente
    const cookieStore = await cookies()
    cookieStore.set('scopeflow.active_organization_id', org.id, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
      sameSite: 'lax',
    })

    // 7. Gerar URL de Checkout se for um plano pago
    let checkoutUrl = null
    if (data.plan === 'pro' || data.plan === 'equipe') {
      const PRODUCT_IDS: Record<string, string | undefined> = {
        pro: process.env.ABACATEPAY_PRODUCT_PRO,
        equipe: process.env.ABACATEPAY_PRODUCT_EQUIPE,
      }

      const abacateProductId = PRODUCT_IDS[data.plan]

      if (abacateProductId && abacateCustomerId) {
        try {
          const products = await abacatePay.products.list()
          const product = products.find((p) => p.id === abacateProductId)

          if (product) {
            const baseUrl =
              process.env.NEXT_PUBLIC_APP_URL ||
              process.env.NEXT_PUBLIC_AUTH_URL ||
              'http://localhost:3000'
            const checkout = await abacatePay.checkouts.create({
              customerId: abacateCustomerId,
              externalId: `checkout_${org.id}_${Date.now()}`,
              items: [{ id: product.id, quantity: 1 }],
              returnUrl: `${baseUrl}/dashboard`,
              completionUrl: `${baseUrl}/dashboard?success=true`,
            })
            checkoutUrl = checkout.url
          }
        } catch (checkoutError) {
          console.error('[Onboarding Checkout Error]', checkoutError)
          // Falha não crítica, deixa o usuário seguir e cobrar depois no dashboard
        }
      }
    }

    return { success: true, data: { orgId: org.id, checkoutUrl } }
  } catch (error) {
    console.error('[Onboarding Action Error]', error)
    return { success: false, error: 'Erro ao finalizar configuração.' }
  }
}
