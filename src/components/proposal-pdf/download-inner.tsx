'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import type { QuoteWithClient } from '@/app/(auth)/dashboard/orcamentos/_components/quotes-client'
import { Button } from '@/components/ui/button'
import { useActiveOrganization } from '@/lib/auth-client'
import { ProposalPDF } from './document'

export default function ProposalPDFDownloadInner({
  quote,
}: {
  quote: QuoteWithClient
}) {
  const { data: activeOrg } = useActiveOrganization()

  return (
    <PDFDownloadLink
      document={<ProposalPDF quote={quote} activeOrg={activeOrg} />}
      fileName={`proposta-${quote.client?.name || 'download'}.pdf`}
    >
      {({ loading }) => (
        <Button
          variant="outline"
          size="sm"
          className="text-brand hover:text-brand-dark hover:bg-brand/5 gap-2 border-brand/20"
        >
          <Download className="w-4 h-4" />
          {loading ? 'Gerando...' : 'Baixar PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
