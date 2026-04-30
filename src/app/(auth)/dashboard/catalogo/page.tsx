import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import CatalogClient, { type CatalogFeature } from './_components/CatalogClient'
import { getAllCategories } from './_data-access/get-categories'
import { getAllFeatures } from './_data-access/get-features'

export default async function CatalogoContainer() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.session.activeOrganizationId) {
    redirect('/signin')
  }

  const organizationId = (session.session as { activeOrganizationId?: string })
    .activeOrganizationId!

  const [featuresData, categories] = await Promise.all([
    getAllFeatures(organizationId),
    getAllCategories(organizationId),
  ])

  const features: CatalogFeature[] = featuresData.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    baseHours: Number(f.baseHours),
    complexity: f.complexity,
    categoryId: f.categoryId,
    category: f.category
      ? {
          id: f.category.id,
          name: f.category.name,
        }
      : null,
  }))

  return <CatalogClient initialFeatures={features} categories={categories} />
}
