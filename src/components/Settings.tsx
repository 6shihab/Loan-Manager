import { Download, Moon, Sun, Trash2, Lock, Fingerprint, ShieldCheck } from 'lucide-react';
import { downloadTransactionsCSV } from '../utils/exportUtils';
import { Transaction } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { AppLanguage } from '../utils/translations';

interface SettingsProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  defaultCurrency: string;
  setDefaultCurrency: (val: string) => void;
  transactions: Transaction[];
  onClearData: () => void;
  // Security
  isPinEnabled: boolean;
  biometricEnabled: boolean;
  biometricAvailable: boolean;
  biometricLabel: string;
  onSetupPin: () => void;
  onRemovePin: () => void;
  onToggleBiometric: (val: boolean) => void;
}

export function Settings({ isDarkMode, setIsDarkMode, defaultCurrency, setDefaultCurrency, transactions, onClearData, isPinEnabled, biometricEnabled, biometricAvailable, biometricLabel, onSetupPin, onRemovePin, onToggleBiometric }: SettingsProps) {
  const { t, language, setLanguage } = useLanguage();

  const handleClearData = () => {
    if (confirm(t('clearDataConfirm'))) {
      onClearData();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-extrabold mb-6 text-gray-900 dark:text-white px-2">{t('settings')}</h2>
      
      <div className="space-y-4">
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{t('preferences')}</h3>
          
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{t('darkTheme')}</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              >
                {isDarkMode ? <Moon size={12} className="m-[4px] text-indigo-600" /> : <Sun size={12} className="m-[4px] text-gray-400" />}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mb-4">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{t('defaultCurrency')}</span>
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-fuchsia-500"
            >
              <option value="BDT">BDT (৳)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="BRL">BRL (R$)</option>
            </select>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{t('language')}</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-fuchsia-500"
            >
              <option value="en">English (EN)</option>
              <option value="bn">বাংলা (BN)</option>
            </select>
          </div>
        </div>

        {/* Data Settings */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{t('dataManagement')}</h3>
          
          <div className="space-y-4">
            <button
              onClick={() => downloadTransactionsCSV(transactions)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-semibold text-gray-800 dark:text-gray-200">{t('exportCSV')}</span>
              <Download size={20} className="text-gray-500" />
            </button>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <button
                onClick={handleClearData}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors text-red-600 dark:text-rose-400"
              >
                <span className="font-semibold">{t('clearAllData')}</span>
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck size={16} /> Security
          </h3>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock size={18} className="text-gray-500" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">PIN Lock</span>
            </div>
            {isPinEnabled ? (
              <button
                onClick={() => {
                  if (confirm('Remove PIN lock? Your data will no longer be protected.')) {
                    onRemovePin();
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
              >
                Remove PIN
              </button>
            ) : (
              <button
                onClick={onSetupPin}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
              >
                Set Up PIN
              </button>
            )}
          </div>

          {isPinEnabled && biometricAvailable && (
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="flex items-center gap-2">
                <Fingerprint size={18} className="text-gray-500" />
                <span className="font-semibold text-gray-800 dark:text-gray-200">{biometricLabel}</span>
              </div>
              <button
                onClick={() => onToggleBiometric(!biometricEnabled)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  biometricEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {!isPinEnabled && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
              Enable PIN lock to protect your financial data. The app will lock when you switch away.
            </p>
          )}
        </div>
        
      </div>
    </div>
  );
}
