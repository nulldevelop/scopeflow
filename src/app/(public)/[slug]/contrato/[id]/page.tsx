import { redirect } from 'next/navigation'
import { ContractDetail } from '@/app/(auth)/dashboard/contratos/[id]/_components/contract-detail'
import { getPublicContractById } from '@/app/(auth)/dashboard/contratos/_data-access/get-contracts'

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

  const contract = {
    ...data,
    totalValue: Number(data.totalValue),
  }

  return <ContractDetail contract={contract} isPublic={true} />
}
