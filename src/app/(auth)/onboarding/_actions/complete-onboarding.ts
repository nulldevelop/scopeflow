'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface OnboardingData {
  profile: string
  details: {
    hourlyRate?: string
    teamSize?: string
    mainTech?: string
  }
}

export async function completeOnboardingAction(data: OnboardingData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.session) {
    return { success: false, error: 'Organização não encontrada.' }
  }

  const organizationId = (session.session as { activeOrganizationId?: string })
    .activeOrganizationId

  if (!organizationId) {
    return { success: false, error: 'Organização não encontrada.' }
  }

  // Salva os dados extras no metadata da organização
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      metadata: JSON.stringify({
        onboardingCompleted: true,
        professionalProfile: data.profile,
        ...data.details,
      }),
    },
  })

  // Também podemos atualizar o usuário se necessário
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      // O campo name e image já são gerenciados pelo auth
      // Se houvesse um campo 'profile' no User, atualizaríamos aqui
    },
  })

  revalidatePath('/')
  revalidatePath('/dashboard')

  return { success: true }
}
