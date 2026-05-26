import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import { prisma } from '@/lib/prisma'
import { OwnerDashboardClient } from './_components/owner-dashboard-client'
import { getOwnerStats } from './_data-access/get-owner-stats'

export const dynamic = 'force-dynamic'

export default async function OwnerPage() {
  const sessionData = await getSessionClient()

  if (!sessionData.success) {
    redirect('/signin')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionData.session.user.id },
    select: { role: true },
  })

  if (!dbUser || dbUser.role !== 'owner') {
    redirect('/dashboard')
  }

  const stats = await getOwnerStats()

  return (
    <OwnerDashboardClient
      stats={stats}
      userName={sessionData.session.user.name}
    />
  )
}
