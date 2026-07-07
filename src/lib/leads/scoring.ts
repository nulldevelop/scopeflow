import type { DomainStatus } from './domain-check'

export type ScoringWeights = {
  noWebsite: number
  siteOffline: number
  siteServerError: number
  siteClientError: number
  sslInvalid: number
  domainExpired: number
  domainExpiringSoon: number
}

export const defaultScoringWeights: ScoringWeights = {
  noWebsite: 60,
  siteOffline: 50,
  siteServerError: 35,
  siteClientError: 25,
  sslInvalid: 30,
  domainExpired: 40,
  domainExpiringSoon: 20,
}

export const DOMAIN_EXPIRING_SOON_DAYS = 60

export type ScoringInput = {
  hasWebsite: boolean
  domainStatus: DomainStatus | null
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Pure function over stored lead data (never baked in at creation time), so scores can be
 * recalculated whenever weights change or a domain check is re-run.
 */
export function calculateScore(
  input: ScoringInput,
  weights: ScoringWeights = defaultScoringWeights,
): number {
  if (!input.hasWebsite || !input.domainStatus) {
    return clampScore(weights.noWebsite)
  }

  const { http, ssl, domain } = input.domainStatus
  let score = 0

  if (http.status === 'unreachable' || http.status === 'timeout') {
    score += weights.siteOffline
  } else if (http.status === 'server_error') {
    score += weights.siteServerError
  } else if (http.status === 'client_error') {
    score += weights.siteClientError
  }

  if (ssl && !ssl.valid) {
    score += weights.sslInvalid
  }

  if (domain.daysRemaining !== null) {
    if (domain.daysRemaining < 0) {
      score += weights.domainExpired
    } else if (domain.daysRemaining < DOMAIN_EXPIRING_SOON_DAYS) {
      score += weights.domainExpiringSoon
    }
  }

  return clampScore(score)
}

export type ScoreReason = { label: string; points: number }

/** Same conditions as calculateScore, but returns the human-readable breakdown for the UI. */
export function explainScore(
  input: ScoringInput,
  weights: ScoringWeights = defaultScoringWeights,
): ScoreReason[] {
  if (!input.hasWebsite || !input.domainStatus) {
    return [{ label: 'Sem site cadastrado', points: weights.noWebsite }]
  }

  const { http, ssl, domain } = input.domainStatus
  const reasons: ScoreReason[] = []

  if (http.status === 'unreachable' || http.status === 'timeout') {
    reasons.push({
      label: 'Site fora do ar (inacessível/timeout)',
      points: weights.siteOffline,
    })
  } else if (http.status === 'server_error') {
    reasons.push({
      label: 'Site com erro de servidor (5xx)',
      points: weights.siteServerError,
    })
  } else if (http.status === 'client_error') {
    reasons.push({
      label: 'Site com erro de cliente (4xx)',
      points: weights.siteClientError,
    })
  }

  if (ssl && !ssl.valid) {
    reasons.push({
      label: 'Certificado SSL inválido ou expirado',
      points: weights.sslInvalid,
    })
  }

  if (domain.daysRemaining !== null) {
    if (domain.daysRemaining < 0) {
      reasons.push({
        label: 'Domínio expirado',
        points: weights.domainExpired,
      })
    } else if (domain.daysRemaining < DOMAIN_EXPIRING_SOON_DAYS) {
      reasons.push({
        label: `Domínio expira em ${domain.daysRemaining} dias`,
        points: weights.domainExpiringSoon,
      })
    }
  }

  if (reasons.length === 0) {
    reasons.push({ label: 'Nenhum problema técnico detectado', points: 0 })
  }

  return reasons
}
