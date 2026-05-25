import { redirect } from 'next/navigation'
import { SettingsClient } from './_components/SettingsClient'
import { getSettings } from './_data-access/get-settings'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const settings = await getSettings()

  if (!settings) {
    redirect('/signin')
  }

  return <SettingsClient initialData={settings} />
}
