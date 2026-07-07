import type { LeadStage } from '@/lib/prisma'

export const STAGE_ORDER: LeadStage[] = ['NEW', 'CONTACTED', 'PROPOSAL_SENT', 'NEGOTIATING', 'WON', 'LOST']

export const STAGE_LABELS: Record<LeadStage, string> = {
  NEW: 'Novo',
  CONTACTED: 'Contatado',
  PROPOSAL_SENT: 'Proposta enviada',
  NEGOTIATING: 'Negociando',
  WON: 'Fechado',
  LOST: 'Perdido',
}

/** Text color tied to how the stage affects the sales outcome, not just decoration. */
export const STAGE_TEXT_CLASS: Record<LeadStage, string> = {
  NEW: 'text-gray-500',
  CONTACTED: 'text-gray-900',
  PROPOSAL_SENT: 'text-accent-amber',
  NEGOTIATING: 'text-accent-amber',
  WON: 'text-ok',
  LOST: 'text-danger',
}
