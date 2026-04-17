import { Sidebar } from '@/components/shared/Sidebar'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="mx-auto py-3">{children}</div>
      </main>
    </div>
  )
}
