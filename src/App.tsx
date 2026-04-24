import { useState, useEffect } from 'react';
import { PlusCircle, LayoutDashboard, History, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { useTransactions } from './hooks/useTransactions';
import { useAppLock } from './hooks/useAppLock';
import { useAuth } from './hooks/useAuth';
import { useSync } from './hooks/useSync';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { Timeline } from './components/Timeline';
import { Settings } from './components/Settings';
import { SettleModal } from './components/SettleModal';
import { SettlementShareCard } from './components/SettlementShareCard';
import { TrashModal } from './components/TrashModal';
import { PinLockScreen } from './components/PinLockScreen';
import { useLanguage } from './contexts/LanguageContext';
import { Toaster, toast } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { getActiveAmount } from './utils/calculations';
import { App as CapApp } from '@capacitor/app';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline' | 'settings'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [settlingTx, setSettlingTx] = useState<any>(null);
  const [sharedSettlement, setSharedSettlement] = useState<{ tx: any, amount: number, isFull: boolean } | null>(null);
  
  const {
    transactions,
    trashTransactions,
    addTransaction,
    deleteTransaction,
    editTransaction,
    clearTransactions,
    restoreTransaction,
    hardDeleteTransaction,
    reloadFromStorage,
  } = useTransactions();
  const appLock = useAppLock();
  const { user, signIn, signOut } = useAuth();
  const { isSyncing, lastSynced, syncNow } = useSync(user, reloadFromStorage);
  const { t } = useLanguage();
  const existingNames = Array.from(new Set(transactions.map(t => t.person)));
  
  const [defaultCurrency, setDefaultCurrency] = useState(() => {
    return localStorage.getItem('bm_defaultCurrency') || 'BDT';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('bm_defaultCurrency', defaultCurrency);
  }, [defaultCurrency]);

  // Android hardware back button handler
  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      // Close modals/overlays in priority order
      if (appLock.isSettingUp) {
        appLock.setIsSettingUp(false);
        return;
      }
      if (sharedSettlement) {
        setSharedSettlement(null);
        return;
      }
      if (settlingTx) {
        setSettlingTx(null);
        return;
      }
      if (isTrashModalOpen) {
        setIsTrashModalOpen(false);
        return;
      }
      if (isAddModalOpen) {
        setIsAddModalOpen(false);
        return;
      }
      // Navigate back to dashboard from other tabs
      if (activeTab !== 'dashboard') {
        setActiveTab('dashboard');
        return;
      }
      // Already on dashboard, no modals — minimize (don't exit)
      CapApp.minimizeApp();
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [activeTab, isAddModalOpen, isTrashModalOpen, settlingTx, sharedSettlement, appLock.isSettingUp]);

  const handleAddSubmit = (tx: any) => {
    addTransaction(tx);
    setIsAddModalOpen(false);
    toast.success('Transaction added successfully!', {
      style: {
        borderRadius: '16px',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#111827',
      },
    });
  };

  const handleSettle = (id: string, amount?: number, attachmentId?: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    const maxAmount = getActiveAmount(tx);
    const settleAmt = amount !== undefined ? amount : maxAmount;
    
    const newSettlement = {
      id: crypto.randomUUID(),
      amount: settleAmt,
      date: new Date().toISOString(),
      attachmentId
    };

    const newSettlements = [...(tx.settlements || []), newSettlement];
    const newActiveAmount = Math.max(0, tx.amount - newSettlements.reduce((sum, s) => sum + s.amount, 0));

    editTransaction(id, { 
      settlements: newSettlements,
      status: newActiveAmount === 0 ? 'settled' : 'partial'
    });

    toast.success(newActiveAmount === 0 ? 'Debt fully settled!' : 'Partial settlement applied!', {
      icon: newActiveAmount === 0 ? '🎉' : '✅',
      style: {
        borderRadius: '16px',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#111827',
      },
      duration: 2000,
    });

    // Show sharing card shortly after setting
    setTimeout(() => {
      setSharedSettlement({
        tx: { ...tx, settlements: newSettlements, status: newActiveAmount === 0 ? 'settled' : 'partial' },
        amount: settleAmt,
        isFull: newActiveAmount === 0
      });
    }, 500);
  };

  const handleShareSettled = (tx: any) => {
    const totalSettled = tx.settlements?.reduce((sum: number, s: { amount: number }) => sum + s.amount, 0) ?? tx.amount;
    setSharedSettlement({
      tx,
      amount: totalSettled,
      isFull: tx.status === 'settled',
    });
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast('Transaction deleted', {
      icon: '🗑️',
      style: {
        borderRadius: '16px',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#111827',
      },
    });
  };

  return (
    <div className="min-h-screen pb-20 relative">
      <Toaster position="top-center" />
      {/* Header */}
      <header className="sticky top-0 z-10 glass-panel px-4 py-4 flex justify-between items-center rounded-b-2xl mb-6">
        <h1 className="text-2xl font-extrabold text-gradient">
          {t('appTitle')}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsTrashModalOpen(true)}
            className="p-2 rounded-full transition-colors shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 relative"
            title="Recycle Bin"
          >
            <Trash2 size={20} className="transition-transform duration-300" />
            {trashTransactions && trashTransactions.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-full transition-colors shadow-sm ${activeTab === 'settings' ? 'bg-indigo-100 text-indigo-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            title="Settings"
          >
            <SettingsIcon size={20} className={activeTab === 'settings' ? 'rotate-90 transition-transform duration-300' : 'transition-transform duration-300'} />
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="px-4 max-w-lg mx-auto">
        {activeTab === 'dashboard' ? (
          <Dashboard
            transactions={transactions}
            onDelete={handleDelete}
            onSettle={handleSettle}
            onInitiateSettle={setSettlingTx}
            onShareSettled={handleShareSettled}
          />
        ) : activeTab === 'timeline' ? (
          <Timeline transactions={transactions} />
        ) : (
          <Settings
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            defaultCurrency={defaultCurrency}
            setDefaultCurrency={setDefaultCurrency}
            transactions={transactions}
            onClearData={clearTransactions}
            isPinEnabled={appLock.isPinEnabled}
            biometricEnabled={appLock.biometricEnabled}
            biometricAvailable={appLock.biometricAvailable}
            biometricLabel={appLock.biometricLabel}
            onSetupPin={() => appLock.setIsSettingUp(true)}
            onRemovePin={appLock.removePin}
            onToggleBiometric={appLock.toggleBiometric}
            user={user}
            onSignIn={signIn}
            onSignOut={signOut}
            isSyncing={isSyncing}
            lastSynced={lastSynced}
            onSyncNow={syncNow}
          />
        )}
      </main>

      <AnimatePresence>
        {isAddModalOpen && (
          <div key="add-modal" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-lg max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden">
              <TransactionForm
                onSubmit={handleAddSubmit}
                onCancel={() => setIsAddModalOpen(false)}
                existingNames={existingNames}
                defaultCurrency={defaultCurrency}
              />
            </div>
          </div>
        )}

        {settlingTx && (
          <SettleModal
            key="settle-modal"
            transaction={settlingTx}
            onClose={() => setSettlingTx(null)}
            onSubmit={async (amount, attachmentId) => {
              handleSettle(settlingTx.id, amount, attachmentId);
              setSettlingTx(null);
            }}
          />
        )}

        {sharedSettlement && (
          <SettlementShareCard
            key="share-card"
            receipt={sharedSettlement}
            onClose={() => setSharedSettlement(null)}
          />
        )}

        {isTrashModalOpen && (
          <TrashModal
            key="trash-modal"
            transactions={trashTransactions}
            onClose={() => setIsTrashModalOpen(false)}
            onRestore={id => {
              restoreTransaction(id);
              toast.success('Transaction restored');
            }}
            onHardDelete={id => {
              hardDeleteTransaction(id);
              toast('Deleted permanently', { icon: '🗑️' });
            }}
          />
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full glass-panel flex justify-around py-3 px-4 rounded-t-3xl border-b-0 max-w-md left-1/2 -translate-x-1/2 z-20">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'text-indigo-600 dark:text-fuchsia-400' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <LayoutDashboard size={24} className={activeTab === 'dashboard' ? 'scale-110 transition-transform' : ''} />
          <span className="text-xs font-semibold mt-1">{t('dashboard')}</span>
        </button>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex flex-col items-center -mt-6 p-4 rounded-full primary-gradient shadow-lg shadow-indigo-500/40 hover:scale-110 transition-transform"
        >
          <PlusCircle size={28} className="text-white" />
        </button>

        <button 
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'timeline' ? 'text-indigo-600 dark:text-fuchsia-400' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <History size={24} className={activeTab === 'timeline' ? 'scale-110 transition-transform' : ''} />
          <span className="text-xs font-semibold mt-1">{t('timeline')}</span>
        </button>
      </nav>

      {/* PIN Lock Screen Overlay */}
      <AnimatePresence>
        {appLock.isLocked && appLock.isPinEnabled && (
          <PinLockScreen
            mode="unlock"
            storedPinHash={appLock.pinHash || ''}
            onUnlock={appLock.unlock}
            biometricAvailable={appLock.biometricAvailable && appLock.biometricEnabled}
            onBiometricAttempt={appLock.attemptBiometric}
          />
        )}
        {appLock.isSettingUp && (
          <PinLockScreen
            mode="setup"
            onUnlock={() => {}}
            onSetupComplete={(pin) => {
              appLock.setupPin(pin);
              toast.success('PIN lock enabled! 🔒');
            }}
            onCancel={() => appLock.setIsSettingUp(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
