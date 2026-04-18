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
  valorHora: number
  plano: 'free' | 'pro' | 'enterprise'
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

export type FeatureComplexity = 'baixa' | 'media' | 'alta'

export type DevProfile = 
  | 'landing_page' 
  | 'frontend' 
  | 'backend' 
  | 'fullstack' 
  | 'software_house' 
  | 'saas'

export interface Feature {
  id: string
  nome: string
  descricao: string
  categoria: string
  horasEstimadas: number // Default/Fallback hours
  horasPorPerfil?: Partial<Record<DevProfile, number>>
  profile_tags: DevProfile[]
  complexidade: FeatureComplexity
}

export interface QuoteItem {
  id: string
  nome: string
  horas: number
  valorUnitario: number
  order?: number
  quoteId?: string
  featureId?: string
}

export interface Quote {
  id: string
  titulo: string
  clienteNome: string
  clienteEmail: string
  status: ProjectStatus
  totalHoras: number
  totalValor: number
  prazoSemanas: number
  modulos: number
  entrada: number
  parcelas: number
  criadoEm: string
  enviadoEm?: string
  validoAte: string
  itens: QuoteItem[]
  valorHora: number
  desconto: number // em porcentagem
  acrescimoUrgencia: number // em porcentagem
  notasInternas?: string
  
  // Relações legadas/futuras para compatibilidade
  clientId?: string
  client?: Client
  organizationId?: string
}
