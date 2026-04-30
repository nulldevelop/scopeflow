import { Sidebar } from '@/components/shared/Sidebar'
import { getSessionClient } from '@/lib/getSession'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sessionData = await getSessionClient()
  const user = sessionData.success ? sessionData.session.user : null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="mx-auto py-3">{children}</div>
      </main>
    </div>
  )
}
