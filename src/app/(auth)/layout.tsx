import { Sidebar } from '@/components/shared/Sidebar'
import { getSessionClient } from '@/lib/getSession'
import { headers } from 'next/headers'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sessionData = await getSessionClient()
  const user = sessionData.success ? sessionData.session.user : null;
  
  // Verifica se estamos na rota de onboarding para remover o layout padrão do dashboard
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // Debug para garantir que o pathname está chegando (opcional em produção)
  // console.log('AuthLayout Pathname:', pathname)

  if (pathname.includes('/onboarding')) {
    return (
      <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
        <main className="flex-1 w-full">
          {children}
        </main>
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
