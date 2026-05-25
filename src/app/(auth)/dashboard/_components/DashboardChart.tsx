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

interface DashboardChartProps {
  data: { name: string; value: number }[]
}

export function DashboardChart({ data }: DashboardChartProps) {
  return (
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
            data={data}
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
  )
}
