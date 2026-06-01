import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import { getContractById, parseOrgLegal } from '../_data-access/get-contracts'
import { ContractDetail } from './_components/contract-detail'

export const dynamic = 'force-dynamic'

export default async function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const sessionResponse = await getSessionClient()
  if (!sessionResponse.success) redirect('/signin')

  const { session } = sessionResponse
  const activeOrgId = session.activeOrganizationId
  if (!activeOrgId) redirect('/dashboard')

  const { contract: data, success } = await getContractById(activeOrgId, id)

  if (!success || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Contrato não encontrado
          </h2>
          <a
            href="/dashboard/contratos"
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-brand-dark"
          >
            Voltar para lista
          </a>
        </div>
      </div>
    )
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

  return <ContractDetail contract={contract} />
}
