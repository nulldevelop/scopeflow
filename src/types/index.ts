export type ProjectStatus = 'rascunho' | 'enviada' | 'aprovada' | 'recusada' | 'expirada'

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  email: string
  image?: string
  member?: Member
}

export interface Member {
  id: string
  organizationId: string
  organization?: Organization
  userId: string
  role: string
  createdAt: string
}

export interface Client {
  id: string
  name: string
  email?: string
  document?: string
  phone?: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  organizationId: string
}

export interface Feature {
  id: string
  name: string
  description?: string
  baseHours: number
  complexity: 'baixa' | 'media' | 'alta'
  categoryId?: string
  category?: Category
  organizationId: string
}

export interface QuoteItem {
  id: string
  name: string
  description?: string
  hours: number
  unitValue: number
  order: number
  quoteId: string
  featureId?: string
}

export interface Quote {
  id: string
  title: string
  description?: string
  status: ProjectStatus
  
  // Valores
  totalHours: number
  totalValue: number
  hourlyRate: number
  
  // Condições
  discount: number
  urgencyFee: number
  entryAmount: number
  installments: number
  
  // Datas
  expirationDate?: string
  sentAt?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
  
  // Relações
  clientId?: string
  client?: Client
  organizationId: string
  items: QuoteItem[]
}
