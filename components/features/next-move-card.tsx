"use client";

import { NextMove } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingDown, DollarSign, Target } from 'lucide-react';
import { formatCurrency } from '@/lib/algos/utils';
import { format } from 'date-fns';

interface NextMoveCardProps {
  nextMove: NextMove;
  className?: string;
}

export function NextMoveCard({ nextMove, className }: NextMoveCardProps) {
  const totalPayment = nextMove.payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  return (
    <Card className={`border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-primary">Next Move</CardTitle>
          <Badge variant="secondary" className="text-sm font-medium">
            {format(new Date(nextMove.date), 'MMM dd')}
          </Badge>
        </div>
        <CardDescription className="text-lg font-medium text-foreground">
          {nextMove.headline}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Total Payment
            </div>
            <div className="text-2xl font-bold">{formatCurrency(totalPayment)}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Strategy
            </div>
            <div className="text-lg font-semibold capitalize">
              {nextMove.rationale.toLowerCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Debt-Free Date
            </div>
            <div className="text-lg font-semibold">
              {format(new Date(nextMove.projectedDebtFreeDate), 'MMM yyyy')}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              Interest Saved
            </div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(nextMove.interestSavedVsMinimumsOnly)}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="text-sm text-muted-foreground mb-2">Payment Breakdown:</div>
          <div className="space-y-2">
            {nextMove.payments.map((payment) => (
              <div key={payment.debtId} className="flex justify-between items-center text-sm">
                <span className="font-medium">Debt {payment.debtId.slice(-4)}</span>
                <span className="font-semibold">{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}