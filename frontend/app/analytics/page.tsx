'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useT } from '@/hooks/use-t';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/analytics/stat-card';
import { CategoryBreakdown } from '@/components/analytics/category-breakdown';
import { CashFlowChart } from '@/components/analytics/cash-flow-chart';
import { MonthlyComparison } from '@/components/analytics/monthly-comparison';
import { IncomeTrendChart } from '@/components/analytics/income-trend-chart';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { Expense } from '@/lib/api/expenses';
import { Income } from '@/lib/api/income';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { expensesApi } from '@/lib/api/expenses';
import { incomeApi } from '@/lib/api/income';
import { toast } from '@/hooks/use-toast';
import { PageFadeIn } from '@/components/ui/motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  useDashboard,
  useCashFlow,
  useIncomeTrendAnalytics,
  useMonthlyComparison,
} from '@/hooks/use-dashboard';

type Period = 'week' | 'month' | 'year' | 'all';
const PERIODS: Period[] = ['week', 'month', 'year', 'all'];

const PERIOD_KEYS = {
  week: 'ana_week',
  month: 'ana_month',
  year: 'ana_year',
  all: 'ana_all',
} as const;

export default function AnalyticsPage() {
  const { isLoading: authLoading } = useAuth(true);
  const t = useT();
  const [period, setPeriod] = useState<Period>('month');
  const [exporting, setExporting] = useState(false);

  const { data: dashboard, isLoading: dashLoading } = useDashboard(period);
  const { data: cashFlow = [] } = useCashFlow({
    startDate: period !== 'all' ? undefined : '2020-01-01',
    endDate: undefined,
  });
  const { data: incomeTrend = [] } = useIncomeTrendAnalytics({
    groupBy: period === 'week' ? 'day' : 'week',
  });
  const { data: monthlyData = [] } = useMonthlyComparison(
    period === 'year' ? 12 : period === 'all' ? 24 : 6
  );

  const loading = authLoading || dashLoading;

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const [expData, incData] = await Promise.all([
        expensesApi.findAll({ page: 1, limit: 10000 }),
        incomeApi.findAll({ page: 1, limit: 10000 }),
      ]);
      const rows = [
        ['Type', 'Date', 'Amount', 'Currency', 'Description', 'Category ID', 'Payment Method'],
      ];
      for (const e of expData.items) {
        rows.push([
          'expense',
          e.date,
          String(e.amount),
          e.currency,
          (e.description || '').replace(/"/g, '""'),
          e.categoryId || '',
          e.paymentMethod || '',
        ]);
      }
      for (const i of incData.items) {
        rows.push([
          'income',
          i.date,
          String(i.amount),
          i.currency,
          (i.description || '').replace(/"/g, '""'),
          '',
          i.source || '',
        ]);
      }
      const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fintrack-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t('toast_error'));
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const [expData, incData] = await Promise.all([
        expensesApi.findAll({ page: 1, limit: 10000 }),
        incomeApi.findAll({ page: 1, limit: 10000 }),
      ]);
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('FinTrack Financial Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

      const rows = [
        ...expData.items.map((e: Expense) => [
          'Expense',
          e.date,
          `$${Number(e.amount).toFixed(2)}`,
          e.currency,
          e.description || '',
        ]),
        ...incData.items.map((i: Income) => [
          'Income',
          i.date,
          `$${Number(i.amount).toFixed(2)}`,
          i.currency,
          i.description || '',
        ]),
      ];

      autoTable(doc, {
        head: [['Type', 'Date', 'Amount', 'Currency', 'Description']],
        body: rows,
        startY: 34,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [99, 102, 241] },
      });

      doc.save(`fintrack-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch {
      toast.error(t('toast_error'));
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const [expData, incData] = await Promise.all([
        expensesApi.findAll({ page: 1, limit: 10000 }),
        incomeApi.findAll({ page: 1, limit: 10000 }),
      ]);

      const expRows = expData.items.map((e: Expense) => ({
        Type: 'Expense',
        Date: e.date,
        Amount: Number(e.amount),
        Currency: e.currency,
        Description: e.description || '',
        Category: e.categoryId || '',
        'Payment Method': e.paymentMethod || '',
      }));

      const incRows = incData.items.map((i: Income) => ({
        Type: 'Income',
        Date: i.date,
        Amount: Number(i.amount),
        Currency: i.currency,
        Description: i.description || '',
        Source: i.source || '',
      }));

      const wb = XLSX.utils.book_new();
      const wsExpenses = XLSX.utils.json_to_sheet(expRows);
      const wsIncome = XLSX.utils.json_to_sheet(incRows);
      XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses');
      XLSX.utils.book_append_sheet(wb, wsIncome, 'Income');
      XLSX.writeFile(wb, `fintrack-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch {
      toast.error(t('toast_error'));
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <ResponsiveContainer>
        <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-8">
          <Skeleton className="h-8 w-36" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </ResponsiveContainer>
    );
  }

  if (!dashboard) return null;

  const { summary, expensesByCategory, topExpenses } = dashboard;

  return (
    <ResponsiveContainer>
      <PageFadeIn className="p-4 md:p-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="hidden md:block">
              <h1 className="text-foreground text-2xl font-bold">{t('ana_title')}</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {summary.expenseCount + summary.incomeCount > 0
                  ? `${summary.expenseCount + summary.incomeCount} transactions this ${period === 'all' ? 'period' : period}`
                  : t('ana_no_data')}
              </p>
            </div>
            {/* Period selector + export */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={exporting}
                className="h-8 gap-1 text-xs"
              >
                <Download size={13} />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={exporting}
                className="h-8 gap-1 text-xs"
              >
                <FileText size={13} />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                disabled={exporting}
                className="h-8 gap-1 text-xs"
              >
                <FileSpreadsheet size={13} />
                Excel
              </Button>
              <div className="flex gap-1.5 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
                {PERIODS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={[
                      'rounded-md px-3 py-1 text-xs font-medium transition-all',
                      period === p
                        ? 'text-foreground shadow-xs bg-white dark:bg-zinc-700'
                        : 'text-muted-foreground hover:text-foreground',
                    ].join(' ')}
                  >
                    {t(PERIOD_KEYS[p])}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              title={t('ana_balance')}
              value={`$${Number(summary.balance).toFixed(2)}`}
              className={[
                'col-span-2 lg:col-span-1',
                summary.balance >= 0
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-red-600 bg-red-600 text-white',
              ].join(' ')}
              icon="💰"
            />
            <StatCard
              title={t('ana_expenses')}
              value={`$${Number(summary.totalExpenses).toFixed(2)}`}
              subtitle={`${summary.expenseCount} tx`}
              icon="📊"
            />
            <StatCard
              title={t('ana_income')}
              value={`$${Number(summary.totalIncome).toFixed(2)}`}
              subtitle={`${summary.incomeCount} tx`}
              icon="💵"
            />
            <StatCard
              title={t('ana_savings')}
              value={`${Number(summary.savingsRate).toFixed(1)}%`}
              subtitle={`Avg: $${Number(summary.avgIncome).toFixed(2)}`}
              icon="📈"
            />
          </div>

          {/* Charts row */}
          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CategoryBreakdown data={expensesByCategory} />
            <CashFlowChart data={cashFlow} />
          </div>

          {/* Income trend */}
          <div className="mb-4">
            <IncomeTrendChart data={incomeTrend} />
          </div>

          {/* Monthly comparison */}
          <div className="mb-4">
            <MonthlyComparison data={monthlyData} />
          </div>

          {/* Top expenses */}
          {topExpenses.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-wide">
                  {t('ana_by_category')}
                </p>
                <div className="space-y-2">
                  {topExpenses.map((expense, idx) => (
                    <div key={expense.id} className="flex items-center gap-3 py-2">
                      <span className="text-muted-foreground w-5 shrink-0 text-right text-xs">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-medium">
                          {expense.description || 'No description'}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(expense.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums text-red-500">
                        ${Number(expense.amount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageFadeIn>
    </ResponsiveContainer>
  );
}
