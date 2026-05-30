import { FileSignature, Plus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { getSessionClient } from '@/lib/getSession'
import { getContracts } from './_data-access/get-contracts'
import type { ContractWithRelations } from './_components/contracts-client'
import { ContractsClient } from './_components/contracts-client'

export const dynamic = 'force-dynamic'

export default async function ContractsPage() {
  const sessionResponse = await getSessionClient()
  if (!sessionResponse.success) redirect('/signin')

  const { session } = sessionResponse
  const activeOrgId = session.activeOrganizationId

  if (!activeOrgId) {
    return (
      <div className="p-8 text-center text-gray-500">Nenhuma organização selecionada.</div>
    )
  }

  const { contracts: data, success, error } = await getContracts(activeOrgId)

  if (!success || !data) {
    return <div className="p-8 text-center text-red-500">{error || 'Erro ao carregar contratos.'}</div>
  }

  const contracts: ContractWithRelations[] = data.map((c) => ({
    ...c,
    totalValue: Number(c.totalValue),
  }))

  return (
    <div className="min-h-screen bg-[#F8F7F3]">
      <Header
        title="Contratos"
        subtitle="Gere, assine e gerencie contratos digitais com seus clientes"
        icon={FileSignature}
      >
        <Link
          href="/dashboard/contratos/novo"
          className="bg-white text-gray-900 hover:bg-gray-50 rounded-xl flex items-center gap-2 px-5 py-2.5 font-medium transition-all shadow-lg shadow-brand/10"
        >
          <Plus className="w-4 h-4" />
          Novo contrato
        </Link>
      </Header>
      <ContractsClient contracts={contracts} />
    </div>
  )
}
