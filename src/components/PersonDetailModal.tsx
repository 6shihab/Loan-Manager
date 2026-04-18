import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Transaction } from '../types';
import { TransactionList } from './TransactionList';
import { useLanguage } from '../contexts/LanguageContext';

interface PersonDetailModalProps {
  person: string;
  transactions: Transaction[];
  onClose: () => void;
  onSettleAll: (person: string) => void;
  onDelete: (id: string) => void;
  onShareSettled?: (tx: Transaction) => void;
}

export function PersonDetailModal({ person, transactions, onClose, onSettleAll, onDelete, onShareSettled }: PersonDetailModalProps) {
  const { t } = useLanguage();
  
  const net = transactions.reduce((acc, tx) => {
    if (tx.status === 'settled') return acc;
    return acc + (tx.type === 'lent' ? tx.amount : -tx.amount);
  }, 0);

  const activeTransactions = transactions.filter(tx => tx.status !== 'settled');
  
  // Gets currency from first transaction, fallback to local storage
  const currency = transactions.length > 0 ? transactions[0].currency : (localStorage.getItem('bm_defaultCurrency') || 'BDT');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-lg h-[85vh] sm:h-[80vh] flex flex-col glass-panel rounded-t-3xl sm:rounded-3xl shadow-2xl relative overflow-hidden bg-white/95 dark:bg-gray-900/95"
      >
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto my-3 sm:hidden shrink-0"></div>
        <div className="absolute top-0 left-0 w-full h-1.5 primary-gradient hidden sm:block shrink-0"></div>
        
        <div className="px-6 pb-4 pt-2 sm:pt-6 flex justify-between items-start shrink-0 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white truncate max-w-[250px]">{person}</h2>
            <div className={`text-xl font-bold mt-1 ${net === 0 ? 'text-gray-500' : net > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {net > 0 ? '+' : ''}{net.toFixed(2)} {currency}
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-2">
                {net > 0 ? t('owesYou') : net < 0 ? t('youOwe') : t('settled')}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
          <TransactionList
            transactions={transactions}
            onDelete={onDelete}
            onShare={onShareSettled}
          />
        </div>

        {activeTransactions.length > 0 && (
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-t border-gray-100 dark:border-gray-700 shrink-0">
            <button 
              onClick={() => onSettleAll(person)}
              className="w-full flex items-center justify-center p-4 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-bold rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-500/30 transition-colors"
            >
              🎉 Settle All Active Debts
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
