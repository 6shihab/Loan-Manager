import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, CheckCircle2, X, Copy, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Transaction } from '../types';
import { shareReceiptImage } from '../utils/shareReceipt';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const verb = tx.type === 'borrowed' ? 'paid' : 'received';
  const todayStr = new Date().toLocaleDateString();
  const fallbackText =
    `Settlement Receipt\n\nI ${verb} ${tx.currency} ${amount.toFixed(2)} regarding the account of ${tx.person}.\n` +
    `Status: ${isFull ? 'Fully Settled' : 'Partially Settled'}\nDate: ${todayStr}\n\nTracked via Borrow Manager`;

  const handleShare = async () => {
    if (!cardRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const safePerson = tx.person.replace(/[^a-z0-9_-]+/gi, '_').slice(0, 40) || 'receipt';
      const datePart = new Date().toISOString().slice(0, 10);
      const filename = `receipt-${safePerson}-${datePart}.png`;
      const outcome = await shareReceiptImage(cardRef.current, filename, fallbackText);
      if (outcome === 'downloaded') {
        toast('Receipt saved — attach it to your chat', { icon: '📥' });
      } else if (outcome === 'shared-text') {
        toast('Shared as text (image share unavailable)', { icon: '📝' });
      }
    } catch (err) {
      console.error('Receipt capture failed', err);
      toast.error('Image capture failed — sending text receipt');
      try {
        if (typeof navigator.share === 'function') {
          await navigator.share({ text: fallbackText });
        } else {
          await navigator.clipboard.writeText(fallbackText);
          toast('Receipt copied to clipboard', { icon: '📋' });
        }
      } catch {
        // swallow — user closed the sheet
      }
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        ref={cardRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden relative"
      >
        <button
          onClick={onClose}
          style={{ visibility: isCapturing ? 'hidden' : 'visible' }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-full transition-colors z-10"
          aria-label="Close"
        >
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
            <span className="text-gray-500 dark:text-gray-400">Opened</span>
            <span className="font-bold text-gray-900 dark:text-white">{new Date(tx.date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Settled</span>
            <span className="font-bold text-gray-900 dark:text-white">{todayStr}</span>
          </div>

          <button
            onClick={handleShare}
            disabled={isCapturing}
            className="w-full mt-6 py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.99] transition-transform shadow-lg disabled:opacity-70 disabled:cursor-wait"
          >
            {isCapturing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Preparing receipt…
              </>
            ) : (
              <>
                {typeof navigator.share === 'function' ? <Share2 size={18} /> : <Copy size={18} />}
                {typeof navigator.share === 'function' ? 'Share Receipt' : 'Copy Receipt'}
              </>
            )}
          </button>

          <p className="text-[10px] text-center uppercase tracking-widest text-gray-400 dark:text-gray-600 font-bold pt-2">
            Borrow Manager
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
