import {
  ArrowRight,
  CheckCircle2,
  DollarSign,
  FileText,
  LayoutDashboard,
  Plus,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/shared/Header'
import { MetricCard } from '@/components/shared/MetricCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ProjectStatus } from '@/types'
import { DashboardChart } from './_components/DashboardChart'
import { getSessionQuotes } from './_data-access/get-quotes'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const quotes = await getSessionQuotes()

  const totalQuotes = quotes.length
  const approvedQuotes = quotes.filter((q) => q.status === 'aprovada').length
  const conversionRate =
    totalQuotes > 0 ? ((approvedQuotes / totalQuotes) * 100).toFixed(1) : '0'
  const avgTicket =
    quotes.length > 0
      ? (
          quotes.reduce((acc, curr) => acc + Number(curr.totalValue), 0) /
          quotes.length
        ).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      : 'R$ 0,00'

  const recentQuotes = [...quotes].slice(0, 5)

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return {
      name: d.toLocaleString('pt-BR', { month: 'short' }).replace('.', ''),
      month: d.getMonth(),
      year: d.getFullYear(),
      value: 0,
    }
  }).reverse()

  for (const quote of quotes) {
    const qDate = new Date(quote.createdAt)
    const monthData = last6Months.find(
      (m) => m.month === qDate.getMonth() && m.year === qDate.getFullYear(),
    )
    if (monthData) {
      monthData.value++
    }
  }

  const chartData = last6Months.map(({ name, value }) => ({ name, value }))

  return (
    <div className="min-h-screen bg-[#F8F7F3]">
      <Header
        title="Dashboard"
        subtitle="Acompanhe seus orçamentos, conversões e métricas"
        icon={LayoutDashboard}
      >
        <Link
          href="dashboard/orcamentos/novo"
          className="bg-white text-gray-900 hover:bg-gray-50 rounded-xl flex items-center gap-2 px-5 py-2.5 font-medium transition-all shadow-lg shadow-brand/10"
        >
          <Plus className="w-4 h-4" />
          Novo orçamento
        </Link>
      </Header>

      {/* Content */}
      <div className="px-8 -mt-14 relative z-10 pb-12">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              label="Total de orçamentos"
              value={totalQuotes}
              icon={FileText}
              className="rounded-[24px] hover:shadow-xl hover:shadow-brand/5 transition-all"
            />
            <MetricCard
              label="Aprovadas"
              value={approvedQuotes}
              icon={CheckCircle2}
              variant="ok"
              className="rounded-[24px] hover:shadow-xl hover:shadow-brand/5 transition-all"
            />
            <MetricCard
              label="Taxa de conversão"
              value={`${conversionRate}%`}
              icon={TrendingUp}
              variant="brand"
              className="rounded-[24px] hover:shadow-xl hover:shadow-brand/5 transition-all"
            />
            <MetricCard
              label="Ticket médio"
              value={avgTicket}
              icon={DollarSign}
              variant="blue"
              className="rounded-[24px] hover:shadow-xl hover:shadow-brand/5 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <DashboardChart data={chartData} />

            <Card className="p-6 bg-white border border-gray-200 rounded-[24px] flex flex-col hover:shadow-xl hover:shadow-brand/5 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-900">Recentes</h3>
                <Link
                  href="/orcamentos"
                  className="text-xs text-brand font-medium hover:underline flex items-center gap-1"
                >
                  Ver todos <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-6 flex-1">
                {recentQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                        {quote.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {quote.client?.name || '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-medium text-gray-900">
                        {Number(quote.totalValue).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                      <StatusBadge
                        status={quote.status as ProjectStatus}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="border border-gray-200 rounded-[24px] overflow-hidden hover:shadow-xl hover:shadow-brand/5 transition-all">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                      Projeto
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                      Cliente
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                      Valor
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                      Status
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 text-right">
                      Data
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentQuotes.map((quote) => (
                    <TableRow
                      key={quote.id}
                      className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-900">
                        {quote.title}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {quote.client?.name || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-gray-900">
                        {Number(quote.totalValue).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={quote.status as ProjectStatus} />
                      </TableCell>
                      <TableCell className="text-right text-gray-400 text-sm">
                        {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
