import { useMemo, useState } from 'react';
import { Transaction } from '../types';
import { SummaryCard } from './SummaryCard';
import { PersonSummaryList } from './PersonSummaryList';
import { TransactionList } from './TransactionList';
import { BorrowLendPieChart } from './BorrowLendPieChart';
import { PersonDetailModal } from './PersonDetailModal';
import { calculateSummary, calculatePersonBalances } from '../utils/calculations';
import { useLanguage } from '../contexts/LanguageContext';
import { AnimatePresence } from 'framer-motion';

interface DashboardProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onSettle: (id: string, amount?: number, attachmentId?: string) => void;
  onInitiateSettle: (tx: Transaction) => void;
}

export function Dashboard({ transactions, onDelete, onSettle, onInitiateSettle }: DashboardProps) {
  const { t } = useLanguage();
  const summary = useMemo(() => calculateSummary(transactions), [transactions]);
  const personBalances = useMemo(() => calculatePersonBalances(transactions), [transactions]);
  
  const [filterType, setFilterType] = useState<'all' | 'borrowed' | 'lent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const handleSettleAll = (personName: string) => {
    const active = transactions.filter(t => t.person === personName && t.status !== 'settled');
    active.forEach(t => onSettle(t.id));
  };

  const selectedPersonTransactions = useMemo(() => {
    if (!selectedPerson) return [];
    return transactions
      .filter(t => t.person === selectedPerson)
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedPerson]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (searchQuery && !t.person.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <SummaryCard summary={summary} />
      </section>

      {(summary.totalBorrowed > 0 || summary.totalLent > 0) && (
        <section>
          <BorrowLendPieChart summary={summary} transactions={transactions} />
        </section>
      )}

      {personBalances.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100 px-1">{t('balancesByPerson')}</h2>
          <PersonSummaryList balances={personBalances} onClickPerson={setSelectedPerson} />
        </section>
      )}

      <section>
        <div className="flex flex-col mb-4 space-y-3 px-1">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('recentTransactions')}</h2>
          
          <div className="flex flex-wrap gap-2">
            <input 
              type="text" 
              placeholder={t('searchPerson')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm"
            />
          </div>
          <div className="flex space-x-2">
            {(['all', 'borrowed', 'lent'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`py-1.5 px-4 rounded-full text-xs font-semibold capitalize transition-all shadow-sm ${
                  filterType === type 
                    ? 'bg-indigo-600 text-white dark:bg-fuchsia-600' 
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700'
                }`}
              >
                {type === 'all' ? t('all') : type === 'borrowed' ? t('filterBorrowed') : t('filterLent')}
              </button>
            ))}
          </div>
        </div>

        <TransactionList 
          transactions={filteredTransactions} 
          onDelete={onDelete} 
          onInitiateSettle={onInitiateSettle} 
        />
      </section>

      <AnimatePresence>
        {selectedPerson && (
          <PersonDetailModal
            person={selectedPerson}
            transactions={selectedPersonTransactions}
            onClose={() => setSelectedPerson(null)}
            onSettleAll={handleSettleAll}
            onDelete={onDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
