export type Debt = {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
  dueDay?: number;
  type?: 'credit_card' | 'loan' | 'mortgage' | 'other';
};

export type PayFrequency = 'weekly' | 'biweekly' | 'monthly';
export type Strategy = 'AVALANCHE' | 'SNOWBALL' | 'CUSTOM';

export type PlanInput = {
  debts: Debt[];
  strategy: Strategy;
  customPriority?: string[];
  paycheckAmount: number;
  payFrequency: PayFrequency;
  startDate: string;
};

export type PaymentAllocation = {
  debtId: string;
  amount: number;
};

export type NextMove = {
  date: string;
  payments: PaymentAllocation[];
  headline: string;
  rationale: Strategy;
  projectedDebtFreeDate: string;
  interestSavedVsMinimumsOnly: number;
  totalInterestPaid: number;
  monthsToPayoff: number;
};

export type ScheduleEntry = {
  paycheckDate: string;
  allocation: PaymentAllocation[];
  total: number;
  remainingBalances: { [debtId: string]: number };
  interestPaid: { [debtId: string]: number };
};

export type PlanSummary = {
  projectedDebtFreeDate: string;
  interestSavedVsMinimumsOnly: number;
  totalInterestPaid: number;
  monthsToPayoff: number;
  totalDebtAmount: number;
};