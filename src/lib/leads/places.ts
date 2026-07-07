import { z } from 'zod'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const OVERPASS_USER_AGENT = 'scopeflow-lead-capture/1.0 (+https://github.com/)'
const OVERPASS_QUERY_TIMEOUT_S = 25
const FETCH_TIMEOUT_MS = 30_000
const MAX_RESULTS = 60

// The public Overpass instance is shared and rate-limited: 429 (too many requests) and
// 504 (server busy) are routine under load, not fatal errors, so they get retried with
// backoff instead of failing the whole category search.
const RETRYABLE_STATUS = new Set([429, 504])
const RETRY_DELAYS_MS = [5_000, 15_000]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Business category tags live under different top-level OSM keys depending on the kind
// of place (amenity for restaurants/bars, shop for retail, craft/office/leisure/tourism
// for everything else), so a category search has to union across all of them.
const CATEGORY_KEYS = ['amenity', 'shop', 'craft', 'office', 'leisure', 'tourism']

const overpassElementSchema = z.object({
  type: z.enum(['node', 'way', 'relation']),
  id: z.number(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  center: z.object({ lat: z.number(), lon: z.number() }).optional(),
  tags: z.record(z.string(), z.string()).optional(),
})

const overpassResponseSchema = z.object({
  elements: z.array(overpassElementSchema),
})

const categoryTagSchema = z
  .string()
  .min(1, 'categoria é obrigatória')
  .max(50)
  .regex(
    /^[a-z][a-z0-9_]*$/,
    'categoria deve ser uma tag OSM em snake_case (ex: restaurant, hairdresser, bakery)',
  )

export const collectPlacesInputSchema = z.object({
  categories: z
    .array(categoryTagSchema)
    .min(1, 'selecione ao menos uma categoria')
    .max(8, 'máximo de 8 categorias por coleta'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusMeters: z.number().min(1).max(50_000),
})

export type CollectPlacesInput = z.infer<typeof collectPlacesInputSchema>

export type CollectedPlace = {
  placeId: string
  name: string
  address: string
  phone: string | null
  category: string
  website: string | null
  hasWebsite: boolean
}

function buildQuery(input: CollectPlacesInput): string {
  const around = `around:${input.radiusMeters},${input.lat},${input.lng}`
  const clauses = input.categories
    .flatMap((category) => CATEGORY_KEYS.map((key) => `nwr["${key}"="${category}"](${around});`))
    .join('\n  ')

  return `[out:json][timeout:${OVERPASS_QUERY_TIMEOUT_S}];
(
  ${clauses}
);
out center tags ${MAX_RESULTS};`
}

function buildAddress(tags: Record<string, string>): string {
  const street = tags['addr:street']
  const houseNumber = tags['addr:housenumber']
  const city = tags['addr:city'] ?? tags['addr:suburb']
  const postcode = tags['addr:postcode']

  const streetLine = [street, houseNumber].filter(Boolean).join(', ')
  return [streetLine, city, postcode].filter(Boolean).join(' - ')
}

function normalizeElement(
  element: z.infer<typeof overpassElementSchema>,
  fallbackCategory: string,
): CollectedPlace | null {
  const tags = element.tags ?? {}
  const name = tags.name
  if (!name) return null

  const website = tags.website ?? tags['contact:website'] ?? null
  const category =
    CATEGORY_KEYS.map((key) => tags[key]).find((value) => value !== undefined) ?? fallbackCategory

  return {
    placeId: `${element.type}/${element.id}`,
    name,
    address: buildAddress(tags),
    phone: tags.phone ?? tags['contact:phone'] ?? null,
    category,
    website,
    hasWebsite: website !== null,
  }
}

async function fetchOverpass(query: string): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    let response: Response
    try {
      response = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': OVERPASS_USER_AGENT,
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout consultando a Overpass API (OpenStreetMap)')
      }
      throw error
    } finally {
      clearTimeout(timer)
    }

    if (response.ok || !RETRYABLE_STATUS.has(response.status) || attempt >= RETRY_DELAYS_MS.length) {
      return response
    }

    await sleep(RETRY_DELAYS_MS[attempt])
  }
}

/**
 * Business search via OpenStreetMap's Overpass API — free, no signup, no API key.
 * Trade-off vs a commercial places API: coverage and phone/website tag completeness
 * depend entirely on community mapping, so it's stronger in dense city centers than
 * in smaller towns, and a missing website tag doesn't always mean the business has none.
 */
export async function collectPlaces(input: CollectPlacesInput): Promise<CollectedPlace[]> {
  const parsedInput = collectPlacesInputSchema.parse(input)
  const query = buildQuery(parsedInput)

  const response = await fetchOverpass(query)

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Overpass API retornou ${response.status}: ${errorBody.slice(0, 500)}`)
  }

  const json: unknown = await response.json()
  const parsed = overpassResponseSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error(`Resposta inesperada da Overpass API: ${parsed.error.message}`)
  }

  return parsed.data.elements
    .map((element) => normalizeElement(element, parsedInput.categories[0]))
    .filter((place): place is CollectedPlace => place !== null)
}
