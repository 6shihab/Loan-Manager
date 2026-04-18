import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Paperclip } from 'lucide-react';
import { Transaction } from '../types';
import { getActiveAmount } from '../utils/calculations';
import { saveAttachment } from '../utils/storageDB';

interface SettleModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSubmit: (amount: number, attachmentId?: string) => Promise<void>;
}

export function SettleModal({ transaction, onClose, onSubmit }: SettleModalProps) {
  const maxAmount = getActiveAmount(transaction);
  
  const [isPartial, setIsPartial] = useState(false);
  const [amountStr, setAmountStr] = useState(maxAmount.toString());
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    let amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) amount = maxAmount;
    if (amount > maxAmount) amount = maxAmount;

    let attachmentId;
    if (attachment) {
      attachmentId = crypto.randomUUID();
      await saveAttachment(attachmentId, attachment);
    }

    await onSubmit(amount, attachmentId);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settle Debt</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Outstanding Balance</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {transaction.currency} {maxAmount.toFixed(2)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-2">
            <button
              type="button"
              onClick={() => { setIsPartial(false); setAmountStr(maxAmount.toString()); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${!isPartial ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
            >
              Full Amount
            </button>
            <button
              type="button"
              onClick={() => setIsPartial(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${isPartial ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
            >
              Partial
            </button>
          </div>

          {isPartial && (
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Settlement Amount</label>
              <input
                type="number"
                min="0.01"
                max={maxAmount}
                step="0.01"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                autoFocus
                className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-indigo-500 transition-colors focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Attachment (Receipt / Photo)</label>
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 hover:border-indigo-400 transition-all w-full justify-center bg-gray-50 dark:bg-gray-800/50"
              >
                <Paperclip size={18} />
                {attachment ? 'Replace File' : 'Attach File'}
              </button>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept="image/*,.pdf" 
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              />
            </div>
            {attachment && (
              <div className="flex items-center justify-between px-4 py-2 mt-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-sm font-medium text-indigo-700 dark:text-indigo-300">
                <span className="truncate">{attachment.name}</span>
                <button type="button" onClick={() => setAttachment(null)} className="hover:text-rose-500">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
          >
            {isLoading ? 'Saving...' : 'Confirm Settlement'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
