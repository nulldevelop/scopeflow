import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import { CatalogClient, type CatalogFeature } from './_components/CatalogClient'
import { getAllCategories } from './_data-access/get-categories'
import { getAllFeatures } from './_data-access/get-features'

export const dynamic = 'force-dynamic'

export default async function CatalogoContainer() {
  const sessionResponse = await getSessionClient()

  if (!sessionResponse.success) {
    redirect('/signin')
  }

  const { session } = sessionResponse

  if (!session?.activeOrganizationId) {
    redirect('/signin')
  }

  const organizationId = session.activeOrganizationId

  const [featuresData, categories] = await Promise.all([
    getAllFeatures(organizationId),
    getAllCategories(organizationId),
  ])

  const features: CatalogFeature[] = featuresData.map((f) => {
    return {
      id: f.id,
      name: f.name,
      description: f.description,
      baseHours: Number(f.baseHours),
      complexity: f.complexity,
      monthlyFee: Number(f.monthlyFee),
      monthlyDuration: f.monthlyDuration,
      categoryId: f.categoryId,
      category: f.category
        ? {
            id: f.category.id,
            name: f.category.name,
          }
        : null,
    }
  })

  return <CatalogClient initialFeatures={features} categories={categories} />
}
