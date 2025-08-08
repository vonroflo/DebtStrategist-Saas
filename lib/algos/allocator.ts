import { Debt, PlanInput, PaymentAllocation, NextMove, ScheduleEntry, PlanSummary } from '../types';
import { 
  getPaycheckFrequencyFactor, 
  getNextPayday, 
  distributeMinimumsPerPaycheck,
  calculateMonthlyInterest
} from './utils';
import { chooseTargetDebt, getStrategyLabel } from './strategies';
import { addDays, format, differenceInMonths } from 'date-fns';

export function computeNextMove(input: PlanInput): NextMove {
  const payday = getNextPayday(input.startDate, input.payFrequency);
  const perPayMin = distributeMinimumsPerPaycheck(input.debts, input.payFrequency);
  let pool = input.paycheckAmount;

  const allocations: PaymentAllocation[] = [];

  // Cover minimums first
  for (const debt of input.debts) {
    if (debt.balance <= 0) continue;
    
    const minAmount = Math.min(perPayMin[debt.id], pool, debt.balance);
    if (minAmount > 0) {
      allocations.push({ debtId: debt.id, amount: minAmount });
      pool -= minAmount;
    }
  }

  // Choose target debt for extra payment
  const activeDebts = input.debts.filter(d => d.balance > 0);
  const target = chooseTargetDebt(activeDebts, input.strategy, input.customPriority);

  // Apply extra to target
  if (pool > 0 && target) {
    const existingAllocation = allocations.find(a => a.debtId === target.id);
    const maxExtraPayment = Math.min(pool, target.balance - (existingAllocation?.amount || 0));
    
    if (existingAllocation) {
      existingAllocation.amount += maxExtraPayment;
    } else {
      allocations.push({ debtId: target.id, amount: maxExtraPayment });
    }
  }

  // Compute projections
  const schedule = computeFullSchedule(input);
  const summary = computePlanSummary(input, schedule);
  
  const targetDebt = target ? input.debts.find(d => d.id === target.id) : null;
  const targetAllocation = target ? allocations.find(a => a.debtId === target.id) : null;
  
  const headline = target && targetDebt && targetAllocation
    ? `Pay ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(targetAllocation.amount)} to ${targetDebt.name} (${getStrategyLabel(input.strategy)})`
    : 'All debts paid off!';

  return {
    date: format(payday, 'yyyy-MM-dd'),
    payments: allocations,
    headline,
    rationale: input.strategy,
    projectedDebtFreeDate: summary.projectedDebtFreeDate,
    interestSavedVsMinimumsOnly: summary.interestSavedVsMinimumsOnly,
    totalInterestPaid: summary.totalInterestPaid,
    monthsToPayoff: summary.monthsToPayoff,
  };
}

export function computeFullSchedule(input: PlanInput): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = [];
  const workingDebts = input.debts.map(d => ({ ...d }));
  let currentDate = new Date(input.startDate);
  const perPayMin = distributeMinimumsPerPaycheck(workingDebts, input.payFrequency);
  
  const daysToAdd = input.payFrequency === 'weekly' ? 7 : 
                   input.payFrequency === 'biweekly' ? 14 : 30;

  let maxIterations = 520; // ~10 years max
  let iterations = 0;

  while (workingDebts.some(d => d.balance > 0.01) && iterations < maxIterations) {
    iterations++;
    
    let pool = input.paycheckAmount;
    const allocations: PaymentAllocation[] = [];
    const interestPaid: { [debtId: string]: number } = {};
    
    // Apply monthly interest (simplified - apply every paycheck for now)
    for (const debt of workingDebts) {
      if (debt.balance > 0) {
        const monthlyInterest = calculateMonthlyInterest(debt.balance, debt.apr);
        const paycheckInterest = monthlyInterest * getPaycheckFrequencyFactor(input.payFrequency);
        interestPaid[debt.id] = paycheckInterest;
        debt.balance += paycheckInterest;
      }
    }

    // Pay minimums
    for (const debt of workingDebts) {
      if (debt.balance <= 0) continue;
      
      const minAmount = Math.min(perPayMin[debt.id], pool, debt.balance);
      if (minAmount > 0) {
        allocations.push({ debtId: debt.id, amount: minAmount });
        debt.balance -= minAmount;
        pool -= minAmount;
      }
    }

    // Pay extra to target
    const activeDebts = workingDebts.filter(d => d.balance > 0);
    const target = chooseTargetDebt(activeDebts, input.strategy, input.customPriority);
    
    if (pool > 0 && target) {
      const existingAllocation = allocations.find(a => a.debtId === target.id);
      const extraPayment = Math.min(pool, target.balance);
      
      if (existingAllocation) {
        existingAllocation.amount += extraPayment;
      } else {
        allocations.push({ debtId: target.id, amount: extraPayment });
      }
      
      target.balance -= extraPayment;
    }

    // Record this paycheck
    const remainingBalances: { [debtId: string]: number } = {};
    for (const debt of workingDebts) {
      remainingBalances[debt.id] = Math.max(0, debt.balance);
    }

    schedule.push({
      paycheckDate: format(currentDate, 'yyyy-MM-dd'),
      allocation: allocations,
      total: input.paycheckAmount,
      remainingBalances,
      interestPaid,
    });

    currentDate = addDays(currentDate, daysToAdd);
  }

  return schedule;
}

export function computePlanSummary(input: PlanInput, schedule?: ScheduleEntry[]): PlanSummary {
  if (!schedule) {
    schedule = computeFullSchedule(input);
  }

  const totalDebtAmount = input.debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalInterestPaid = schedule.reduce((sum, entry) => 
    sum + Object.values(entry.interestPaid).reduce((a, b) => a + b, 0), 0
  );

  const lastEntry = schedule[schedule.length - 1];
  const projectedDebtFreeDate = lastEntry ? lastEntry.paycheckDate : format(new Date(), 'yyyy-MM-dd');
  
  const monthsToPayoff = Math.max(1, differenceInMonths(
    new Date(projectedDebtFreeDate), 
    new Date(input.startDate)
  ));

  // Calculate interest saved vs minimum payments only
  const minimumOnlySchedule = computeMinimumOnlySchedule(input);
  const minimumOnlyInterest = minimumOnlySchedule.reduce((sum, entry) => 
    sum + Object.values(entry.interestPaid).reduce((a, b) => a + b, 0), 0
  );
  
  const interestSavedVsMinimumsOnly = Math.max(0, minimumOnlyInterest - totalInterestPaid);

  return {
    projectedDebtFreeDate,
    interestSavedVsMinimumsOnly,
    totalInterestPaid,
    monthsToPayoff,
    totalDebtAmount,
  };
}

function computeMinimumOnlySchedule(input: PlanInput): ScheduleEntry[] {
  const minimumOnlyInput: PlanInput = {
    ...input,
    paycheckAmount: input.debts.reduce((sum, debt) => 
      sum + (debt.minPayment * getPaycheckFrequencyFactor(input.payFrequency)), 0
    ),
  };
  
  return computeFullSchedule(minimumOnlyInput);
}