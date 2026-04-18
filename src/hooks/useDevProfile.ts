'use client'

import { useScopeFlow } from '@/context/ScopeFlowContext'
import { Feature, DevProfile } from '@/types'

export function useDevProfile() {
  const { profile, setProfile } = useScopeFlow()

  const isRelevant = (module: Feature) => {
    if (!profile) return true
    return module.profile_tags.includes(profile)
  }

  const getHours = (module: Feature) => {
    if (!profile) return module.horasEstimadas
    return module.horasPorPerfil?.[profile] ?? module.horasEstimadas
  }

  return {
    profile,
    setProfile,
    isRelevant,
    getHours
  }
}
