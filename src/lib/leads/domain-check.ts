import * as tls from 'node:tls'

const HTTP_TIMEOUT_MS = 8_000
const TLS_TIMEOUT_MS = 8_000
const RDAP_TIMEOUT_MS = 10_000

export type HttpCheckStatus = 'online' | 'client_error' | 'server_error' | 'timeout' | 'unreachable'

export type HttpCheckResult = {
  status: HttpCheckStatus
  statusCode: number | null
}

export type SslCheckResult = {
  valid: boolean
  validTo: string | null
  daysRemaining: number | null
  error: string | null
}

export type DomainExpiryResult = {
  expiresAt: string | null
  daysRemaining: number | null
  error: string | null
}

export type DomainStatus = {
  checkedAt: string
  http: HttpCheckResult
  ssl: SslCheckResult | null
  domain: DomainExpiryResult
}

/** GET the site and bucket the outcome into online/4xx/5xx/timeout/unreachable. */
export async function checkHttpStatus(url: string): Promise<HttpCheckResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
    })
    if (response.status >= 500) return { status: 'server_error', statusCode: response.status }
    if (response.status >= 400) return { status: 'client_error', statusCode: response.status }
    return { status: 'online', statusCode: response.status }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { status: 'timeout', statusCode: null }
    }
    return { status: 'unreachable', statusCode: null }
  } finally {
    clearTimeout(timer)
  }
}

/** Opens a raw TLS socket to inspect the certificate, tolerating invalid/expired certs so we can report on them. */
export function checkSsl(hostname: string, port = 443): Promise<SslCheckResult> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: TLS_TIMEOUT_MS,
      },
      () => {
        const cert = socket.getPeerCertificate()
        const authorized = socket.authorized
        const authorizationError = socket.authorizationError
        socket.end()

        if (!cert || Object.keys(cert).length === 0) {
          resolve({
            valid: false,
            validTo: null,
            daysRemaining: null,
            error: 'Certificado não encontrado',
          })
          return
        }

        const validTo = new Date(cert.valid_to)
        const daysRemaining = Math.floor((validTo.getTime() - Date.now()) / 86_400_000)

        resolve({
          valid: authorized && daysRemaining >= 0,
          validTo: validTo.toISOString(),
          daysRemaining,
          error: authorized ? null : String(authorizationError),
        })
      },
    )

    socket.on('error', (error) => {
      resolve({
        valid: false,
        validTo: null,
        daysRemaining: null,
        error: error.message,
      })
    })

    socket.on('timeout', () => {
      socket.destroy()
      resolve({
        valid: false,
        validTo: null,
        daysRemaining: null,
        error: 'Timeout ao conectar via TLS',
      })
    })
  })
}

type RdapEvent = { eventAction: string; eventDate: string }
type RdapResponse = { events?: RdapEvent[] }

async function fetchRdap(url: string): Promise<RdapResponse> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), RDAP_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/rdap+json' },
    })
    if (!response.ok) {
      throw new Error(`RDAP retornou ${response.status} para ${url}`)
    }
    return (await response.json()) as RdapResponse
  } finally {
    clearTimeout(timer)
  }
}

function extractExpiration(events: RdapEvent[] | undefined): Date | null {
  const expiryEvent = events?.find((event) => event.eventAction === 'expiration')
  if (!expiryEvent) return null
  const date = new Date(expiryEvent.eventDate)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Domain expiration via RDAP (RFC 9083), the structured successor to WHOIS text scraping.
 * .com.br/.net.br/.org.br etc go straight to Registro.br's RDAP service — their classic
 * WHOIS-on-port-43 both uses a different response format and actively rate-limits/blocks
 * queries from datacenter IPs, which is exactly where a deployed Next.js app runs from.
 * Everything else goes through rdap.org, IANA's bootstrap redirector to the right registry.
 */
export async function getDomainExpiration(hostname: string): Promise<DomainExpiryResult> {
  const registrableHost = hostname.replace(/^www\./, '')
  const rdapUrl = registrableHost.endsWith('.br')
    ? `https://rdap.registro.br/domain/${registrableHost}`
    : `https://rdap.org/domain/${registrableHost}`

  try {
    const data = await fetchRdap(rdapUrl)
    const expiryDate = extractExpiration(data.events)

    if (!expiryDate) {
      return {
        expiresAt: null,
        daysRemaining: null,
        error: 'Data de expiração não encontrada na resposta RDAP',
      }
    }

    const daysRemaining = Math.floor((expiryDate.getTime() - Date.now()) / 86_400_000)
    return { expiresAt: expiryDate.toISOString(), daysRemaining, error: null }
  } catch (error) {
    return {
      expiresAt: null,
      daysRemaining: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/** Runs the HTTP, SSL and domain-expiry checks for a lead's website. Each check swallows its own errors. */
export async function checkDomain(website: string): Promise<DomainStatus> {
  const url = new URL(website.startsWith('http') ? website : `https://${website}`)

  const [http, ssl, domain] = await Promise.all([
    checkHttpStatus(url.toString()),
    url.protocol === 'https:' ? checkSsl(url.hostname) : Promise.resolve(null),
    getDomainExpiration(url.hostname),
  ])

  return { checkedAt: new Date().toISOString(), http, ssl, domain }
}
