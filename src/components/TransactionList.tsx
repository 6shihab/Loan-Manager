import { useState } from 'react';
import { Transaction } from '../types';
import { Trash2, AlertCircle, CheckCircle2, ArrowUpRight, ArrowDownLeft, ArchiveX, Paperclip, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { AttachmentViewer, AttachmentEntry } from './AttachmentViewer';

import { getActiveAmount } from '../utils/calculations';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onInitiateSettle?: (tx: Transaction) => void;
  onShare?: (tx: Transaction) => void;
}

function collectAttachments(tx: Transaction): AttachmentEntry[] {
  const entries: AttachmentEntry[] = [];
  if (tx.attachmentId) {
    entries.push({ id: tx.attachmentId, label: 'Original transaction' });
  }
  tx.settlements?.forEach((s, idx) => {
    if (s.attachmentId) {
      const when = new Date(s.date).toLocaleDateString();
      entries.push({
        id: s.attachmentId,
        label: `Settlement #${idx + 1} · ${when} · ${s.amount.toFixed(2)} ${tx.currency}`,
      });
    }
  });
  return entries;
}

export function TransactionList({ transactions, onDelete, onInitiateSettle, onShare }: TransactionListProps) {
  const { t } = useLanguage();
  const [viewing, setViewing] = useState<AttachmentEntry[] | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="mx-auto w-32 h-32 mb-6 relative">
          <div className="absolute inset-0 bg-indigo-100 dark:bg-fuchsia-900/20 rounded-full animate-ping opacity-20"></div>
          <div className="w-full h-full bg-indigo-50 dark:bg-gray-800 rounded-full flex items-center justify-center relative shadow-inner">
            <ArchiveX size={48} className="text-indigo-300 dark:text-fuchsia-400 opacity-80" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">{t('noTransactions')}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">{t('addRecordPrompt')}</p>
      </div>
    );
  }

  return (
    <>
    <ul className="space-y-3 pb-6">
      {transactions.map((tx) => {
        const isBorrowed = tx.type === 'borrowed';
        const isSettled = tx.status === 'settled';
        const entries = collectAttachments(tx);

        return (
          <li key={tx.id} className={`relative group rounded-3xl overflow-hidden w-full touch-pan-y ${isSettled ? 'opacity-60' : ''}`}>
            {/* Background actions revealed on swipe */}
            <div className="absolute inset-0 flex justify-between items-center px-6 bg-gray-100 dark:bg-gray-800 rounded-3xl z-0">
              <div className="flex-1 flex justify-start items-center text-emerald-500 font-bold">
                {tx.status !== 'settled' && onInitiateSettle && <CheckCircle2 size={28} />}
              </div>
              <div className="flex-1 flex justify-end items-center text-rose-500 font-bold">
                <Trash2 size={28} />
              </div>
            </div>

            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e, info) => {
                if (info.offset.x > 100 && tx.status !== 'settled' && onInitiateSettle) {
                  onInitiateSettle(tx);
                } else if (info.offset.x < -100) {
                  onDelete(tx.id);
                }
              }}
              className={`relative z-10 border p-4 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg transition-shadow flex items-center justify-between ${
                isSettled
                  ? 'bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-800'
                  : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
              }`}
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className={`p-3 rounded-2xl flex-shrink-0 ${
                  isSettled
                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                    : isBorrowed
                      ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400'
                      : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400'
                }`}>
                  {isBorrowed ? <ArrowDownLeft size={20} className="stroke-[3]" /> : <ArrowUpRight size={20} className="stroke-[3]" />}
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${isSettled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>{tx.person}</span>
                    <span className={`font-extrabold ${
                      isSettled
                        ? 'line-through text-gray-400 dark:text-gray-500'
                        : isBorrowed
                          ? 'text-rose-500 dark:text-rose-400'
                          : 'text-emerald-500 dark:text-emerald-400'
                    }`}>
                      {isBorrowed ? '-' : '+'}{tx.amount.toFixed(2)} {tx.currency}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <div className="flex items-center gap-3">
                      <span>{new Date(tx.date).toLocaleDateString()}</span>
                      {tx.status === 'settled' ? (
                        <span className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 size={12} /> {t('settledBadge')}
                        </span>
                      ) : tx.status === 'partial' ? (
                        <span className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                          Active: {getActiveAmount(tx).toFixed(1)} {tx.currency}
                        </span>
                      ) : tx.dueDate && new Date(tx.dueDate) < new Date() && (
                        <span className="flex items-center gap-1 text-red-500 dark:text-red-400 font-bold bg-red-50 dark:bg-rose-500/10 px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
                          <AlertCircle size={12} /> {t('overdue')}
                        </span>
                      )}
                    </div>
                    {tx.note && <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1 italic">{tx.note}</span>}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {entries.length > 0 && (
                        <button
                          type="button"
                          onPointerDownCapture={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewing(entries);
                          }}
                          className="self-start flex items-center gap-1 text-xs text-indigo-500 dark:text-fuchsia-400 font-semibold hover:text-indigo-700 dark:hover:text-fuchsia-300 active:scale-95 transition"
                        >
                          <Paperclip size={12} /> View Attachment{entries.length > 1 ? `s (${entries.length})` : ''}
                        </button>
                      )}
                      {isSettled && onShare && (
                        <button
                          type="button"
                          aria-label="Share receipt"
                          onPointerDownCapture={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            onShare(tx);
                          }}
                          className="flex items-center gap-1 text-xs text-indigo-500 dark:text-fuchsia-400 font-semibold hover:text-indigo-700 dark:hover:text-fuchsia-300 active:scale-95 transition p-1.5 -m-1.5"
                        >
                          <Share2 size={14} /> Share receipt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </li>
        );
      })}
    </ul>
    {viewing && (
      <AttachmentViewer attachments={viewing} onClose={() => setViewing(null)} />
    )}
    </>
  );
}
