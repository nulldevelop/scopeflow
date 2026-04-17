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
        <div className="max-w-[1200px] mx-auto py-6">{children}</div>
      </main>
    </div>
  )
}
