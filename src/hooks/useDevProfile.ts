'use client'

import { toast } from 'sonner'
import { updateUserProfile } from '@/app/(auth)/dashboard/_actions/update-user-profile'
import { useSession } from '@/lib/auth-client'
import type { DevProfile } from '@/types'

interface BetterAuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  developerProfile?: string | null;
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
   * Calcula as horas de uma funcionalidade baseada no perfil.
   */
  const getHours = (feature: { 
    baseHours?: number | string | { toNumber: () => number }; 
    horasEstimadas?: number;
    name?: string;
    nome?: string;
    category?: { name: string };
    categoria?: string;
  }): number => {
    // Se a feature for nula, retorna 0
    if (!feature) return 0

    // Pega o valor base (compatível com diferentes formatos de objeto, inclusive Prisma.Decimal)
    let baseValue = 0;
    if (feature.baseHours) {
      if (typeof feature.baseHours === 'object' && 'toNumber' in feature.baseHours) {
        baseValue = feature.baseHours.toNumber();
      } else {
        baseValue = Number(feature.baseHours);
      }
    } else if (feature.horasEstimadas) {
      baseValue = feature.horasEstimadas;
    }
    
    const base = baseValue;

    if (!profile) return base

    // Lógica de Calibragem Dinâmica
    // Backend dev fazendo frontend leva 20% mais tempo
    const isBackend = profile === 'backend'
    const isFrontend = profile === 'frontend'

    // Tenta identificar se a feature é de front ou back pelo nome ou categoria
    const categoryName = (
      feature.category?.name ||
      feature.categoria ||
      ''
    ).toLowerCase()
    const featureName = (feature.name || feature.nome || '').toLowerCase()

    const isFrontFeature =
      categoryName.includes('front') ||
      featureName.includes('interface') ||
      featureName.includes('ui')
    const isBackFeature =
      categoryName.includes('back') ||
      featureName.includes('api') ||
      featureName.includes('banco')

    if (isBackend && isFrontFeature) {
      return base * 1.2
    }

    if (isFrontend && isBackFeature) {
      return base * 1.3
    }

    // Landing Page Dev é mais rápido em landing pages (80% do tempo)
    if (
      profile === 'landing_page' &&
      (categoryName.includes('landing') ||
        categoryName.includes('institucional'))
    ) {
      return base * 0.8
    }

    return base
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
