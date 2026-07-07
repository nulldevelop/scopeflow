import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import { getSessionLeadById } from '../_data-access/get-leads'
import { LeadDetail } from './_components/lead-detail'

export const dynamic = 'force-dynamic'

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const sessionResponse = await getSessionClient()
  if (!sessionResponse.success) redirect('/signin')

  const lead = await getSessionLeadById(id)

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div>
          <h2 className="text-xl font-semibold mb-4">Lead não encontrado</h2>
          <a
            href="/dashboard/leads"
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-brand-dark"
          >
            Voltar para lista
          </a>
        </div>
      </div>
    )
  }

  return <LeadDetail lead={lead} />
}
