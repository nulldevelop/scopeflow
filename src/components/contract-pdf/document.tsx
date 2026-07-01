import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

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
const GREEN = '#16a34a'
const GREEN_LIGHT = '#f0fdf4'

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
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: `2px solid ${BRAND}`,
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
  companyName: {
    fontSize: 14,
    fontWeight: 700,
    color: BRAND_DARK,
    letterSpacing: -0.3,
  },
  documentKicker: {
    fontSize: 7,
    color: GRAY_400,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: GRAY_900,
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  referenceRow: {
    fontSize: 8,
    color: GRAY_400,
    marginTop: 8,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  qualificationTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: GRAY_900,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  qualification: {
    fontSize: 9,
    color: GRAY_600,
    lineHeight: 1.6,
    marginBottom: 20,
  },
  partiesSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  partyBlock: {
    flex: 1,
    padding: 14,
    backgroundColor: GRAY_50,
    borderRadius: 8,
    border: `1px solid ${GRAY_100}`,
  },
  partyLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: GRAY_400,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  partyValue: {
    fontSize: 11,
    fontWeight: 700,
    color: GRAY_900,
  },
  partySub: {
    fontSize: 8,
    color: GRAY_500,
    marginTop: 2,
  },
  clauseSection: {
    marginBottom: 16,
  },
  clauseTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: GRAY_900,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  clauseTextWrapper: {
    backgroundColor: GRAY_50,
    borderRadius: 6,
    padding: 12,
  },
  clauseText: {
    fontSize: 9,
    color: GRAY_600,
    lineHeight: 1.6,
  },
  valueBox: {
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    backgroundColor: BRAND_DARK,
    borderRadius: 8,
    alignItems: 'flex-end',
  },
  valueLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: '#fff',
    opacity: 0.7,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  valueAmount: {
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: -0.5,
  },
  signatureArea: {
    marginTop: 16,
    paddingTop: 24,
    borderTop: `1px solid ${GRAY_200}`,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: {
    flex: 0.46,
  },
  signatureRole: {
    fontSize: 7,
    fontWeight: 700,
    color: GRAY_400,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  signatureLine: {
    borderBottom: `1px solid ${GRAY_300}`,
    height: 40,
    marginBottom: 4,
  },
  signatureName: {
    fontSize: 8,
    fontWeight: 700,
    color: GRAY_700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  digitalSignatureBox: {
    backgroundColor: BRAND_LIGHT,
    border: `1px solid ${BRAND}`,
    borderRadius: 6,
    padding: 10,
    minHeight: 64,
    marginBottom: 6,
  },
  digitalSignatureBoxClient: {
    backgroundColor: GREEN_LIGHT,
    border: `1px solid ${GREEN}`,
  },
  digitalSignatureTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: BRAND_DARK,
    marginBottom: 4,
  },
  digitalSignatureTitleClient: {
    color: GREEN,
  },
  digitalSignatureName: {
    fontSize: 9,
    fontWeight: 700,
    color: GRAY_900,
  },
  digitalSignatureMeta: {
    fontSize: 7,
    color: GRAY_500,
    marginTop: 2,
  },
  digitalSignatureHash: {
    fontSize: 6,
    color: BRAND,
    fontFamily: 'Courier',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTop: `1px solid ${GRAY_200}`,
  },
  footerText: {
    fontSize: 7,
    color: GRAY_400,
  },
})

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  rascunho: { label: 'Rascunho', color: GRAY_600, bg: GRAY_100 },
  enviado: { label: 'Enviado', color: '#1d4ed8', bg: '#dbeafe' },
  assinado: { label: 'Assinado', color: GREEN, bg: GREEN_LIGHT },
  cancelado: { label: 'Cancelado', color: '#dc2626', bg: '#fee2e2' },
}

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

function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('pt-BR')
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

export interface ContractPDFData {
  id: string
  title: string
  contractNumber: string | null
  status: string
  totalValue: number
  startDate: Date | null
  endDate: Date | null
  objectClause: string | null
  timelineClause: string | null
  paymentClause: string | null
  ipClause: string | null
  providerSigned: boolean
  providerSignedAt: Date | null
  providerSignerName: string | null
  providerSignatureHash: string | null
  clientSigned: boolean
  clientSignedAt: Date | null
  clientSignerName: string | null
  clientSignatureHash: string | null
  createdAt: Date
  client: {
    name: string
    email: string | null
    document: string | null
    phone: string | null
    address: string | null
  } | null
  organization: {
    name: string
    slug: string
    logo: string | null
    document?: string | null
    address?: string | null
    legalRep?: string | null
  }
}

interface Clause {
  number: string
  title: string
  content: string | null
}

export function ContractPDF({ contract }: { contract: ContractPDFData }) {
  const orgLogoUrl = getAbsoluteUrl(contract.organization.logo)
  const status = statusConfig[contract.status] || statusConfig.rascunho

  const clauses: Clause[] = [
    {
      number: '1',
      title: 'Objeto e Escopo dos Serviços',
      content: contract.objectClause,
    },
    {
      number: '2',
      title: 'Prazo de Execução',
      content: contract.timelineClause,
    },
    {
      number: '3',
      title: 'Valores e Forma de Pagamento',
      content: contract.paymentClause,
    },
    {
      number: '4',
      title: 'Propriedade Intelectual, Confidencialidade e Rescisão',
      content: contract.ipClause,
    },
  ]

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.logoContainer}>
              {orgLogoUrl && (
                <Image
                  src={orgLogoUrl}
                  style={[styles.orgLogo, { objectFit: 'contain' }]}
                />
              )}
              <Text style={styles.companyName}>
                {contract.organization.name}
              </Text>
            </View>
            <Text style={styles.documentKicker}>
              Contrato de Prestação de Serviços
            </Text>
            <Text style={styles.documentTitle}>{contract.title}</Text>
            <Text style={styles.referenceRow}>
              {contract.contractNumber ? `#${contract.contractNumber} | ` : ''}
              Ref: {contract.id.slice(0, 8).toUpperCase()} | Emissão:{' '}
              {formatDate(contract.createdAt)}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text
              style={[
                styles.statusBadge,
                { color: status.color, backgroundColor: status.bg },
              ]}
            >
              {status.label}
            </Text>
          </View>
        </View>

        {/* Qualification */}
        <Text style={styles.qualificationTitle}>Qualificação das Partes</Text>
        <Text style={styles.qualification}>
          Pelo presente instrumento particular, de um lado{' '}
          <Text style={{ fontWeight: 700 }}>
            {contract.client?.name || '[CONTRATANTE]'}
          </Text>
          {contract.client?.document
            ? `, inscrito(a) no CPF/CNPJ sob nº ${contract.client.document}`
            : ''}
          {contract.client?.address
            ? `, com endereço em ${contract.client.address}`
            : ''}
          {', doravante denominado(a) '}
          <Text style={{ fontWeight: 700 }}>CONTRATANTE</Text>; e, de outro
          lado,{' '}
          <Text style={{ fontWeight: 700 }}>{contract.organization.name}</Text>
          {contract.organization.document
            ? `, inscrita no CNPJ/CPF sob nº ${contract.organization.document}`
            : ''}
          {contract.organization.address
            ? `, com sede em ${contract.organization.address}`
            : ''}
          {contract.organization.legalRep
            ? `, neste ato representada por ${contract.organization.legalRep}`
            : ''}
          {', doravante denominada '}
          <Text style={{ fontWeight: 700 }}>CONTRATADA</Text>, têm entre si
          justo e contratado o presente Contrato de Prestação de Serviços, que
          se regerá pelas cláusulas a seguir.
        </Text>

        {/* Parties */}
        <View style={styles.partiesSection}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Contratante</Text>
            <Text style={styles.partyValue}>
              {contract.client?.name || '—'}
            </Text>
            {contract.client?.document && (
              <Text style={styles.partySub}>
                CPF/CNPJ: {contract.client.document}
              </Text>
            )}
            {contract.client?.address && (
              <Text style={styles.partySub}>{contract.client.address}</Text>
            )}
            {contract.client?.email && (
              <Text style={styles.partySub}>{contract.client.email}</Text>
            )}
            {contract.client?.phone && (
              <Text style={styles.partySub}>{contract.client.phone}</Text>
            )}
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Contratada</Text>
            <Text style={styles.partyValue}>{contract.organization.name}</Text>
            {contract.organization.document && (
              <Text style={styles.partySub}>
                CNPJ/CPF: {contract.organization.document}
              </Text>
            )}
            {contract.organization.address && (
              <Text style={styles.partySub}>
                {contract.organization.address}
              </Text>
            )}
            {contract.organization.legalRep && (
              <Text style={styles.partySub}>
                Rep.: {contract.organization.legalRep}
              </Text>
            )}
            {contract.startDate && (
              <Text style={styles.partySub}>
                Início: {formatDate(contract.startDate)}
              </Text>
            )}
            {contract.endDate && (
              <Text style={styles.partySub}>
                Término: {formatDate(contract.endDate)}
              </Text>
            )}
          </View>
        </View>

        {/* Clauses */}
        {clauses.map((clause) =>
          clause.content ? (
            <View key={clause.number} style={styles.clauseSection}>
              <View wrap={false}>
                <Text style={styles.clauseTitle}>
                  {clause.number}. {clause.title}
                </Text>
              </View>
              <View style={styles.clauseTextWrapper}>
                <Text style={styles.clauseText}>{clause.content}</Text>
              </View>
            </View>
          ) : null,
        )}

        {/* Total Value */}
        <View style={styles.valueBox} wrap={false}>
          <Text style={styles.valueLabel}>Valor Total do Contrato</Text>
          <Text style={styles.valueAmount}>
            {formatCurrency(Number(contract.totalValue))}
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureArea} wrap={false}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureRole}>Contratada</Text>
            {contract.providerSigned ? (
              <View style={styles.digitalSignatureBox}>
                <Text style={styles.digitalSignatureTitle}>
                  Assinado Digitalmente
                </Text>
                <Text style={styles.digitalSignatureName}>
                  {contract.providerSignerName}
                </Text>
                {contract.providerSignedAt && (
                  <Text style={styles.digitalSignatureMeta}>
                    {formatDateTime(contract.providerSignedAt)}
                  </Text>
                )}
                {contract.providerSignatureHash && (
                  <Text style={styles.digitalSignatureHash}>
                    Autenticidade: {contract.providerSignatureHash}
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.signatureLine} />
            )}
            <Text style={styles.signatureName}>
              {contract.organization.name}
            </Text>
          </View>

          <View style={styles.signatureBlock}>
            <Text style={styles.signatureRole}>Contratante</Text>
            {contract.clientSigned ? (
              <View
                style={[
                  styles.digitalSignatureBox,
                  styles.digitalSignatureBoxClient,
                ]}
              >
                <Text
                  style={[
                    styles.digitalSignatureTitle,
                    styles.digitalSignatureTitleClient,
                  ]}
                >
                  Assinado pelo Cliente
                </Text>
                <Text style={styles.digitalSignatureName}>
                  {contract.clientSignerName}
                </Text>
                {contract.clientSignedAt && (
                  <Text style={styles.digitalSignatureMeta}>
                    {formatDateTime(contract.clientSignedAt)}
                  </Text>
                )}
                {contract.clientSignatureHash && (
                  <Text style={styles.digitalSignatureHash}>
                    Autenticidade: {contract.clientSignatureHash}
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.signatureLine} />
            )}
            <Text style={styles.signatureName}>
              {contract.client?.name || 'Assinatura do Contratante'}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {contract.organization.name} — Contrato de Prestação de Serviços
          </Text>
          <Text style={styles.footerText}>
            Gerado em {formatDate(new Date())}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
