import * as tls from 'node:tls'

const HTTP_TIMEOUT_MS = 8_000
const TLS_TIMEOUT_MS = 8_000
const RDAP_TIMEOUT_MS = 10_000
const WAYBACK_TIMEOUT_MS = 10_000
const MAX_HTML_BYTES = 200_000

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
  registeredAt: string | null
  ageDays: number | null
  expiresAt: string | null
  daysRemaining: number | null
  error: string | null
}

export type SiteFreshnessResult = {
  hasMobileViewport: boolean | null
  copyrightYear: number | null
}

export type WaybackResult = {
  firstSnapshot: string | null
  lastSnapshot: string | null
  error: string | null
}

export type DomainStatus = {
  checkedAt: string
  http: HttpCheckResult
  ssl: SslCheckResult | null
  domain: DomainExpiryResult
  freshness: SiteFreshnessResult
  wayback: WaybackResult
}

/** GET the site and bucket the outcome into online/4xx/5xx/timeout/unreachable, capturing the HTML body (capped) for freshness analysis. */
async function fetchSite(url: string): Promise<{ result: HttpCheckResult; html: string | null }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
    })

    let html: string | null = null
    if (response.ok) {
      const text = await response.text()
      html = text.slice(0, MAX_HTML_BYTES)
    }

    if (response.status >= 500) return { result: { status: 'server_error', statusCode: response.status }, html }
    if (response.status >= 400) return { result: { status: 'client_error', statusCode: response.status }, html }
    return { result: { status: 'online', statusCode: response.status }, html }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { result: { status: 'timeout', statusCode: null }, html: null }
    }
    return { result: { status: 'unreachable', statusCode: null }, html: null }
  } finally {
    clearTimeout(timer)
  }
}

/** A responsive layout requires a viewport meta tag; its absence is a strong signal the site predates mobile-first design. */
function hasMobileViewport(html: string): boolean {
  return /<meta[^>]+name=["']viewport["']/i.test(html)
}

/** Scrapes the highest copyright year mentioned (footers often show a range like "2015-2019"). */
function extractCopyrightYear(html: string): number | null {
  const currentYear = new Date().getFullYear()
  const matches = [...html.matchAll(/(?:©|&copy;|copyright)\D{0,10}(\d{4})/gi)]
  const years = matches
    .map((match) => Number(match[1]))
    .filter((year) => year >= 1995 && year <= currentYear)

  if (years.length === 0) return null
  return Math.max(...years)
}

function analyzeFreshness(html: string | null): SiteFreshnessResult {
  if (!html) return { hasMobileViewport: null, copyrightYear: null }
  return {
    hasMobileViewport: hasMobileViewport(html),
    copyrightYear: extractCopyrightYear(html),
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

function extractRdapEventDate(events: RdapEvent[] | undefined, action: string): Date | null {
  const event = events?.find((e) => e.eventAction === action)
  if (!event) return null
  const date = new Date(event.eventDate)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Domain registration + expiration via RDAP (RFC 9083), the structured successor to WHOIS text
 * scraping. .com.br/.net.br/.org.br etc go straight to Registro.br's RDAP service — their classic
 * WHOIS-on-port-43 both uses a different response format and actively rate-limits/blocks queries
 * from datacenter IPs, which is exactly where a deployed Next.js app runs from. Everything else
 * goes through rdap.org, IANA's bootstrap redirector to the right registry.
 *
 * Registration date doubles as "how old is this business's web presence" — a domain registered
 * once and never touched since is as strong a redesign signal as the expiration date.
 */
export async function getDomainExpiration(hostname: string): Promise<DomainExpiryResult> {
  const registrableHost = hostname.replace(/^www\./, '')
  const rdapUrl = registrableHost.endsWith('.br')
    ? `https://rdap.registro.br/domain/${registrableHost}`
    : `https://rdap.org/domain/${registrableHost}`

  try {
    const data = await fetchRdap(rdapUrl)
    const registeredAt = extractRdapEventDate(data.events, 'registration')
    const expiryDate = extractRdapEventDate(data.events, 'expiration')

    if (!registeredAt && !expiryDate) {
      return {
        registeredAt: null,
        ageDays: null,
        expiresAt: null,
        daysRemaining: null,
        error: 'Datas não encontradas na resposta RDAP',
      }
    }

    return {
      registeredAt: registeredAt?.toISOString() ?? null,
      ageDays: registeredAt ? Math.floor((Date.now() - registeredAt.getTime()) / 86_400_000) : null,
      expiresAt: expiryDate?.toISOString() ?? null,
      daysRemaining: expiryDate ? Math.floor((expiryDate.getTime() - Date.now()) / 86_400_000) : null,
      error: null,
    }
  } catch (error) {
    return {
      registeredAt: null,
      ageDays: null,
      expiresAt: null,
      daysRemaining: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

type CdxRow = [string, ...string[]]

function parseWaybackTimestamp(timestamp: string): string | null {
  const match = timestamp.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)
  if (!match) return null
  const [, year, month, day, hour, minute, second] = match
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

async function fetchWaybackTimestamp(hostname: string, order: 'first' | 'last'): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), WAYBACK_TIMEOUT_MS)

  try {
    const limit = order === 'first' ? 1 : -1
    const url = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(hostname)}&output=json&fl=timestamp&limit=${limit}&collapse=timestamp:8`
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) return null

    const rows = (await response.json()) as CdxRow[]
    if (rows.length < 2) return null

    const dataRow = order === 'first' ? rows[1] : rows[rows.length - 1]
    return parseWaybackTimestamp(dataRow[0])
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Internet Archive's Wayback Machine CDX API — free, no signup, no API key. First snapshot
 * approximates when the site first went live; last snapshot approximates when its content last
 * changed enough for the crawler to bother re-archiving it. A domain last captured years ago
 * with no changes since is effectively an abandoned/static site.
 */
export async function getWaybackHistory(hostname: string): Promise<WaybackResult> {
  try {
    const [firstSnapshot, lastSnapshot] = await Promise.all([
      fetchWaybackTimestamp(hostname, 'first'),
      fetchWaybackTimestamp(hostname, 'last'),
    ])
    return { firstSnapshot, lastSnapshot, error: null }
  } catch (error) {
    return {
      firstSnapshot: null,
      lastSnapshot: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/** Runs the HTTP, SSL, RDAP and Wayback checks for a lead's website. Each check swallows its own errors. */
export async function checkDomain(website: string): Promise<DomainStatus> {
  const url = new URL(website.startsWith('http') ? website : `https://${website}`)

  const [site, ssl, domain, wayback] = await Promise.all([
    fetchSite(url.toString()),
    url.protocol === 'https:' ? checkSsl(url.hostname) : Promise.resolve(null),
    getDomainExpiration(url.hostname),
    getWaybackHistory(url.hostname),
  ])

  return {
    checkedAt: new Date().toISOString(),
    http: site.result,
    ssl,
    domain,
    freshness: analyzeFreshness(site.html),
    wayback,
  }
}
