import { useState, useRef, useMemo, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, Paperclip, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { TransactionType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { saveAttachment } from '../utils/storageDB';

interface TransactionFormProps {
  onSubmit: (tx: { person: string; amount: number; currency: string; type: TransactionType; date: string; dueDate?: string; tags: string[]; note: string; attachmentId?: string }) => void;
  onCancel: () => void;
  existingNames: string[];
  defaultCurrency: string;
}

export function TransactionForm({ onSubmit, onCancel, existingNames, defaultCurrency }: TransactionFormProps) {
  const { t } = useLanguage();
  const [type, setType] = useState<TransactionType>('borrowed');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const personWrapperRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const nameSuggestions = useMemo(() => {
    const query = person.trim().toLowerCase();
    const unique = Array.from(new Set(existingNames.filter(Boolean)));
    if (!query) return unique.slice(0, 8);
    return unique
      .filter(n => n.toLowerCase().includes(query) && n.toLowerCase() !== query)
      .slice(0, 8);
  }, [person, existingNames]);

  useEffect(() => {
    if (!showSuggestions) return;
    const handleDocPointer = (e: PointerEvent) => {
      if (!personWrapperRef.current) return;
      if (!personWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('pointerdown', handleDocPointer);
    return () => document.removeEventListener('pointerdown', handleDocPointer);
  }, [showSuggestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person || !amount) return;

    let attachmentId;
    if (attachment) {
      attachmentId = crypto.randomUUID();
      await saveAttachment(attachmentId, attachment);
    }

    onSubmit({
      person,
      amount: parseFloat(amount),
      currency,
      type,
      date: new Date(date).toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      tags: [],
      note,
      attachmentId
    });
  };

  const handleQuickDate = (days: number) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    setDueDate(nextDate.toISOString().split('T')[0]);
  };

  return (
    <motion.div 
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="glass-panel p-4 sm:p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl relative overflow-hidden bg-white/90 dark:bg-gray-900/95"
    >
      <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-3 sm:hidden"></div>
      <div className="absolute top-0 left-0 w-full h-1.5 primary-gradient hidden sm:block"></div>
      <h2 className="text-lg sm:text-2xl font-extrabold mb-3 sm:mb-6 text-gray-900 dark:text-white">{t('addTransaction')}</h2>

      <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-5 relative z-10">

        {/* Type selector */}
        <div className="flex bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl p-1 sm:p-1.5 shadow-inner border border-gray-200/50 dark:border-gray-700/50">
          <button
            type="button"
            onClick={() => setType('borrowed')}
            className={`flex-1 flex items-center justify-center py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
              type === 'borrowed'
                ? 'bg-white dark:bg-gray-700 text-rose-500 shadow-sm border border-gray-200/50 dark:border-gray-600/50 scale-100'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 scale-95 hover:bg-white/20 dark:hover:bg-gray-700/20'
            }`}
          >
            <ArrowDownLeft size={18} className="mr-1.5 stroke-[3]" />
            {t('iBorrowed')}
          </button>
          <button
            type="button"
            onClick={() => setType('lent')}
            className={`flex-1 flex items-center justify-center py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
              type === 'lent'
                ? 'bg-white dark:bg-gray-700 text-emerald-500 shadow-sm border border-gray-200/50 dark:border-gray-600/50 scale-100'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 scale-95 hover:bg-white/20 dark:hover:bg-gray-700/20'
            }`}
          >
            <ArrowUpRight size={18} className="mr-1.5 stroke-[3]" />
            {t('iLent')}
          </button>
        </div>

        <div className="space-y-2.5 sm:space-y-5">
          <div className="space-y-1" ref={personWrapperRef}>
            <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">{t('personName')} *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={person}
                onChange={(e) => {
                  setPerson(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder={t('personPlaceholder')}
                className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-fuchsia-500 transition-colors focus:ring-1 focus:ring-indigo-500"
              />
              {showSuggestions && nameSuggestions.length > 0 && (
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overscroll-contain"
                >
                  {nameSuggestions.map(name => (
                    <li key={name}>
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          setPerson(name);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-fuchsia-500/10 active:bg-indigo-100 dark:active:bg-fuchsia-500/20 transition-colors"
                      >
                        {name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex gap-2 sm:gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">{t('amount')} *</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-colors"
              />
            </div>
            <div className="w-[38%] sm:w-1/3 space-y-1">
              <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">{t('currency')}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-2 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-fuchsia-500 transition-colors focus:ring-1 focus:ring-indigo-500"
              >
                <option value="BDT">BDT (৳)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="BRL">BRL (R$)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">{t('date')} *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-colors"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">{t('dueDate')}</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => handleQuickDate(1)} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition">Tomorrow</button>
            <button type="button" onClick={() => handleQuickDate(7)} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition">Next Week</button>
          </div>

          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">{t('note')}</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('notePlaceholder')}
              className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-fuchsia-500 transition-colors focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all focus:outline-none"
            >
              <Paperclip size={14} />
              {attachment ? 'Replace' : 'Attach Receipt'}
            </button>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept="image/*,.pdf"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            />
            {attachment && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700 min-w-0">
                <span className="truncate max-w-[100px]">{attachment.name}</span>
                <button type="button" onClick={() => setAttachment(null)} className="text-gray-400 hover:text-rose-500 focus:outline-none shrink-0">
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 sm:px-6 py-2.5 sm:py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('cancel')}
            </button>
          )}
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-bold text-sm sm:text-base py-2.5 sm:py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('saveTransaction')}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
