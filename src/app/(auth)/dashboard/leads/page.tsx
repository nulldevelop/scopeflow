import { getSessionLeads } from './_data-access/get-leads'
import { LeadsClient } from './_components/LeadsClient'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const leads = await getSessionLeads()

  return <LeadsClient initialLeads={leads} />
}
