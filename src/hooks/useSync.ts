import { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { pullSync, pushSync } from '../utils/syncService';
import type { AuthUser } from './useAuth';

export function useSync(user: AuthUser | null, onPullComplete: () => void) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<number>(() =>
    parseInt(localStorage.getItem('bm_last_synced') || '0', 10)
  );

  const refreshLastSynced = () => {
    setLastSynced(parseInt(localStorage.getItem('bm_last_synced') || '0', 10));
  };

  const syncNow = async (): Promise<void> => {
    if (!user || isSyncing) return;
    setIsSyncing(true);
    try {
      const updated = await pullSync(user.uid);
      if (updated) onPullComplete();
      await pushSync(user.uid);
      refreshLastSynced();
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    // Full sync when user signs in (pull then push to seed cloud if empty)
    const init = async () => {
      try {
        const updated = await pullSync(uid);
        if (updated) onPullComplete();
      } catch {}
      try {
        await pushSync(uid);
        refreshLastSynced();
      } catch {}
    };
    init();

    // Sync on Capacitor app state changes (Android)
    const listenerPromise = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        pullSync(uid)
          .then((updated) => { if (updated) onPullComplete(); })
          .catch(() => {});
      } else {
        pushSync(uid).catch(() => {});
      }
    });

    // Sync on browser visibility changes (web)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        pullSync(uid)
          .then((updated) => { if (updated) onPullComplete(); })
          .catch(() => {});
      } else {
        pushSync(uid).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      listenerPromise.then((l) => l.remove());
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user?.uid, onPullComplete]);

  return { isSyncing, lastSynced, syncNow };
}
