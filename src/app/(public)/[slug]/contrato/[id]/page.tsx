import { redirect } from 'next/navigation'
import {
  getPublicContractById,
  parseOrgLegal,
} from '@/app/(auth)/dashboard/contratos/_data-access/get-contracts'
import { ContractDetail } from '@/app/(auth)/dashboard/contratos/[id]/_components/contract-detail'

export default async function PublicContractPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>
}) {
  const { id, slug } = await params
  const { contract: data, success } = await getPublicContractById(id, slug)

  if (!success || !data) {
    redirect('/signin')
  }

  const legal = parseOrgLegal(data.organization.metadata)
  const contract = {
    ...data,
    totalValue: Number(data.totalValue),
    organization: {
      name: data.organization.name,
      slug: data.organization.slug,
      logo: data.organization.logo,
      ...legal,
    },
  }

  return <ContractDetail contract={contract} isPublic={true} />
}
