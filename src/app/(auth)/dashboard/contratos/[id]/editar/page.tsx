import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import { prisma } from '@/lib/prisma'
import { getContractById } from '../../_data-access/get-contracts'
import { ContractForm } from '../../novo/_components/contract-form'

export const dynamic = 'force-dynamic'

export default async function EditContractPage({
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

  const [clients, quotes] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: activeOrgId },
      orderBy: { name: 'asc' },
    }),
    prisma.quote.findMany({
      where: { organizationId: activeOrgId, status: 'aprovada' },
      include: { client: true, items: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const quotesForForm = quotes.map((q) => ({
    id: q.id,
    title: q.title,
    totalValue: Number(q.totalValue),
    totalHours: Number(q.totalHours),
    installments: q.installments,
    entryAmount: Number(q.entryAmount),
    clientId: q.clientId,
    client: q.client
      ? {
          name: q.client.name,
          email: q.client.email,
          document: q.client.document,
        }
      : null,
    items: q.items.map((i) => ({
      name: i.name,
      description: i.description,
      hours: Number(i.hours),
      unitValue: Number(i.unitValue),
    })),
  }))

  const contract = {
    id: data.id,
    title: data.title,
    contractNumber: data.contractNumber,
    clientId: data.clientId,
    quoteId: data.quoteId,
    totalValue: Number(data.totalValue),
    startDate: data.startDate,
    endDate: data.endDate,
    objectClause: data.objectClause,
    timelineClause: data.timelineClause,
    paymentClause: data.paymentClause,
    ipClause: data.ipClause,
  }

  return (
    <ContractForm
      clients={clients}
      quotes={quotesForForm}
      contract={contract}
    />
  )
}
