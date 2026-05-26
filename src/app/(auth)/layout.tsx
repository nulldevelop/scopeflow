import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shared/Sidebar'
import { getSessionClient } from '@/lib/getSession'
import { prisma } from '@/lib/prisma'

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

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })
  const userRole = dbUser?.role || 'member'

  // Verifica se estamos na rota de onboarding
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Se não tiver organização ativa e não estiver no onboarding, redireciona para lá
  if (!activeOrgId && !pathname.includes('/onboarding')) {
    redirect('/onboarding')
  }

  // Se já tiver organização ativa e tentar acessar o onboarding, manda para o dashboard
  if (activeOrgId && pathname.includes('/onboarding')) {
    redirect('/dashboard')
  }

  // === PROTEÇÃO DE PAGAMENTO (PAYWALL) ===
  // Se o usuário está acessando o dashboard (não o onboarding) e tem organização ativa
  if (activeOrgId && !pathname.includes('/onboarding') && !pathname.includes('/dashboard/configuracoes')) {
    const org = await prisma.organization.findUnique({
      where: { id: activeOrgId },
      include: { subscriptions: { where: { status: 'active' } } }
    })

    if (org?.metadata) {
      const metadata = JSON.parse(org.metadata)
      const intendedPlan = metadata.plan

      // Se ele escolheu um plano pago no onboarding, mas não tem assinatura ativa
      if ((intendedPlan === 'pro' || intendedPlan === 'equipe') && org.subscriptions.length === 0) {
        // Bloqueia e manda para a tela de pagamento
        redirect('/dashboard/configuracoes?tab=pagamento&payment_required=true')
      }
    }
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
      <Sidebar user={user} userRole={userRole} />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="mx-auto px-4">{children}</div>
      </main>
    </div>
  )
}
