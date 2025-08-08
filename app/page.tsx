"use client";

import { useState, useCallback, useEffect } from 'react';
import { Debt, Strategy, PayFrequency, PlanInput, NextMove, ScheduleEntry, PlanSummary } from '@/lib/types';
import { computeNextMove, computeFullSchedule, computePlanSummary } from '@/lib/algos/allocator';
import { NextMoveCard } from '@/components/features/next-move-card';
import { DebtTable } from '@/components/features/debt-table';
import { StrategySelector } from '@/components/features/strategy-selector';
import { PaycheckSettings } from '@/components/features/paycheck-settings';
import { ProgressOverview } from '@/components/features/progress-overview';
import { PlanSchedule } from '@/components/features/plan-schedule';
import { PayoffChart } from '@/components/charts/payoff-chart';
import { ExportDialog } from '@/components/features/export-dialog';
import { ExportData } from '@/lib/export-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator, Download, Settings, BarChart3, FileText, Zap } from 'lucide-react';
import { format } from 'date-fns';

export default function Home() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [strategy, setStrategy] = useState<Strategy>('AVALANCHE');
  const [paycheckAmount, setPaycheckAmount] = useState<number>(0);
  const [payFrequency, setPayFrequency] = useState<PayFrequency>('biweekly');
  const [nextMove, setNextMove] = useState<NextMove | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [summary, setSummary] = useState<PlanSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const generatePlan = useCallback(() => {
    if (debts.length === 0 || paycheckAmount <= 0) {
      setNextMove(null);
      setSchedule([]);
      setSummary(null);
      return;
    }

    setIsLoading(true);
    
    try {
      const input: PlanInput = {
        debts,
        strategy,
        paycheckAmount,
        payFrequency,
        startDate: format(new Date(), 'yyyy-MM-dd'),
      };

      const computedNextMove = computeNextMove(input);
      const computedSchedule = computeFullSchedule(input);
      const computedSummary = computePlanSummary(input, computedSchedule);

      setNextMove(computedNextMove);
      setSchedule(computedSchedule);
      setSummary(computedSummary);
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setIsLoading(false);
    }
  }, [debts, strategy, paycheckAmount, payFrequency]);

  // Auto-generate plan when inputs change
  useEffect(() => {
    generatePlan();
  }, [generatePlan]);

  const handleAddDebt = (debtData: Omit<Debt, 'id'>) => {
    const newDebt: Debt = {
      ...debtData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setDebts(prev => [...prev, newDebt]);
  };

  const handleUpdateDebt = (id: string, updates: Partial<Debt>) => {
    setDebts(prev => prev.map(debt => 
      debt.id === id ? { ...debt, ...updates } : debt
    ));
  };

  const handleDeleteDebt = (id: string) => {
    setDebts(prev => prev.filter(debt => debt.id !== id));
  };

  const totalDebtAmount = debts.reduce((sum, debt) => sum + debt.balance, 0);

  const exportData: ExportData = {
    debts,
    nextMove,
    schedule,
    summary,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Calculator className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Debt Strategist</h1>
                <p className="text-sm text-muted-foreground">
                  Smart paycheck-aware debt payoff planning
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="hidden md:inline-flex">
                <Zap className="h-3 w-3 mr-1" />
                Free Plan
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsExportDialogOpen(true)}
                disabled={!nextMove || debts.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Personalized Debt Freedom Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get paycheck-by-paycheck guidance to pay off ${totalDebtAmount.toLocaleString()} in debt faster and save thousands in interest.
          </p>
        </div>

        {/* Next Move Card - Featured */}
        {nextMove && (
          <div className="mb-8">
            <NextMoveCard nextMove={nextMove} className="max-w-4xl mx-auto" />
          </div>
        )}

        {/* Progress Overview */}
        {summary && (
          <ProgressOverview 
            debts={debts} 
            summary={summary} 
            className="mb-8"
          />
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Plan
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <DebtTable
                debts={debts}
                onAddDebt={handleAddDebt}
                onUpdateDebt={handleUpdateDebt}
                onDeleteDebt={handleDeleteDebt}
              />
              <div className="space-y-6">
                <StrategySelector
                  selectedStrategy={strategy}
                  onStrategyChange={setStrategy}
                />
                <PaycheckSettings
                  paycheckAmount={paycheckAmount}
                  payFrequency={payFrequency}
                  onPaycheckAmountChange={setPaycheckAmount}
                  onPayFrequencyChange={setPayFrequency}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="plan" className="space-y-6">
            <div className="grid gap-6">
              {nextMove && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Debt Payoff Strategy</CardTitle>
                    <CardDescription>
                      Based on your {strategy.toLowerCase()} strategy with {payFrequency} paychecks of ${paycheckAmount}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm text-green-600 font-medium mb-1">Interest Saved</div>
                        <div className="text-2xl font-bold text-green-700">
                          ${nextMove.interestSavedVsMinimumsOnly.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600">vs. minimum payments only</div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium mb-1">Debt-Free Date</div>
                        <div className="text-2xl font-bold text-blue-700">
                          {format(new Date(nextMove.projectedDebtFreeDate), 'MMM yyyy')}
                        </div>
                        <div className="text-xs text-blue-600">{nextMove.monthsToPayoff} months from now</div>
                      </div>
                      
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="text-sm text-purple-600 font-medium mb-1">Total Interest</div>
                        <div className="text-2xl font-bold text-purple-700">
                          ${nextMove.totalInterestPaid.toLocaleString()}
                        </div>
                        <div className="text-xs text-purple-600">over life of plan</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <PayoffChart schedule={schedule} />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <PlanSchedule schedule={schedule} />
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-amber-600">⚠️</div>
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-2">Educational Purposes Only</p>
              <p>
                This tool provides educational guidance and projections based on your inputs. 
                It is not financial advice. Interest calculations are estimates and actual results may vary. 
                Always consult with a qualified financial advisor for personalized advice. 
                We assume no prepayment penalties and consistent payment behavior.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        data={exportData}
      />
    </div>
  );
}