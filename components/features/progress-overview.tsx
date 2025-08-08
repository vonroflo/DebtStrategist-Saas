"use client";

import { Debt, PlanSummary } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProgressRing } from '@/components/ui/progress-ring';
import { CalendarDays, TrendingDown, Target, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/algos/utils';
import { differenceInMonths, format } from 'date-fns';

interface ProgressOverviewProps {
  debts: Debt[];
  summary: PlanSummary;
  className?: string;
}

export function ProgressOverview({ debts, summary, className }: ProgressOverviewProps) {
  const totalOriginalDebt = summary.totalDebtAmount;
  const currentTotalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const paidOffAmount = totalOriginalDebt - currentTotalDebt;
  const progressPercentage = totalOriginalDebt > 0 ? (paidOffAmount / totalOriginalDebt) * 100 : 0;
  
  const monthsFromStart = differenceInMonths(new Date(), new Date());
  const progressTimePercentage = summary.monthsToPayoff > 0 
    ? Math.min(100, (monthsFromStart / summary.monthsToPayoff) * 100)
    : 0;

  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {/* Progress Ring */}
      <Card className="col-span-full md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <ProgressRing 
            progress={progressPercentage} 
            size={120}
            className="mb-4"
          >
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(progressPercentage)}%
              </div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </ProgressRing>
          <div className="text-center">
            <div className="text-sm font-medium">
              {formatCurrency(paidOffAmount)} paid off
            </div>
            <div className="text-xs text-muted-foreground">
              of {formatCurrency(totalOriginalDebt)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debt-Free Date */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Debt-Free Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-1">
            {format(new Date(summary.projectedDebtFreeDate), 'MMM yyyy')}
          </div>
          <div className="text-sm text-muted-foreground mb-3">
            {summary.monthsToPayoff} months to go
          </div>
          <Progress value={progressTimePercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Interest Saved */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Interest Saved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-1 text-green-600">
            {formatCurrency(summary.interestSavedVsMinimumsOnly)}
          </div>
          <div className="text-sm text-muted-foreground mb-3">
            vs. minimum payments
          </div>
          <div className="text-xs text-muted-foreground">
            Total interest: {formatCurrency(summary.totalInterestPaid)}
          </div>
        </CardContent>
      </Card>

      {/* Active Debts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Active Debts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-1">
            {debts.filter(d => d.balance > 0).length}
          </div>
          <div className="text-sm text-muted-foreground mb-3">
            of {debts.length} total
          </div>
          <div className="text-xs text-muted-foreground">
            Current balance: {formatCurrency(currentTotalDebt)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}