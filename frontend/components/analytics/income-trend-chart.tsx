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
                  backgroundColor: 'var(--color-card, #fff)',
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Income']}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
