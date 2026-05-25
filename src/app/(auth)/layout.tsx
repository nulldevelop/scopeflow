import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shared/Sidebar'
import { getSessionClient } from '@/lib/getSession'
import { headers } from 'next/headers'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sessionData = await getSessionClient()

  if (!sessionData.success) {
    redirect('/signin')
  }

  const user = sessionData.session.user
  const activeOrgId = sessionData.session.activeOrganizationId

  // Verifica se estamos na rota de onboarding
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Se não tiver organização ativa e não estiver no onboarding, redireciona para lá
  if (!activeOrgId && !pathname.includes('/onboarding')) {
    redirect('/onboarding')
  }

  if (pathname.includes('/onboarding')) {
    return (
      <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
        <main className="flex-1 w-full">{children}</main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="mx-auto py-3">{children}</div>
      </main>
    </div>
  )
}
