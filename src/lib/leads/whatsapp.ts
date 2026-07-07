import { getDomainBadge } from './domain-badge'

/** Brazilian phone numbers scraped from Places rarely include the country code. */
export function toWhatsAppDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) return null
  if (digits.startsWith('55') && digits.length >= 12) return digits
  return `55${digits}`
}

type OutreachLead = {
  name: string
  hasWebsite: boolean
  domainStatus: unknown
}

/** What kind of pitch to open with — 'diagnostico' keeps the automatic, problem-specific message; the rest are fixed offers for when the outreach isn't about the website's technical state at all. */
export type OutreachOfferType =
  | 'diagnostico'
  | 'site_novo'
  | 'site_atualizacao'
  | 'sistema_agendamento'
  | 'sistema_oficina'

export const OUTREACH_OFFER_LABELS: Record<OutreachOfferType, string> = {
  diagnostico: 'Diagnóstico automático (site)',
  site_novo: 'Site novo',
  site_atualizacao: 'Atualização de site',
  sistema_agendamento: 'Sistema de agendamento',
  sistema_oficina: 'Sistema de gestão para oficina',
}

/** Opening line tied to the exact diagnosed problem, so the first message never reads as a cold, generic pitch. */
function buildDiagnosticMessage(lead: OutreachLead): string {
  const { label } = getDomainBadge(lead)

  switch (label) {
    case 'Sem site':
      return `Olá! Vi que a ${lead.name} ainda não tem site. Isso pode estar custando clientes pra concorrência que aparece primeiro no Google. Tem um tempo pra falarmos sobre a presença online de vocês?`
    case 'Offline':
      return `Olá! Notei que o site da ${lead.name} está fora do ar no momento. Você sabia? Posso ajudar a resolver isso.`
    case 'SSL inválido':
      return `Olá! O certificado de segurança (SSL) do site da ${lead.name} está inválido — isso mostra um aviso de "site não seguro" pra quem visita. Posso te ajudar a corrigir?`
    case 'Expirando':
      return `Olá! O domínio do site da ${lead.name} está perto de expirar. Quer que eu cuide disso antes que o site saia do ar?`
    case 'Não verificado':
      return `Olá! Estou entrando em contato sobre a presença online da ${lead.name}. Podemos conversar?`
    default:
      return `Olá! Vi o site da ${lead.name} e queria conversar sobre uma proposta para melhorar a presença digital de vocês.`
  }
}

export function buildOutreachMessage(lead: OutreachLead, offerType: OutreachOfferType = 'diagnostico'): string {
  switch (offerType) {
    case 'site_novo':
      return `Olá! Vi que a ${lead.name} ainda não tem site. Isso pode estar custando clientes pra concorrência que aparece primeiro no Google. Tem um tempo pra falarmos sobre a presença online de vocês?`
    case 'site_atualizacao':
      return `Olá! Vi o site da ${lead.name} e acho que uma atualização poderia ajudar bastante a atrair mais clientes. Tem um tempo pra conversarmos?`
    case 'sistema_agendamento':
      return `Olá! Trabalho com sistemas de agendamento online e imaginei que poderia ajudar a ${lead.name} a organizar melhor os horários e reduzir faltas. Tem um tempo pra conversarmos?`
    case 'sistema_oficina':
      return `Olá! Tenho um sistema de gestão pra oficinas — ordens de serviço, peças e clientes em um só lugar. Achei que poderia ser útil pra ${lead.name}. Tem um tempo pra conversarmos?`
    default:
      return buildDiagnosticMessage(lead)
  }
}

export function buildWhatsAppUrl(
  phone: string,
  lead: OutreachLead,
  offerType: OutreachOfferType = 'diagnostico',
): string | null {
  const digits = toWhatsAppDigits(phone)
  if (!digits) return null
  const message = buildOutreachMessage(lead, offerType)
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
