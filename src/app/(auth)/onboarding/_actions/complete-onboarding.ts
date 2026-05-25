'use server'

import { cookies, headers } from 'next/headers'
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
      // @ts-expect-error - createOrganization é injetado pelo plugin
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
    // @ts-expect-error - setActiveOrganization é injetado pelo plugin
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

    // 7. Processar Convites (Opcional)
    if (data.invites && data.invites.length > 0) {
      // Lógica para disparar convites via Better-Auth ou sua própria tabela
    }

    return { success: true, data: { orgId: org.id } }
  } catch (error) {
    console.error('[Onboarding Action Error]', error)
    return { success: false, error: 'Erro ao finalizar configuração.' }
  }
}
