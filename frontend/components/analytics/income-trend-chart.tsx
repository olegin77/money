'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface IncomeTrendChartProps {
  data: Array<{ date: string; total: number }>;
}

export function IncomeTrendChart({ data }: IncomeTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center text-sm">
            No income data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--text-muted))"
                fontSize={11}
                tickFormatter={value => {
                  const d = new Date(value);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis stroke="hsl(var(--text-muted))" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--bg-card) / 0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid hsl(var(--border) / 0.5)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Income']}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                fill="url(#incomeGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
