import type { DomainStatus } from './domain-check'

export type DomainBadgeTone = 'neutral' | 'critical' | 'warning' | 'ok'
export type DomainBadgeInfo = {
  label: string
  tone: DomainBadgeTone
  dotClassName: string
  textClassName: string
  badgeClassName: string
}

const TONE_CLASSES: Record<
  DomainBadgeTone,
  { dotClassName: string; textClassName: string; badgeClassName: string }
> = {
  neutral: {
    dotClassName: 'bg-gray-400',
    textClassName: 'text-gray-500',
    badgeClassName: 'bg-gray-100 text-gray-600',
  },
  critical: {
    dotClassName: 'bg-danger',
    textClassName: 'text-danger',
    badgeClassName: 'bg-danger-bg text-danger',
  },
  warning: {
    dotClassName: 'bg-accent-amber',
    textClassName: 'text-accent-amber',
    badgeClassName: 'bg-accent-amber-bg text-accent-amber',
  },
  ok: {
    dotClassName: 'bg-ok',
    textClassName: 'text-ok',
    badgeClassName: 'bg-ok-bg text-ok',
  },
}

function withTone(label: string, tone: DomainBadgeTone): DomainBadgeInfo {
  return { label, tone, ...TONE_CLASSES[tone] }
}

export function getDomainBadge(lead: { hasWebsite: boolean; domainStatus: unknown }): DomainBadgeInfo {
  if (!lead.hasWebsite) {
    return withTone('Sem site', 'neutral')
  }

  const status = lead.domainStatus as DomainStatus | null
  if (!status) {
    return withTone('Não verificado', 'neutral')
  }

  const isOffline =
    status.http.status === 'unreachable' ||
    status.http.status === 'timeout' ||
    status.http.status === 'server_error' ||
    status.http.status === 'client_error'

  if (isOffline) {
    return withTone('Offline', 'critical')
  }

  if (status.ssl && !status.ssl.valid) {
    return withTone('SSL inválido', 'critical')
  }

  if (status.domain.daysRemaining !== null && status.domain.daysRemaining < 60) {
    return withTone('Expirando', 'warning')
  }

  return withTone('OK', 'ok')
}
