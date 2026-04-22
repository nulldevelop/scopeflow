import { Sidebar } from '@/components/shared/Sidebar'
import { getUserData } from './_lib/get-user'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userData = await getUserData()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={userData?.user ?? null} />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="mx-auto py-3">{children}</div>
      </main>
    </div>
  )
}
