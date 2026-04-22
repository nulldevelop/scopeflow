import {
  ArrowRight,
  CheckCircle2,
  DollarSign,
  FileText,
  Plus,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Header } from '@/components/shared/Header'
import { MetricCard } from '@/components/shared/MetricCard'
import { ProfileSelector } from '@/components/shared/ProfileSelector'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getSessionQuotes } from './_data-access/get-quotes'

const chartData = [
  { name: 'Jan', value: 4 },
  { name: 'Fev', value: 7 },
  { name: 'Mar', value: 5 },
  { name: 'Abr', value: 9 },
  { name: 'Mai', value: 6 },
  { name: 'Jun', value: 8 },
]

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

  return (
    <div className="px-8 pb-12">
      <ProfileSelector />
      <Header title="Dashboard">
        <Link
          href="/orcamentos/novo"
          className="bg-brand text-white hover:bg-brand-dark rounded-lg flex items-center gap-2 px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          Novo orçamento
        </Link>
      </Header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Total de orçamentos"
          value={totalQuotes}
          icon={FileText}
        />
        <MetricCard
          label="Aprovadas"
          value={approvedQuotes}
          icon={CheckCircle2}
          variant="ok"
        />
        <MetricCard
          label="Taxa de conversão"
          value={`${conversionRate}%`}
          icon={TrendingUp}
          variant="brand"
        />
        <MetricCard
          label="Ticket médio"
          value={avgTicket}
          icon={DollarSign}
          variant="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6 bg-white border border-gray-200 rounded-[14px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-semibold text-gray-900">
              Propostas por mês
            </h3>
            <span className="text-xs text-gray-400 font-medium">
              Últimos 6 meses
            </span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#ECEAE3"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888780', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888780', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#F5F4F0' }}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #D3D1C7',
                    boxShadow: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#2A6B5C"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 rounded-[14px] flex flex-col">
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
                  <StatusBadge status={quote.status} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="border border-gray-200 rounded-[14px] overflow-hidden">
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
                    <StatusBadge status={quote.status} />
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
  )
}
