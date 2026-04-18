'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Quote, Feature, User, DevProfile } from '@/types'
import { mockQuotes } from '@/lib/mock/orcamentos'
import { mockFeatures } from '@/lib/mock/funcionalidades'
import { mockUser } from '@/lib/mock/usuario'

interface ScopeFlowContextType {
  quotes: Quote[]
  features: Feature[]
  user: User
  profile: DevProfile | null
  setProfile: (profile: DevProfile) => void
  addQuote: (quote: Quote) => void
  updateQuote: (quote: Quote) => void
  deleteQuote: (id: string) => void
  addFeature: (feature: Feature) => void
  updateFeature: (feature: Feature) => void
  deleteFeature: (id: string) => void
}

const ScopeFlowContext = createContext<ScopeFlowContextType | undefined>(
  undefined,
)

export function ScopeFlowProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes)
  const [features, setFeatures] = useState<Feature[]>(mockFeatures)
  const [user] = useState<User>(mockUser)
  const [profile, setProfileState] = useState<DevProfile | null>(null)

  // Carregar perfil do localStorage apenas após a montagem (lado do cliente)
  useEffect(() => {
    const savedProfile = localStorage.getItem('scopeflow-profile') as DevProfile | null
    if (savedProfile) {
      setProfileState(savedProfile)
    }
  }, [])

  const setProfile = (newProfile: DevProfile) => {
    setProfileState(newProfile)
    localStorage.setItem('scopeflow-profile', newProfile)
  }

  const addQuote = (quote: Quote) => setQuotes((prev) => [quote, ...prev])
  const updateQuote = (quote: Quote) =>
    setQuotes((prev) => prev.map((q) => (q.id === quote.id ? quote : q)))
  const deleteQuote = (id: string) =>
    setQuotes((prev) => prev.filter((q) => q.id !== id))

  const addFeature = (feature: Feature) =>
    setFeatures((prev) => [feature, ...prev])
  const updateFeature = (feature: Feature) =>
    setFeatures((prev) => prev.map((f) => (f.id === feature.id ? feature : f)))
  const deleteFeature = (id: string) =>
    setFeatures((prev) => prev.filter((f) => f.id !== id))

  return (
    <ScopeFlowContext.Provider
      value={{
        quotes,
        features,
        user,
        profile,
        setProfile,
        addQuote,
        updateQuote,
        deleteQuote,
        addFeature,
        updateFeature,
        deleteFeature,
      }}
    >
      {children}
    </ScopeFlowContext.Provider>
  )
}

export function useScopeFlow() {
  const context = useContext(ScopeFlowContext)
  if (context === undefined) {
    throw new Error('useScopeFlow must be used within a ScopeFlowProvider')
  }
  return context
}
