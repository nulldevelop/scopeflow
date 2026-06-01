'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContractPDF, type ContractPDFData } from './document'

export default function ContractPDFDownloadInner({
  contract,
}: {
  contract: ContractPDFData
}) {
  return (
    <PDFDownloadLink
      document={<ContractPDF contract={contract} />}
      fileName={`contrato-${contract.client?.name || contract.title || 'download'}.pdf`}
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
