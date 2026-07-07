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

/** Opening line tied to the exact diagnosed problem, so the first message never reads as a cold, generic pitch. */
export function buildOutreachMessage(lead: OutreachLead): string {
  const { label } = getDomainBadge(lead)

  switch (label) {
    case 'Sem site':
      return `Olá! Vi que a ${lead.name} ainda não tem site. Isso pode estar custando clientes pra concorrência que aparece primeiro no Google. Posso te mostrar uma proposta rápida?`
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

export function buildWhatsAppUrl(phone: string, lead: OutreachLead): string | null {
  const digits = toWhatsAppDigits(phone)
  if (!digits) return null
  const message = buildOutreachMessage(lead)
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
