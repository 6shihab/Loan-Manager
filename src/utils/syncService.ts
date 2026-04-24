import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Transaction } from '../types';

const LAST_SYNCED_KEY = 'bm_last_synced';
const TRANSACTIONS_KEY = 'bm_transactions';
const TRASH_KEY = 'bm_trash_transactions';

interface FirestoreSyncDoc {
  transactions: Transaction[];
  trashedTransactions: Transaction[];
  lastUpdated: number;
}

function getSyncDocRef(uid: string) {
  return doc(db, 'users', uid, 'data', 'sync');
}

export async function pullSync(uid: string): Promise<boolean> {
  const localLastSynced = parseInt(localStorage.getItem(LAST_SYNCED_KEY) || '0', 10);
  const snap = await getDoc(getSyncDocRef(uid));

  if (!snap.exists()) return false;

  const data = snap.data() as FirestoreSyncDoc;
  if (data.lastUpdated <= localLastSynced) return false;

  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(data.transactions));
  localStorage.setItem(TRASH_KEY, JSON.stringify(data.trashedTransactions));
  localStorage.setItem(LAST_SYNCED_KEY, String(data.lastUpdated));
  return true;
}

export async function pushSync(uid: string): Promise<void> {
  const transactions: Transaction[] = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
  const trashedTransactions: Transaction[] = JSON.parse(localStorage.getItem(TRASH_KEY) || '[]');
  const lastUpdated = Date.now();

  await setDoc(getSyncDocRef(uid), { transactions, trashedTransactions, lastUpdated });
  localStorage.setItem(LAST_SYNCED_KEY, String(lastUpdated));
}
