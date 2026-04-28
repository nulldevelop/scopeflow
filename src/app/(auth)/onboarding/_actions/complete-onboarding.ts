'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { onboardingSchema, type OnboardingInput } from '../_schemas/onboarding-schema'

export async function completeOnboardingAction(values: OnboardingInput) {
  try {
    // 1. Validar Schema
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

    // 2. Criar Organização (Caso não tenha sido criada pelo cliente)
    // O Better-Auth já pode ter criado via client, mas garantimos a configuração extra aqui
    const org = await prisma.organization.findFirst({
      where: { slug: data.slug }
    })

    if (!org) {
       return { success: false, error: 'Organização não encontrada. Crie-a primeiro.' }
    }

    // 3. Salvar configurações de perfil e plano no banco
    // Aqui você pode atualizar o modelo de Organização ou criar um registro de 'Profile'
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        // Exemplo de campos que você pode ter no schema.prisma
        // Se não tiver esses campos, você pode salvar em um JSON ou tabela de settings
        metadata: {
          profile: data.profile,
          answers: data.answers,
          plan: data.plan,
          onboardedAt: new Date().toISOString(),
        }
      }
    })

    // 4. Processar Convites (Opcional)
    if (data.invites && data.invites.length > 0) {
      // Lógica para disparar convites via Better-Auth ou sua própria tabela
    }

    return { success: true, data: { orgId: org.id } }
  } catch (error) {
    console.error('[Onboarding Action Error]', error)
    return { success: false, error: 'Erro ao finalizar configuração.' }
  }
}
