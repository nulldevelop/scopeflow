'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { OwnerStats } from '../_data-access/get-owner-stats'

interface OwnerDashboardClientProps {
  stats: OwnerStats
  userName: string
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const planLabels: Record<string, string> = {
  free: 'Grátis',
  pro: 'Pro',
  equipe: 'Equipe',
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativas', color: 'text-ok' },
  cancelled: { label: 'Canceladas', color: 'text-danger' },
  past_due: { label: 'Vencidas', color: 'text-accent-amber' },
}

export function OwnerDashboardClient({
  stats,
  userName,
}: OwnerDashboardClientProps) {
  const firstName = userName.split(' ')[0]

  return (
    <div className="px-8 pb-12">
      <header className="flex items-center justify-between h-16 px-0 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Painel do Owner
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Visão geral da plataforma, {firstName}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Usuarios"
          value={stats.totalUsers}
          subtitle={`${stats.userGrowth.length > 0 ? stats.userGrowth[stats.userGrowth.length - 1]?.value || 0 : 0} no ultimo mes`}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <title>Usuarios</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
          }
          variant="brand"
        />
        <MetricCard
          label="Organizacoes"
          value={stats.totalOrganizations}
          subtitle={`+${stats.organizationsToday} hoje, +${stats.organizationsThisMonth} este mes`}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <title>Organizacoes</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
              />
            </svg>
          }
          variant="blue"
        />
        <MetricCard
          label="Receita"
          value={formatBRL(stats.totalRevenue)}
          subtitle={`${formatBRL(stats.totalRevenueThisMonth)} este mes`}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <title>Receita</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          }
          variant="ok"
        />
        <MetricCard
          label="Assinaturas"
          value={stats.activeSubscriptions}
          subtitle={
            stats.subscriptionsByStatus
              .filter((s) => s.status !== 'active')
              .map(
                (s) =>
                  `${s.count} ${statusConfig[s.status]?.label || s.status}`,
              )
              .join(', ') || 'apenas ativas'
          }
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <title>Assinaturas</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
              />
            </svg>
          }
          variant="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <RevenueChart data={stats.revenueHistory} />
        </div>
        <div>
          <PlanDistribution
            plans={stats.usersByPlan}
            subscriptionsByStatus={stats.subscriptionsByStatus}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <UserGrowthChart data={stats.userGrowth} />
        <div className="lg:col-span-2">
          <RecentOrganizationsTable organizations={stats.recentOrganizations} />
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  subtitle,
  icon,
  variant = 'default',
}: {
  label: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  variant?: 'brand' | 'ok' | 'blue' | 'default'
}) {
  const variantStyles = {
    brand: 'text-brand',
    ok: 'text-ok',
    blue: 'text-accent-blue',
    default: 'text-gray-900',
  }
  const iconBgStyles = {
    brand: 'bg-brand-light',
    ok: 'bg-ok-bg',
    blue: 'bg-accent-blue-bg',
    default: 'bg-gray-50',
  }

  return (
    <Card className="p-6 bg-white border border-gray-200 rounded-[14px]">
      <div className="flex items-center gap-4">
        <div className={cn('p-3 rounded-xl', iconBgStyles[variant])}>
          <div className={cn('w-5 h-5', variantStyles[variant])}>{icon}</div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">
            {label}
          </p>
          <p
            className={cn(
              'text-2xl font-mono font-semibold leading-none',
              variantStyles[variant],
            )}
          >
            {value}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
    </Card>
  )
}

function RevenueChart({ data }: { data: { month: string; value: number }[] }) {
  const formattedData = data.map((d) => ({ ...d, value: Math.round(d.value) }))

  return (
    <Card className="p-6 bg-white border border-gray-200 rounded-[14px]">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-semibold text-gray-900">Receita</h3>
        <span className="text-xs text-gray-400 font-medium">Historico</span>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#ECEAE3"
            />
            <XAxis
              dataKey="month"
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
              formatter={(value) => formatBRL(Number(value))}
            />
            <Bar
              dataKey="value"
              fill="#059669"
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function UserGrowthChart({
  data,
}: {
  data: { month: string; value: number }[]
}) {
  return (
    <Card className="p-6 bg-white border border-gray-200 rounded-[14px]">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-semibold text-gray-900">Cadastros</h3>
        <span className="text-xs text-gray-400 font-medium">
          Novos usuarios
        </span>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#ECEAE3"
            />
            <XAxis
              dataKey="month"
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
  )
}

function PlanDistribution({
  plans,
  subscriptionsByStatus,
}: {
  plans: { plan: string; count: number }[]
  subscriptionsByStatus: { status: string; count: number }[]
}) {
  const totalOrgs = plans.reduce((acc, p) => acc + p.count, 0)
  const sortedPlans = [...plans].sort((a, b) => b.count - a.count)

  return (
    <Card className="p-6 bg-white border border-gray-200 rounded-[14px] h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-900 mb-6">Planos</h3>
      <div className="space-y-4 flex-1">
        {sortedPlans.map((p) => {
          const pct =
            totalOrgs > 0 ? ((p.count / totalOrgs) * 100).toFixed(0) : '0'
          return (
            <div key={p.plan}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">
                  {planLabels[p.plan] || p.plan}
                </span>
                <span className="text-sm font-mono text-gray-500">
                  {p.count} ({pct}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all',
                    p.plan === 'free'
                      ? 'bg-gray-400'
                      : p.plan === 'pro'
                        ? 'bg-brand'
                        : 'bg-accent-blue',
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="pt-5 mt-5 border-t border-gray-100 space-y-2">
        {subscriptionsByStatus.map((s) => (
          <div
            key={s.status}
            className="flex items-center justify-between text-sm"
          >
            <span
              className={cn(
                'font-medium',
                statusConfig[s.status]?.color || 'text-gray-600',
              )}
            >
              {statusConfig[s.status]?.label || s.status}
            </span>
            <span className="font-mono text-gray-500">{s.count}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function RecentOrganizationsTable({
  organizations,
}: {
  organizations: { id: string; name: string; plan: string; createdAt: Date }[]
}) {
  return (
    <Card className="border border-gray-200 rounded-[14px] overflow-hidden">
      <div className="p-6 pb-0">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Organizacoes recentes
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Ultimas 10 organizacoes criadas
        </p>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50/50">
          <tr className="border-b border-gray-100">
            <th className="text-left px-6 py-3 text-[10px] uppercase tracking-wider font-semibold text-gray-400">
              Nome
            </th>
            <th className="text-left px-6 py-3 text-[10px] uppercase tracking-wider font-semibold text-gray-400">
              Plano
            </th>
            <th className="text-right px-6 py-3 text-[10px] uppercase tracking-wider font-semibold text-gray-400">
              Criada em
            </th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <tr
              key={org.id}
              className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors"
            >
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {org.name}
              </td>
              <td className="px-6 py-4">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    org.plan === 'free'
                      ? 'bg-gray-100 text-gray-600'
                      : org.plan === 'pro'
                        ? 'bg-brand-light text-brand'
                        : org.plan === 'equipe'
                          ? 'bg-accent-blue-bg text-accent-blue'
                          : 'bg-gray-100 text-gray-600',
                  )}
                >
                  {planLabels[org.plan] || org.plan}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm text-gray-400">
                {new Date(org.createdAt).toLocaleDateString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
