import { redirect } from 'next/navigation'
import { SettingsClient } from './_components/SettingsClient'
import { getSettings } from './_data-access/get-settings'

export const dynamic = 'force-dynamic'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const settings = await getSettings()

  if (!settings) {
    redirect('/signin')
  }

  const resolvedParams = await searchParams
  const initialTab =
    typeof resolvedParams.tab === 'string' ? resolvedParams.tab : 'perfil'
  const paymentRequired = resolvedParams.payment_required === 'true'

  return (
    <SettingsClient
      initialData={settings}
      initialTab={initialTab}
      paymentRequired={paymentRequired}
    />
  )
}
