import { Download, Moon, Sun, Trash2, Lock, Fingerprint, ShieldCheck, Cloud, RefreshCw, LogOut } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { shareCSV } from '../utils/exportUtils';
import { Transaction } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { AppLanguage } from '../utils/translations';
import type { AuthUser } from '../hooks/useAuth';

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
  // Google Sync
  user: AuthUser | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  isSyncing: boolean;
  lastSynced: number;
  onSyncNow: () => Promise<void>;
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export function Settings({
  isDarkMode, setIsDarkMode, defaultCurrency, setDefaultCurrency,
  transactions, onClearData, isPinEnabled, biometricEnabled,
  biometricAvailable, biometricLabel, onSetupPin, onRemovePin,
  onToggleBiometric, user, onSignIn, onSignOut, isSyncing, lastSynced, onSyncNow,
}: SettingsProps) {
  const { t, language, setLanguage } = useLanguage();

  const handleClearData = () => {
    if (confirm(t('clearDataConfirm'))) {
      onClearData();
    }
  };

  const handleSignIn = async () => {
    try {
      await onSignIn();
      toast.success(t('signInSuccess'));
    } catch {
      toast.error(t('signInFailed'));
    }
  };

  const handleSignOut = async () => {
    if (!confirm(t('signOutConfirm'))) return;
    await onSignOut();
  };

  const handleSyncNow = async () => {
    try {
      await onSyncNow();
      toast.success(t('syncSuccess'));
    } catch {
      toast.error(t('syncFailed'));
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-extrabold mb-6 text-gray-900 dark:text-white px-2">{t('settings')}</h2>

      <div className="space-y-4">
        {/* Google Sync */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cloud size={16} /> {t('syncWithGoogle')}
          </h3>

          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="avatar"
                    className="w-10 h-10 rounded-full flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold flex-shrink-0">
                    {user.displayName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">{user.displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                  {t('syncNow')}
                </button>
                {lastSynced > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {t('lastSynced')}: {formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}
                  </span>
                )}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{t('signOut')}</span>
                  <LogOut size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <GoogleIcon />
              <div className="text-left">
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{t('signInWithGoogle')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('syncDescription')}</p>
              </div>
            </button>
          )}
        </div>

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
              onClick={async () => {
                try {
                  const outcome = await shareCSV(transactions);
                  if (outcome === 'downloaded') toast.success('CSV downloaded');
                } catch {
                  toast.error('Export failed. Please try again.');
                }
              }}
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
