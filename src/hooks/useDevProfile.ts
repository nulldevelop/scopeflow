'use client'

import { toast } from 'sonner'
import { updateUserProfile } from '@/app/(auth)/dashboard/_actions/update-user-profile'
import { useSession } from '@/lib/auth-client'
import type { DevProfile } from '@/types'

interface BetterAuthUser {
  id: string
  email: string
  emailVerified: boolean
  name: string
  createdAt: Date
  updatedAt: Date
  image?: string | null
  developerProfile?: string | null
}

/**
 * Hook para gerenciar o perfil de desenvolvedor do usuário.
 * Agora salva diretamente no banco de dados via Server Action.
 */
export function useDevProfile() {
  const { data: session } = useSession()

  // O perfil vem da sessão (que é alimentada pelo banco de dados)
  // Usamos uma interface local para garantir tipagem forte sem o uso de 'any'
  const user = session?.user as BetterAuthUser | undefined
  const profile = user?.developerProfile as DevProfile | undefined

  /**
   * Atualiza o perfil no banco de dados.
   */
  const setProfile = async (newProfile: DevProfile) => {
    try {
      const result = await updateUserProfile(newProfile)

      if (result.success) {
        toast.success('Perfil atualizado!')
        // Força o recarregamento da página para garantir que a sessão do Better-Auth seja atualizada
        // e o modal de perfil desapareça imediatamente.
        window.location.reload()
      } else {
        toast.error(result.error || 'Erro ao salvar perfil')
      }
    } catch (_error) {
      toast.error('Ocorreu um erro inesperado')
    }
  }

  /**
   * Retorna as horas-base puras de uma funcionalidade.
   *
   * A senioridade é precificada via multiplicador no valor/hora (ver
   * `@/lib/pricing`), não cortando horas. Por isso este cálculo NÃO ajusta as
   * horas por perfil/especialização — cobrar menos por ser mais rápido (ou mais
   * por ser pior no assunto) penalizava a entrega. As horas representam o
   * tamanho da feature, igual para qualquer dev.
   */
  const getHours = (feature: {
    baseHours?: number | string | { toNumber(): number }
    horasEstimadas?: number
  }): number => {
    // Se a feature for nula, retorna 0
    if (!feature) return 0

    // Pega o valor base (compatível com diferentes formatos de objeto, inclusive Prisma.Decimal)
    if (feature.baseHours) {
      if (
        typeof feature.baseHours === 'object' &&
        'toNumber' in feature.baseHours
      ) {
        return feature.baseHours.toNumber()
      }
      return Number(feature.baseHours)
    }

    if (feature.horasEstimadas) {
      return feature.horasEstimadas
    }

    return 0
  }

  /**
   * Verifica se uma funcionalidade é relevante para o perfil atual.
   */
  const isRelevant = (feature: { profile_tags?: DevProfile[] }): boolean => {
    if (!profile) return true

    // Se a feature tiver tags de perfil, verifica se o perfil atual está lá
    if (feature.profile_tags && feature.profile_tags.length > 0) {
      return feature.profile_tags.includes(profile)
    }

    return true
  }

  return {
    profile,
    setProfile,
    getHours,
    isRelevant,
    isLoading: !session && !profile,
  }
}
