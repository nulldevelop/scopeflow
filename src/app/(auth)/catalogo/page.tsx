import { auth } from "@/lib/auth"
import { getCategories } from "./_data-access/get-categories"
import { getFeatures } from "./_data-access/get-features"
import { headers } from "next/headers"
import CatalogClient, { type CatalogFeature } from "./_components/CatalogClient"
import { redirect } from "next/navigation"

export default async function CatalogoContainer() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.session.activeOrganizationId) {
    redirect("/signin")
  }

  const organizationId = session.session.activeOrganizationId

  const [featuresData, categories] = await Promise.all([
    getFeatures(organizationId),
    getCategories(organizationId),
  ])

  const features: CatalogFeature[] = featuresData.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    baseHours: Number(f.baseHours),
    complexity: f.complexity,
    categoryId: f.categoryId,
    category: f.category ? {
      id: f.category.id,
      name: f.category.name,
    } : null,
  }))

  return (
    <CatalogClient
      initialFeatures={features}
      categories={categories}
    />
  )
}