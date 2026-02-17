'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CategoryBreakdownProps {
  data: Array<{
    categoryId: string;
    total: number;
    percentage: string;
  }>;
}

const COLORS = ['#6366F1', '#8B5CF6', '#A78BFA', '#EC4899', '#F472B6', '#FB923C', '#FBBF24'];

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const chartData = data.map((item) => ({
    name: item.categoryId === 'uncategorized' ? 'Uncategorized' : item.categoryId,
    value: item.total,
    percentage: item.percentage,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No expense data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-gray-600 dark:text-gray-400">
                      ${item.value.toFixed(2)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-500 w-12 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
