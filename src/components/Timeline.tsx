import { Transaction } from '../types';
import { format } from 'date-fns';
import { CheckCircle2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TimelineProps {
  transactions: Transaction[];
}

export function Timeline({ transactions }: TimelineProps) {
  const { t } = useLanguage();
  // Sort all transactions by date descending (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
        <h3 className="text-gray-500 dark:text-gray-400 font-medium">{t('noTransactionsYet')}</h3>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-extrabold mb-6 text-gray-900 dark:text-white px-2">{t('transactionTimeline')}</h2>
      <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-4 md:ml-6 pb-24">
        {sortedTransactions.map((tx) => {
          const isBorrowed = tx.type === 'borrowed';
          
          return (
            <div key={tx.id} className="mb-8 ml-6 relative group">
              <span className={`absolute -left-[35px] flex items-center justify-center w-8 h-8 rounded-full ring-4 ring-white dark:ring-[#0f111a] ${tx.status === 'settled' ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' : isBorrowed ? 'bg-rose-100 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                {tx.status === 'settled' ? <CheckCircle2 size={16} /> : isBorrowed ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
              </span>
              
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{format(new Date(tx.date), 'MMM d, yyyy')}</p>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {tx.status === 'settled' ? (
                        <>{t('settledDebtWith')} <span className="text-gray-900 dark:text-gray-100 font-extrabold">{tx.person}</span></>
                      ) : isBorrowed ? (
                        <>{t('borrowedFrom')} <span className="text-gray-900 dark:text-gray-100 font-extrabold">{tx.person}</span></>
                      ) : (
                        <>{t('lentTo')} <span className="text-gray-900 dark:text-gray-100 font-extrabold">{tx.person}</span></>
                      )}
                    </h3>
                    {tx.note && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{tx.note}</p>}
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${tx.status === 'settled' ? 'text-gray-400 line-through' : isBorrowed ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                       {tx.currency === 'USD' ? '$' : tx.currency === 'EUR' ? '€' : tx.currency === 'GBP' ? '£' : tx.currency === 'INR' ? '₹' : tx.currency === 'BRL' ? 'R$' : tx.currency}{tx.amount.toFixed(2)}
                    </span>
                    {tx.dueDate && tx.status !== 'settled' && (
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">Due {format(new Date(tx.dueDate), 'MMM d')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
