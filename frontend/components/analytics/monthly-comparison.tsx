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
  Line,
  ComposedChart,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MonthlyComparisonProps {
  data: Array<{
    month: string;
    expenses: number;
    income: number;
    balance: number;
    savingsRate: string;
  }>;
}

export function MonthlyComparison({ data }: MonthlyComparisonProps) {
  const chartData = data.map((item) => ({
    ...item,
    savingsRate: parseFloat(item.savingsRate),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
            <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="#A78BFA" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="income" fill="#10B981" name="Income" />
            <Bar yAxisId="left" dataKey="expenses" fill="#EF4444" name="Expenses" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="savingsRate"
              stroke="#A78BFA"
              strokeWidth={2}
              name="Savings Rate %"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
