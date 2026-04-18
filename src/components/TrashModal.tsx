import { motion } from 'framer-motion';
import { X, Trash2, RotateCcw, ArchiveX } from 'lucide-react';
import { Transaction } from '../types';

interface TrashModalProps {
  transactions: Transaction[];
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
  onClose: () => void;
}

export function TrashModal({ transactions, onRestore, onHardDelete, onClose }: TrashModalProps) {
  const getDaysRemaining = (deletedAt?: number) => {
    if (!deletedAt) return 0;
    const daysPassed = Math.floor((Date.now() - deletedAt) / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysPassed);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-lg bg-white dark:bg-gray-900 backdrop-blur-xl p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 h-[85vh] sm:h-[80vh] flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Trash2 size={24} className="text-gray-900 dark:text-white" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">Recycle Bin</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm border-l-4 border-rose-500 pl-3 text-gray-600 dark:text-gray-400 mb-6 bg-rose-50 dark:bg-rose-900/10 py-2 rounded-r-lg">
          Items in the recycle bin are permanently deleted after 30 days.
        </p>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar list-none">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <ArchiveX size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Recycle bin is empty</p>
            </div>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} className="relative bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{tx.person}</span>
                    <span className={`font-bold ${tx.type === 'borrowed' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {tx.type === 'borrowed' ? '-' : '+'}{tx.amount.toFixed(2)} {tx.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-rose-500 dark:text-rose-400 font-semibold bg-rose-100 dark:bg-rose-900/30 px-2 py-0.5 rounded-md">
                      {getDaysRemaining(tx.deletedAt)} days left
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Deleted: {tx.deletedAt ? new Date(tx.deletedAt).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => onRestore(tx.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg text-sm transition-colors"
                  >
                    <RotateCcw size={16} /> Restore
                  </button>
                  <button 
                    onClick={() => onHardDelete(tx.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-semibold rounded-lg text-sm transition-colors"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
