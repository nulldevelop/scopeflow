'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Quote, Feature, User } from '@/types'
import { mockQuotes } from '@/lib/mock/orcamentos'
import { mockFeatures } from '@/lib/mock/funcionalidades'
import { mockUser } from '@/lib/mock/usuario'

interface ScopeFlowContextType {
  quotes: Quote[]
  features: Feature[]
  user: User
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
