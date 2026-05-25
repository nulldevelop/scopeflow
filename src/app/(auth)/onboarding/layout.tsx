import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sessionData = await getSessionClient()

  // Se o usuário já tiver uma organização ativa na sessão (banco de dados),
  // mas caiu aqui por falta de cookie no middleware, redirecionamos para o dashboard.
  if (sessionData.success && sessionData.session.activeOrganizationId) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
