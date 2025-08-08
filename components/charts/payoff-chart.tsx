"use client";

import { ScheduleEntry } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatCurrency } from '@/lib/algos/utils';
import { format, parseISO } from 'date-fns';
import { TrendingDown } from 'lucide-react';

interface PayoffChartProps {
  schedule: ScheduleEntry[];
  className?: string;
}

export function PayoffChart({ schedule, className }: PayoffChartProps) {
  if (schedule.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Debt Payoff Projection
          </CardTitle>
          <CardDescription>
            No data available for chart
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Prepare chart data - sample every few entries for better readability
  const sampleSize = Math.max(1, Math.floor(schedule.length / 50)); // Show max 50 points
  const chartData = schedule
    .filter((_, index) => index % sampleSize === 0 || index === schedule.length - 1)
    .map((entry, index) => {
      const totalBalance = Object.values(entry.remainingBalances).reduce((sum, balance) => sum + balance, 0);
      const cumulativeInterest = schedule
        .slice(0, schedule.indexOf(entry) + 1)
        .reduce((sum, e) => sum + Object.values(e.interestPaid).reduce((a, b) => a + b, 0), 0);
      
      return {
        date: format(parseISO(entry.paycheckDate), 'MMM yyyy'),
        fullDate: entry.paycheckDate,
        totalBalance: Math.max(0, totalBalance),
        cumulativeInterest,
        paymentNumber: schedule.indexOf(entry) + 1,
      };
    });

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'totalBalance') {
      return [formatCurrency(value), 'Remaining Balance'];
    }
    if (name === 'cumulativeInterest') {
      return [formatCurrency(value), 'Total Interest Paid'];
    }
    return [value, name];
  };

  const formatTooltipLabel = (label: string, payload: any[]) => {
    if (payload && payload[0]) {
      return `Payment #${payload[0].payload.paymentNumber} - ${payload[0].payload.date}`;
    }
    return label;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Debt Payoff Projection
        </CardTitle>
        <CardDescription>
          Watch your debt decrease over time with your chosen strategy
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={formatTooltipValue}
                labelFormatter={formatTooltipLabel}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Area
                type="monotone"
                dataKey="totalBalance"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.1}
                strokeWidth={2}
                name="Remaining Balance"
              />
              <Line
                type="monotone"
                dataKey="cumulativeInterest"
                stroke="hsl(var(--destructive))"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="Total Interest"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/20 border-2 border-primary rounded-sm"></div>
            <span className="text-muted-foreground">Remaining Balance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-destructive rounded-sm" style={{ borderStyle: 'dashed' }}></div>
            <span className="text-muted-foreground">Cumulative Interest</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}