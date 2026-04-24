import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionStatus } from '../types';
import { deleteAttachment } from '../utils/storageDB';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('bm_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Backward compatibility mapping
        return parsed.map((t: any) => ({
          ...t,
          currency: t.currency || 'USD',
          status: t.status || 'pending',
          tags: t.tags || [],
        }));
      } catch (e) {
        console.error('Failed to parse transactions', e);
        return [];
      }
    }
    return [];
  });

  const [trashTransactions, setTrashTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('bm_trash_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse trash transactions', e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('bm_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('bm_trash_transactions', JSON.stringify(trashTransactions));
  }, [trashTransactions]);

  // Auto-purge trash on mount (transactions older than 30 days)
  useEffect(() => {
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    
    setTrashTransactions(prev => {
      let changed = false;
      const remaining: Transaction[] = [];
      prev.forEach(tx => {
        if (tx.deletedAt && (now - tx.deletedAt > thirtyDaysMs)) {
           changed = true;
           if (tx.attachmentId) deleteAttachment(tx.attachmentId);
           tx.settlements?.forEach(s => {
             if (s.attachmentId) deleteAttachment(s.attachmentId);
           });
        } else {
           remaining.push(tx);
        }
      });
      return changed ? remaining : prev;
    });
  }, []);

  const addTransaction = (t: Omit<Transaction, 'id' | 'createdAt' | 'status'> & { status?: TransactionStatus }) => {
    const newTx: Transaction = {
      ...t,
      status: t.status || 'pending',
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => {
      const tx = prev.find(t => t.id === id);
      if (tx) {
        setTrashTransactions(curr => [{ ...tx, deletedAt: Date.now() }, ...curr]);
      }
      return prev.filter(t => t.id !== id);
    });
  };

  const hardDeleteTransaction = (id: string) => {
    setTrashTransactions(prev => {
      const tx = prev.find(t => t.id === id);
      if (tx) {
        if (tx.attachmentId) deleteAttachment(tx.attachmentId);
        tx.settlements?.forEach(s => {
          if (s.attachmentId) deleteAttachment(s.attachmentId);
        });
      }
      return prev.filter(t => t.id !== id);
    });
  };

  const restoreTransaction = (id: string) => {
    setTrashTransactions(prev => {
      const tx = prev.find(t => t.id === id);
      if (tx) {
        const restoredTx = { ...tx };
        delete restoredTx.deletedAt;
        setTransactions(curr => [restoredTx, ...curr]);
      }
      return prev.filter(t => t.id !== id);
    });
  };

  const editTransaction = (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const clearTransactions = () => {
    transactions.forEach(tx => {
      if (tx.attachmentId) deleteAttachment(tx.attachmentId);
      tx.settlements?.forEach(s => {
        if (s.attachmentId) deleteAttachment(s.attachmentId);
      });
    });
    setTransactions([]);
  };

  const reloadFromStorage = useCallback(() => {
    const saved = localStorage.getItem('bm_transactions');
    const trash = localStorage.getItem('bm_trash_transactions');
    setTransactions(saved ? JSON.parse(saved).map((t: any) => ({
      ...t,
      currency: t.currency || 'USD',
      status: t.status || 'pending',
      tags: t.tags || [],
    })) : []);
    setTrashTransactions(trash ? JSON.parse(trash) : []);
  }, []);

  return {
    transactions,
    trashTransactions,
    addTransaction,
    deleteTransaction,
    editTransaction,
    clearTransactions,
    restoreTransaction,
    hardDeleteTransaction,
    reloadFromStorage,
  };
}
