import { Debt, Strategy } from '../types';

export function sortDebtsByStrategy(
  debts: Debt[],
  strategy: Strategy,
  customPriority?: string[]
): Debt[] {
  switch (strategy) {
    case 'AVALANCHE':
      return [...debts].sort((a, b) => b.apr - a.apr);
    
    case 'SNOWBALL':
      return [...debts].sort((a, b) => a.balance - b.balance);
    
    case 'CUSTOM':
      if (!customPriority) {
        return debts;
      }
      return [...debts].sort((a, b) => {
        const indexA = customPriority.indexOf(a.id);
        const indexB = customPriority.indexOf(b.id);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    
    default:
      return debts;
  }
}

export function chooseTargetDebt(
  debts: Debt[],
  strategy: Strategy,
  customPriority?: string[]
): Debt | null {
  const sortedDebts = sortDebtsByStrategy(debts, strategy, customPriority);
  const activeDebts = sortedDebts.filter(d => d.balance > 0);
  
  return activeDebts.length > 0 ? activeDebts[0] : null;
}

export function getStrategyLabel(strategy: Strategy): string {
  switch (strategy) {
    case 'AVALANCHE':
      return 'Highest Interest First';
    case 'SNOWBALL':
      return 'Smallest Balance First';
    case 'CUSTOM':
      return 'Custom Priority';
    default:
      return strategy;
  }
}

export function getStrategyDescription(strategy: Strategy): string {
  switch (strategy) {
    case 'AVALANCHE':
      return 'Pay minimums on all debts, then attack the highest APR debt with all extra funds to minimize total interest paid.';
    case 'SNOWBALL':
      return 'Pay minimums on all debts, then attack the smallest balance debt first for psychological wins and momentum.';
    case 'CUSTOM':
      return 'Pay debts in your custom order based on your personal priorities and circumstances.';
    default:
      return 'Choose your debt payoff strategy.';
  }
}