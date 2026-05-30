import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import { prisma } from '@/lib/prisma'
import { ContractForm } from './_components/contract-form'

export const dynamic = 'force-dynamic'

export default async function NewContractPage({
  searchParams,
}: {
  searchParams: Promise<{ quoteId?: string }>
}) {
  const { quoteId } = await searchParams
  const sessionResponse = await getSessionClient()
  if (!sessionResponse.success) redirect('/signin')

  const { session } = sessionResponse
  const activeOrgId = session.activeOrganizationId
  if (!activeOrgId) redirect('/dashboard')

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
    client: q.client
      ? { name: q.client.name, email: q.client.email, document: q.client.document }
      : null,
    items: q.items.map((i) => ({
      name: i.name,
      description: i.description,
      hours: Number(i.hours),
      unitValue: Number(i.unitValue),
    })),
  }))

  const preselectedQuote = quoteId ? quotesForForm.find((q) => q.id === quoteId) ?? null : null

  return (
    <ContractForm
      clients={clients}
      quotes={quotesForForm}
      preselectedQuote={preselectedQuote}
    />
  )
}
