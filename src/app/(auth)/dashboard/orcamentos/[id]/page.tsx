import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import { getSessionClient } from '@/lib/getSession'
import { getClients } from '../../clientes/_data-access/get-clients'
import { getQuoteById } from '../_data-access/get-quotes'
import { QuoteEditorClient } from './_components/quote-editor-client'

export default async function QuoteEditorPage({
  params,
}: {
  params: { id: string }
}) {
  const sessionResponse = await getSessionClient()

  if (!sessionResponse.success) {
    redirect('/sign-in')
  }

  const { session } = sessionResponse
  const activeOrgId = session.activeOrganizationId

  if (!activeOrgId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Nenhuma organização selecionada.
      </div>
    )
  }

  const { clients } = await getClients(activeOrgId)

  let quote = null
  if (params.id !== 'novo') {
    const res = await getQuoteById(activeOrgId, params.id)
    if (res.success) {
      quote = res.quote
    }
  }

  return <QuoteEditorClient initialQuote={quote} clients={clients || []} />
}
