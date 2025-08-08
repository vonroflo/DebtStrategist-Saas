"use client";

import { ScheduleEntry } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CalendarDays, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/algos/utils';
import { format, parseISO } from 'date-fns';

interface PlanScheduleProps {
  schedule: ScheduleEntry[];
  className?: string;
}

export function PlanSchedule({ schedule, className }: PlanScheduleProps) {
  if (schedule.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Payment Schedule
          </CardTitle>
          <CardDescription>
            No payment schedule generated yet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalPayments = schedule.reduce((sum, entry) => sum + entry.total, 0);
  const totalInterest = schedule.reduce((sum, entry) => 
    sum + Object.values(entry.interestPaid).reduce((a, b) => a + b, 0), 0
  );

  // Show first 12 entries for initial view
  const displaySchedule = schedule.slice(0, 12);
  const hasMore = schedule.length > 12;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Payment Schedule
            </CardTitle>
            <CardDescription>
              {schedule.length} payments • {formatCurrency(totalPayments)} total
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              Total Interest
            </div>
            <div className="text-lg font-semibold text-orange-600">
              {formatCurrency(totalInterest)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Payment</TableHead>
              <TableHead className="text-right">Interest</TableHead>
              <TableHead>Remaining Balances</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displaySchedule.map((entry, index) => {
              const entryInterest = Object.values(entry.interestPaid).reduce((a, b) => a + b, 0);
              const activeBalances = Object.entries(entry.remainingBalances)
                .filter(([_, balance]) => balance > 0.01);

              return (
                <TableRow key={entry.paycheckDate}>
                  <TableCell className="font-medium">
                    <div>
                      {format(parseISO(entry.paycheckDate), 'MMM dd, yyyy')}
                    </div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Payment #{index + 1}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(entry.total)}
                  </TableCell>
                  <TableCell className="text-right text-orange-600">
                    {formatCurrency(entryInterest)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {activeBalances.length === 0 ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          All Paid Off! 🎉
                        </Badge>
                      ) : (
                        activeBalances.slice(0, 3).map(([debtId, balance]) => (
                          <div key={debtId} className="text-xs">
                            Debt {debtId.slice(-4)}: {formatCurrency(balance)}
                          </div>
                        ))
                      )}
                      {activeBalances.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{activeBalances.length - 3} more
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {hasMore && (
          <div className="text-center pt-4 text-sm text-muted-foreground">
            Showing first 12 payments of {schedule.length} total payments
          </div>
        )}
      </CardContent>
    </Card>
  );
}