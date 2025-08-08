import { z } from 'zod';

export const debtSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Debt name is required'),
  balance: z.number().min(0.01, 'Balance must be greater than 0'),
  apr: z.number().min(0).max(1, 'APR must be between 0 and 100%'),
  minPayment: z.number().min(0, 'Minimum payment cannot be negative'),
  dueDay: z.number().min(1).max(31).optional(),
  type: z.enum(['credit_card', 'loan', 'mortgage', 'other']).optional(),
});

export const planInputSchema = z.object({
  debts: z.array(debtSchema).min(1, 'At least one debt is required'),
  strategy: z.enum(['AVALANCHE', 'SNOWBALL', 'CUSTOM']),
  customPriority: z.array(z.string()).optional(),
  paycheckAmount: z.number().min(0.01, 'Paycheck amount must be greater than 0'),
  payFrequency: z.enum(['weekly', 'biweekly', 'monthly']),
  startDate: z.string(),
});

export const addDebtSchema = z.object({
  name: z.string().min(1, 'Debt name is required'),
  balance: z.number().min(0.01, 'Balance must be greater than 0'),
  apr: z.number().min(0).max(100, 'APR must be between 0 and 100'),
  minPayment: z.number().min(0, 'Minimum payment cannot be negative'),
  dueDay: z.number().min(1).max(31).optional(),
  type: z.enum(['credit_card', 'loan', 'mortgage', 'other']).default('credit_card'),
});