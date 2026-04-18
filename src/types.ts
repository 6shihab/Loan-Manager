export type TransactionType = 'borrowed' | 'lent';
export type TransactionStatus = 'pending' | 'settled' | 'partial';

export interface SettlementRecord {
  id: string;
  amount: number;
  date: string; // ISO string
  attachmentId?: string; // ID for IndexedDB
}

export interface Transaction {
  id: string;
  person: string;
  amount: number;
  currency: string;
  type: TransactionType;
  date: string; // ISO string
  dueDate?: string; // Optional due date ISO string
  tags: string[];
  note?: string;
  status: TransactionStatus;
  createdAt: number;
  
  // New features
  settlements?: SettlementRecord[];
  attachmentId?: string; // Original transaction attachment
  deletedAt?: number; // Timestamp for trash retention
}

export interface BalanceSummary {
  totalBorrowed: number;
  totalLent: number;
  netBalance: number;
}

export interface PersonBalance {
  person: string;
  borrowed: number;
  lent: number;
  net: number; // positive if they owe me (lent > borrowed), negative if I owe them
}
