import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, X, Copy, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { PersonBalance } from '../types';
import { shareReceiptImage } from '../utils/shareReceipt';
import { useLanguage } from '../contexts/LanguageContext';

interface PersonBalanceShareCardProps {
  balance: PersonBalance;
  currency: string;
  onClose: () => void;
}

export function PersonBalanceShareCard({ balance, currency, onClose }: PersonBalanceShareCardProps) {
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const absNet = Math.abs(balance.net).toFixed(2);
  const owesMe = balance.net > 0;

  const sym =
    currency === 'BDT' ? '৳' :
    currency === 'USD' ? '$' :
    currency === 'EUR' ? '€' :
    currency === 'GBP' ? '£' :
    currency === 'INR' ? '₹' : 'R$';

  const fallbackText =
    `${owesMe ? t('shareCardTitleOweMe') : t('shareCardTitleIOwe')}\n\n` +
    `${t('shareCardName')}: ${balance.person}\n` +
    `${owesMe ? t('shareCardOweMeText') : t('shareCardIOweText')}: ${sym}${absNet}\n\n` +
    `${owesMe ? t('shareCardNoteOweMe') : t('shareCardNoteIOwe')}\n\n` +
    `${t('shareCardFooter')}`;

  const handleShare = async () => {
    if (!cardRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const safePerson = balance.person.replace(/[^a-z0-9_-]+/gi, '_').slice(0, 40) || 'balance';
      const datePart = new Date().toISOString().slice(0, 10);
      const filename = `balance-${safePerson}-${datePart}.png`;
      const outcome = await shareReceiptImage(cardRef.current, filename, fallbackText);
      if (outcome === 'downloaded') {
        toast('Balance card saved — attach it to your chat', { icon: '📥' });
      } else if (outcome === 'shared-text') {
        toast('Shared as text (image share unavailable)', { icon: '📝' });
      }
    } catch (err) {
      console.error('Balance card capture failed', err);
      toast.error('Image capture failed — sending text');
      try {
        if (typeof navigator.share === 'function') {
          await navigator.share({ text: fallbackText });
        } else {
          await navigator.clipboard.writeText(fallbackText);
          toast('Copied to clipboard', { icon: '📋' });
        }
      } catch {
        // user dismissed
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
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm shadow-2xl rounded-3xl overflow-hidden"
      >
        {/* Only this inner div is captured as the image — no button inside */}
        <div ref={cardRef} className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden relative">
          <button
            onClick={onClose}
            style={{ visibility: isCapturing ? 'hidden' : 'visible' }}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-full transition-colors z-10"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className={`p-8 text-center border-b border-gray-100 dark:border-gray-800 ${
            owesMe
              ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
              : 'bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              owesMe
                ? 'bg-emerald-100 dark:bg-emerald-500/20'
                : 'bg-rose-100 dark:bg-rose-500/20'
            }`}>
              {owesMe
                ? <TrendingUp size={32} className="text-emerald-500" />
                : <TrendingDown size={32} className="text-rose-500" />
              }
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
              {sym}{absNet}
            </h2>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {owesMe ? t('shareCardTitleOweMe') : t('shareCardTitleIOwe')}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('shareCardName')}</span>
              <span className="font-bold text-gray-900 dark:text-white">{balance.person}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">{owesMe ? t('shareCardOweMeText') : t('shareCardIOweText')}</span>
              <span className={`font-bold ${owesMe ? 'text-emerald-500' : 'text-rose-500'}`}>
                {sym}{absNet}
              </span>
            </div>
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 italic pt-1">
              {owesMe ? t('shareCardNoteOweMe') : t('shareCardNoteIOwe')}
            </p>
            <p className="text-[10px] text-center uppercase tracking-widest text-gray-400 dark:text-gray-600 font-bold pt-2">
              {t('shareCardFooter')}
            </p>
          </div>
        </div>

        {/* Share button is outside cardRef — never included in the captured image */}
        <div className="bg-white dark:bg-gray-900 px-6 pb-6 pt-3">
          <button
            onClick={handleShare}
            disabled={isCapturing}
            className="w-full py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.99] transition-transform shadow-lg disabled:opacity-70 disabled:cursor-wait"
          >
            {isCapturing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {t('sharePreparing')}
              </>
            ) : (
              <>
                {typeof navigator.share === 'function' ? <Share2 size={18} /> : <Copy size={18} />}
                {typeof navigator.share === 'function' ? t('shareAction') : t('copyAction')}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
