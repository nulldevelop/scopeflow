'use server'

import { cookies, headers } from 'next/headers'
import { abacatePay, createPlanCheckout } from '@/lib/abacate-pay'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { seedOrganization } from '../../../../../prisma/seed-organization'
import {
  type OnboardingInput,
  onboardingSchema,
} from '../_schemas/onboarding-schema'

export async function completeOnboardingAction(values: OnboardingInput) {
  try {
    const validatedFields = onboardingSchema.safeParse(values)
    if (!validatedFields.success) {
      return { success: false, error: 'Dados inválidos.' }
    }

    const data = validatedFields.data
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return { success: false, error: 'Usuário não autenticado.' }
    }

    const existingMember = await prisma.member.findFirst({
      where: { userId: session.user.id },
      include: { organization: true },
    })

    let org = existingMember?.organization || null
    let isNewOrg = false

    if (!org) {
      const slugTaken = await prisma.organization.findFirst({
        where: { slug: data.slug },
        select: { id: true },
      })
      if (slugTaken) {
        return {
          success: false,
          error: 'Este endereço (slug) já está em uso. Escolha outro.',
        }
      }

      const newOrgResponse = await auth.api.createOrganization({
        headers: await headers(),
        body: { name: data.orgName, slug: data.slug },
      })
      if (!newOrgResponse) {
        return { success: false, error: 'Erro ao criar organização.' }
      }

      org = await prisma.organization.findUnique({ where: { slug: data.slug } })
      isNewOrg = true
    } else {
      if (org.slug !== data.slug) {
        const slugTaken = await prisma.organization.findFirst({
          where: { slug: data.slug, NOT: { id: org.id } },
          select: { id: true },
        })
        if (slugTaken) {
          return {
            success: false,
            error: 'Este novo endereço (slug) já está em uso.',
          }
        }
      }

      org = await prisma.organization.update({
        where: { id: org.id },
        data: { name: data.orgName, slug: data.slug },
      })
    }

    if (!org) {
      return { success: false, error: 'Erro ao processar organização.' }
    }

    if (isNewOrg) {
      await seedOrganization(org.id)
    }

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

    await prisma.user.update({
      where: { id: session.user.id },
      data: { developerProfile: data.profile },
    })

    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: { organizationId: org.id },
    })

    const cookieStore = await cookies()
    cookieStore.set('scopeflow.active_organization_id', org.id, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
      sameSite: 'lax',
    })

    let checkoutUrl = null
    if (data.plan === 'pro' || data.plan === 'equipe') {
      try {
        // O cliente AbacatePay só é necessário para planos pagos.
        // Criamos sob demanda para não bloquear o onboarding do plano grátis.
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
          data.plan,
          abacateCustomerId as string,
          org.id,
          '/dashboard',
          '/dashboard?success=true',
        )
        checkoutUrl = checkout.url
      } catch (checkoutError) {
        console.error('[Onboarding Checkout Error]', checkoutError)
        // Non-critical: user can complete payment from settings
      }
    }

    return { success: true, data: { orgId: org.id, checkoutUrl } }
  } catch (error) {
    console.error('[Onboarding Action Error]', error)
    return { success: false, error: 'Erro ao finalizar configuração.' }
  }
}
