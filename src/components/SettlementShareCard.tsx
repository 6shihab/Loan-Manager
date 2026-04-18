import { motion } from 'framer-motion';
import { Share2, CheckCircle2, X, Copy } from 'lucide-react';
import { Transaction } from '../types';

interface SettlementShareCardProps {
  receipt: {
    tx: Transaction;
    amount: number;
    isFull: boolean;
  };
  onClose: () => void;
}

export function SettlementShareCard({ receipt, onClose }: SettlementShareCardProps) {
  const { tx, amount, isFull } = receipt;

  const handleShare = async () => {
    // If it was 'borrowed' (I borrowed from them), and I settle, I "paid" them.
    // If it was 'lent' (I lent to them), and I settle, I "received" from them.
    const verb = tx.type === 'borrowed' ? 'paid' : 'received';
    const text = `Settlement Receipt 🧾\n\nI ${verb} ${tx.currency} ${amount.toFixed(2)} regarding the account of ${tx.person}.\nStatus: ${isFull ? 'Fully Settled 🎉' : 'Partially Settled ✅'}\nDate: ${new Date().toLocaleDateString()}\n\nTracked via Borrow Manager`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Settlement Receipt',
          text: text,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Receipt copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-full transition-colors z-10">
          <X size={18} />
        </button>

        <div className="p-8 text-center bg-gradient-to-br from-indigo-50 to-fuchsia-50 dark:from-indigo-900/20 dark:to-fuchsia-900/20 border-b border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
            {tx.currency} {amount.toFixed(2)}
          </h2>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            {isFull ? 'Fully Settled' : 'Partially Settled'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Account</span>
            <span className="font-bold text-gray-900 dark:text-white">{tx.person}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Type</span>
            <span className="font-bold text-gray-900 dark:text-white capitalize">{tx.type}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Date</span>
            <span className="font-bold text-gray-900 dark:text-white">{new Date().toLocaleDateString()}</span>
          </div>
          
          <button 
            onClick={handleShare}
            className="w-full mt-6 py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg"
          >
            {typeof navigator.share === 'function' ? <Share2 size={18} /> : <Copy size={18} />}
            {typeof navigator.share === 'function' ? 'Share Receipt' : 'Copy Receipt'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
