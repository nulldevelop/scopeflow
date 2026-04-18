export type ProjectStatus = 'rascunho' | 'enviada' | 'aprovada' | 'recusada'

export interface QuoteItem {
  id: string
  nome: string
  horas: number
  valorUnitario: number
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
  desconto?: number // em porcentagem
  acrescimoUrgencia?: number // em porcentagem
  notasInternas?: string
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

export interface User {
  nome: string
  email: string
  valorHora: number
  plano: 'free' | 'pro' | 'enterprise'
  avatar?: string
}
