import {
  Document,
  Image,
  Page,
  Path,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer'
import type { QuoteWithClient } from '@/app/(auth)/dashboard/orcamentos/_components/quotes-client'

const BRAND = '#2a6b5c'
const BRAND_DARK = '#1a4a3e'
const BRAND_LIGHT = '#eaf3ef'
const GRAY_50 = '#f9fafb'
const GRAY_100 = '#f3f4f6'
const GRAY_200 = '#e5e7eb'
const GRAY_300 = '#d1d5db'
const GRAY_400 = '#9ca3af'
const GRAY_500 = '#6b7280'
const GRAY_600 = '#4b5563'
const GRAY_700 = '#374151'
const GRAY_900 = '#111827'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    padding: 40,
    paddingBottom: 56,
    fontSize: 10,
    color: GRAY_700,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: `2px solid ${BRAND}`,
  },
  headerLeft: {},
  headerRight: {
    alignItems: 'flex-end',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  orgLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  scopeFlowLogo: {
    width: 20,
    height: 20,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 700,
    color: BRAND_DARK,
    letterSpacing: -0.3,
  },
  documentTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: GRAY_900,
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  referenceRow: {
    fontSize: 8,
    color: GRAY_400,
    marginBottom: 2,
    marginTop: 10,
  },
  brandBadge: {
    backgroundColor: BRAND_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 700,
    color: BRAND,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  clientSection: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
    padding: 16,
    backgroundColor: GRAY_50,
    borderRadius: 8,
  },
  clientBlock: {
    flex: 1,
  },
  clientLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: GRAY_400,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  clientValue: {
    fontSize: 10,
    fontWeight: 700,
    color: GRAY_900,
  },
  clientSub: {
    fontSize: 8,
    color: GRAY_500,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: GRAY_900,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  sectionDivider: {
    width: 32,
    height: 3,
    backgroundColor: BRAND,
    borderRadius: 2,
    marginBottom: 14,
  },
  description: {
    fontSize: 9,
    color: GRAY_600,
    lineHeight: 1.6,
    marginBottom: 24,
    padding: 12,
    backgroundColor: GRAY_50,
    borderRadius: 6,
  },
  table: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: BRAND_DARK,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    color: '#fff',
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: `1px solid ${GRAY_100}`,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignItems: 'center',
    minHeight: 28,
  },
  tableRowAlt: {
    backgroundColor: GRAY_50,
  },
  tableCell: {
    fontSize: 8,
    color: GRAY_700,
  },
  tableCellMono: {
    fontFamily: 'Courier',
    fontSize: 8,
  },
  colItem: { flex: 3 },
  colDesc: { flex: 3 },
  colHours: { flex: 1, textAlign: 'right' as const },
  colValue: { flex: 1.5, textAlign: 'right' as const },
  summaryGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
  },
  summaryCardDark: {
    backgroundColor: BRAND_DARK,
  },
  summaryCardLight: {
    backgroundColor: BRAND_LIGHT,
  },
  summaryLabel: {
    fontSize: 6,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryLabelDark: {
    color: BRAND,
    opacity: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: -0.5,
  },
  summaryValueDark: {
    color: BRAND_DARK,
  },
  breakdown: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: GRAY_50,
    borderRadius: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 9,
    color: GRAY_500,
  },
  breakdownValue: {
    fontSize: 9,
    fontWeight: 700,
    color: GRAY_700,
  },
  breakdownTotal: {
    borderTop: `1px solid ${GRAY_200}`,
    marginTop: 6,
    paddingTop: 6,
  },
  breakdownTotalLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: GRAY_900,
  },
  breakdownTotalValue: {
    fontSize: 12,
    fontWeight: 700,
    color: BRAND_DARK,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 24,
    borderTop: `1px solid ${GRAY_200}`,
  },
  footerText: {
    fontSize: 7,
    color: GRAY_400,
  },
  pageNumber: {
    fontSize: 7,
    color: GRAY_400,
  },
  conditionsSection: {
    marginBottom: 24,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  conditionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: BRAND,
    marginTop: 5,
  },
  conditionText: {
    fontSize: 9,
    color: GRAY_600,
    flex: 1,
    lineHeight: 1.6,
  },
  signatureArea: {
    marginTop: 32,
    paddingTop: 24,
    borderTop: `1px solid ${GRAY_200}`,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: {
    flex: 0.45,
  },
  signatureLine: {
    borderBottom: `1px solid ${GRAY_300}`,
    height: 36,
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 7,
    color: GRAY_400,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  digitalSignatureBox: {
    backgroundColor: GRAY_50,
    border: `1px solid ${GRAY_200}`,
    borderRadius: 6,
    padding: 10,
    minHeight: 60,
  },
  digitalSignatureText: {
    fontSize: 8,
    color: GRAY_900,
    fontWeight: 700,
    marginBottom: 4,
  },
  digitalSignatureDate: {
    fontSize: 7,
    color: GRAY_500,
  },
  digitalSignatureHash: {
    fontSize: 6,
    color: BRAND,
    fontFamily: 'Courier',
    marginTop: 6,
    textTransform: 'uppercase',
  },
})

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR')
}

function getAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  if (url.startsWith('data:')) return url
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`
  }
  return url
}

interface ProposalPDFProps {
  quote: QuoteWithClient
  organizationName?: string
  activeOrg?: {
    name: string
    logo?: string | null
  } | null
}

export function ProposalPDF({
  quote,
  organizationName = 'ScopeFlow',
  activeOrg,
}: ProposalPDFProps) {
  const displayLogo = activeOrg?.logo || quote.organization?.logo
  const displayOrgName = activeOrg?.name || quote.organization?.name || organizationName

  const orgLogoUrl = getAbsoluteUrl(displayLogo)
  const grossValue = quote.items.reduce((acc, item) => acc + Number(item.unitValue), 0)
  const discountValue = (grossValue * Number(quote.discount)) / 100
  const urgencyValue = (grossValue * Number(quote.urgencyFee)) / 100
  const netValue = grossValue - discountValue + urgencyValue
  const entryValue = (grossValue * Number(quote.entryAmount)) / 100
  const installmentValue =
    Number(quote.installments) > 1
      ? (netValue - entryValue) / Number(quote.installments)
      : 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              {orgLogoUrl && (
                <Image
                  src={orgLogoUrl}
                  style={[styles.orgLogo, { objectFit: 'contain' }]}
                />
              )}

              <Text style={styles.companyName}>
                {displayOrgName}
              </Text>
            </View>
            <Text style={styles.documentTitle}>Proposta Comercial</Text>
            <Text style={styles.referenceRow}>
              Ref: #{quote.id?.slice(0, 8).toUpperCase()} | Emissão:{' '}
              {formatDate(quote.createdAt)}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.brandBadge}>
              {quote.status === 'aprovada'
                ? 'Aprovada'
                : quote.status === 'recusada'
                  ? 'Recusada'
                  : 'Pendente'}
            </Text>
          </View>
        </View>

        {/* Client */}
        <View style={styles.clientSection}>
          <View style={styles.clientBlock}>
            <Text style={styles.clientLabel}>Cliente</Text>
            <Text style={styles.clientValue}>
              {quote.client?.name || 'Cliente não informado'}
            </Text>
            {quote.client?.email && (
              <Text style={styles.clientSub}>{quote.client.email}</Text>
            )}
          </View>
          <View style={styles.clientBlock}>
            <Text style={styles.clientLabel}>Validade da Proposta</Text>
            <Text style={styles.clientValue}>
              {formatDate(quote.expirationDate)}
            </Text>
            <Text style={styles.clientSub}>
              {quote.expirationDate
                ? `Prazo para aceitação: ${formatDate(quote.expirationDate)}`
                : 'Consulte nosso time'}
            </Text>
          </View>
        </View>

        {/* Scope */}
        <Text style={styles.sectionTitle}>Escopo Técnico</Text>
        <View style={styles.sectionDivider} />

        {quote.description && (
          <View style={styles.description}>
            <Text>{quote.description}</Text>
          </View>
        )}

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colItem]}>
              Funcionalidade
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>
              Descrição
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colHours]}>
              Esforço
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colValue]}>
              Investimento
            </Text>
          </View>
          {quote.items.map((item, i) => (
            <View
              key={item.id}
              style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.tableCell, styles.colItem]}>
                {item.name}
              </Text>
              <Text style={[styles.tableCell, styles.colDesc]}>
                {item.description || '—'}
              </Text>
              <Text style={[styles.tableCellMono, styles.colHours]}>
                {Number(item.hours)}h
              </Text>
              <Text style={[styles.tableCellMono, styles.colValue]}>
                {formatCurrency(Number(item.unitValue))}
              </Text>
            </View>
          ))}
        </View>

        {/* Financial Summary */}
        <Text style={styles.sectionTitle}>Investimento</Text>
        <View style={styles.sectionDivider} />

        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, styles.summaryCardDark]}>
            <Text style={styles.summaryLabel}>Total do Projeto</Text>
            <Text style={styles.summaryValue}>{formatCurrency(netValue)}</Text>
          </View>
          {Number(quote.monthlyTotal) > 0 && (
            <View style={[styles.summaryCard, styles.summaryCardLight]}>
              <Text style={[styles.summaryLabel, styles.summaryLabelDark]}>
                Mensalidade
              </Text>
              <Text style={[styles.summaryValue, styles.summaryValueDark]}>
                {formatCurrency(Number(quote.monthlyTotal))}
                <Text>/mês</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Breakdown */}
        <View style={styles.breakdown}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Valor Bruto</Text>
            <Text style={styles.breakdownValue}>
              {formatCurrency(grossValue)}
            </Text>
          </View>
          {Number(quote.discount) > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                Desconto ({Number(quote.discount)}%)
              </Text>
              <Text style={[styles.breakdownValue, { color: '#16a34a' }]}>
                - {formatCurrency(discountValue)}
              </Text>
            </View>
          )}
          {Number(quote.urgencyFee) > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                Taxa de Urgência ({Number(quote.urgencyFee)}%)
              </Text>
              <Text style={[styles.breakdownValue, { color: '#ea580c' }]}>
                + {formatCurrency(urgencyValue)}
              </Text>
            </View>
          )}
          <View style={[styles.breakdownRow, styles.breakdownTotal]}>
            <Text style={styles.breakdownTotalLabel}>
              Investimento Total (Setup)
            </Text>
            <Text style={styles.breakdownTotalValue}>
              {formatCurrency(netValue)}
            </Text>
          </View>
        </View>

        {/* Payment Conditions */}
        <Text style={styles.sectionTitle}>Condições de Pagamento</Text>
        <View style={styles.sectionDivider} />

        <View style={styles.conditionsSection} wrap={false}>
          <View style={styles.conditionRow}>
            <View style={styles.conditionDot} />
            <Text style={styles.conditionText}>
              <Text style={{ fontWeight: 700 }}>Valor total do projeto: </Text>
              {formatCurrency(netValue)}
            </Text>
          </View>
          {Number(quote.entryAmount) > 0 && (
            <View style={styles.conditionRow}>
              <View style={styles.conditionDot} />
              <Text style={styles.conditionText}>
                <Text style={{ fontWeight: 700 }}>Entrada: </Text>
                {Number(quote.entryAmount)}% — {formatCurrency(entryValue)} na
                assinatura do contrato
              </Text>
            </View>
          )}
          {Number(quote.installments) > 1 && (
            <View style={styles.conditionRow}>
              <View style={styles.conditionDot} />
              <Text style={styles.conditionText}>
                <Text style={{ fontWeight: 700 }}>Parcelamento: </Text>
                {Number(quote.installments)}× de{' '}
                {formatCurrency(installmentValue)}
                {Number(quote.entryAmount) > 0
                  ? ` (após entrada de ${formatCurrency(entryValue)})`
                  : ''}
              </Text>
            </View>
          )}
          <View style={styles.conditionRow}>
            <View style={styles.conditionDot} />
            <Text style={styles.conditionText}>
              <Text style={{ fontWeight: 700 }}>
                Prazo de execução estimado:{' '}
              </Text>
              {Math.ceil(Number(quote.totalHours) / 20)} semanas
            </Text>
          </View>
          <View style={styles.conditionRow}>
            <View style={styles.conditionDot} />
            <Text style={styles.conditionText}>
              <Text style={{ fontWeight: 700 }}>Validade da proposta: </Text>
              {formatDate(quote.expirationDate)}
            </Text>
          </View>
          {Number(quote.monthlyTotal) > 0 && (
            <View style={styles.conditionRow}>
              <View style={styles.conditionDot} />
              <Text style={styles.conditionText}>
                <Text style={{ fontWeight: 700 }}>Mensalidade: </Text>
                {formatCurrency(Number(quote.monthlyTotal))}/mês pelo período
                contratado
              </Text>
            </View>
          )}
        </View>

        {/* Signature */}
        <View style={styles.signatureArea} wrap={false}>
          <View style={styles.signatureBlock}>
            {quote.signatureHash ? (
              <View style={styles.digitalSignatureBox}>
                <Text style={styles.digitalSignatureText}>
                  Assinado Digitalmente por: {quote.signerName}
                </Text>
                <Text style={styles.digitalSignatureDate}>
                  Data: {formatDate(quote.signedAt)} às{' '}
                  {quote.signedAt
                    ? new Date(quote.signedAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </Text>
                <Text style={styles.digitalSignatureHash}>
                  Autenticidade: {quote.signatureHash}
                </Text>
              </View>
            ) : (
              <View style={styles.signatureLine} />
            )}
            <Text style={styles.signatureLabel}>
              {displayOrgName}
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Cliente</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {displayOrgName} — Proposta Comercial
          </Text>
          <Text style={styles.pageNumber}>
            Gerado em {formatDate(new Date())}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
