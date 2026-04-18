import { Transaction, BalanceSummary, PersonBalance } from '../types';

export function getActiveAmount(tx: Transaction): number {
  if (tx.status === 'settled') return 0;
  const settledSum = tx.settlements?.reduce((sum, s) => sum + s.amount, 0) || 0;
  return Math.max(0, tx.amount - settledSum);
}

export function calculateSummary(transactions: Transaction[]): BalanceSummary {
  let totalBorrowed = 0;
  let totalLent = 0;

  transactions.forEach(t => {
    if (t.status === 'settled') return;
    const activeAmount = getActiveAmount(t);
    if (activeAmount === 0) return;

    if (t.type === 'borrowed') {
      totalBorrowed += activeAmount;
    } else {
      totalLent += activeAmount;
    }
  });

  return {
    totalBorrowed,
    totalLent,
    netBalance: totalLent - totalBorrowed
  };
}

export function calculatePersonBalances(transactions: Transaction[]): PersonBalance[] {
  const personMap = new Map<string, PersonBalance>();

  transactions.forEach(t => {
    if (t.status === 'settled') return;
    
    // Normalize person name to uppercase or lowercase to avoid duplicates if possible, or just keep as case-sensitive
    const name = t.person.trim();
    if (!personMap.has(name)) {
      personMap.set(name, { person: name, borrowed: 0, lent: 0, net: 0 });
    }
    
    const activeAmount = getActiveAmount(t);
    if (activeAmount === 0) return;

    const balance = personMap.get(name)!;
    if (t.type === 'borrowed') {
      balance.borrowed += activeAmount;
      balance.net -= activeAmount;
    } else {
      balance.lent += activeAmount;
      balance.net += activeAmount;
    }
  });

  return Array.from(personMap.values()).sort((a, b) => b.net - a.net); // Highest owe me first
}
