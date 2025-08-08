import { Debt, PayFrequency } from '../types';

export function getPaycheckFrequencyFactor(frequency: PayFrequency): number {
  switch (frequency) {
    case 'weekly':
      return 12 / 52; // ~0.2308
    case 'biweekly':
      return 12 / 26; // ~0.4615
    case 'monthly':
      return 1;
    default:
      return 12 / 26;
  }
}

export function getNextPayday(startDate: string, frequency: PayFrequency): Date {
  const start = new Date(startDate);
  const now = new Date();
  
  if (start > now) {
    return start;
  }
  
  let daysToAdd: number;
  switch (frequency) {
    case 'weekly':
      daysToAdd = 7;
      break;
    case 'biweekly':
      daysToAdd = 14;
      break;
    case 'monthly':
      daysToAdd = 30; // Approximation
      break;
    default:
      daysToAdd = 14;
  }
  
  const nextPayday = new Date(start);
  while (nextPayday <= now) {
    nextPayday.setDate(nextPayday.getDate() + daysToAdd);
  }
  
  return nextPayday;
}

export function calculateMonthlyInterest(balance: number, apr: number): number {
  return balance * (apr / 12);
}

export function distributeMinimumsPerPaycheck(
  debts: Debt[],
  frequency: PayFrequency
): { [debtId: string]: number } {
  const factor = getPaycheckFrequencyFactor(frequency);
  const result: { [debtId: string]: number } = {};
  
  for (const debt of debts) {
    result[debt.id] = debt.minPayment * factor;
  }
  
  return result;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPercentage(decimal: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(decimal);
}