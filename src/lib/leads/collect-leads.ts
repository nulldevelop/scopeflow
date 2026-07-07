import { Prisma, prisma } from '@/lib/prisma'
import { type CollectPlacesInput, type CollectedPlace, collectPlaces } from './places'
import { type DomainStatus, checkDomain } from './domain-check'
import { processWithDelay } from './queue'
import { calculateScore } from './scoring'

const DOMAIN_CHECK_DELAY_MS = 1_500

export type CollectionSummary = {
  found: number
  upserted: number
  domainChecksFailed: number
}

export async function runCollection(
  organizationId: string,
  input: CollectPlacesInput,
): Promise<CollectionSummary> {
  const places = await collectPlaces(input)
  const withWebsite = places.filter(
    (place): place is CollectedPlace & { website: string } => place.website !== null,
  )

  const domainResults = await processWithDelay(withWebsite, DOMAIN_CHECK_DELAY_MS, (place) =>
    checkDomain(place.website),
  )

  const domainStatusByPlaceId = new Map<string, DomainStatus | null>()
  let domainChecksFailed = 0

  withWebsite.forEach((place, index) => {
    const result = domainResults[index]
    if (result.ok) {
      domainStatusByPlaceId.set(place.placeId, result.value)
    } else {
      domainChecksFailed += 1
      domainStatusByPlaceId.set(place.placeId, null)
    }
  })

  for (const place of places) {
    const domainStatus = domainStatusByPlaceId.get(place.placeId) ?? null
    const score = calculateScore({
      hasWebsite: place.hasWebsite,
      domainStatus,
    })
    const domainStatusValue = domainStatus ?? Prisma.DbNull

    await prisma.lead.upsert({
      where: { organizationId_placeId: { organizationId, placeId: place.placeId } },
      create: {
        organizationId,
        placeId: place.placeId,
        name: place.name,
        address: place.address,
        phone: place.phone,
        category: place.category,
        hasWebsite: place.hasWebsite,
        website: place.website,
        domainStatus: domainStatusValue,
        score,
      },
      update: {
        name: place.name,
        address: place.address,
        phone: place.phone,
        category: place.category,
        hasWebsite: place.hasWebsite,
        website: place.website,
        domainStatus: domainStatusValue,
        score,
      },
    })
  }

  return { found: places.length, upserted: places.length, domainChecksFailed }
}
