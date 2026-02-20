'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CashFlowChartProps {
  data: Array<{
    date: string;
    expenses: number;
    income: number;
    balance: number;
  }>;
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash flow</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={value => {
                const d = new Date(value);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--bg-card) / 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid hsl(var(--border) / 0.5)',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            />
            <Bar dataKey="income" fill="#10b981" name="Income" radius={[3, 3, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
