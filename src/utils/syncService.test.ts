import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db: unknown, ...segments: string[]) => segments.join('/')),
  getDoc: (ref: unknown) => mockGetDoc(ref),
  setDoc: (ref: unknown, data: unknown) => mockSetDoc(ref, data),
}));

vi.mock('./firebase', () => ({ db: {} }));

import { pullSync, pushSync } from './syncService';

describe('pullSync', () => {
  beforeEach(() => {
    localStorage.clear();
    mockGetDoc.mockReset();
    mockSetDoc.mockReset();
  });

  it('returns false when Firestore document does not exist', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => null });
    const result = await pullSync('uid123');
    expect(result).toBe(false);
    expect(localStorage.getItem('bm_transactions')).toBeNull();
  });

  it('returns false when cloud lastUpdated is not newer than local bm_last_synced', async () => {
    localStorage.setItem('bm_last_synced', '1000');
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ transactions: [], trashedTransactions: [], lastUpdated: 999 }),
    });
    const result = await pullSync('uid123');
    expect(result).toBe(false);
    expect(localStorage.getItem('bm_transactions')).toBeNull();
  });

  it('overwrites localStorage and returns true when cloud is newer', async () => {
    localStorage.setItem('bm_last_synced', '500');
    const cloudTx = [{ id: 'tx1', person: 'Alice', amount: 100 }];
    const cloudTrash = [{ id: 'tx2', person: 'Bob', amount: 50 }];
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ transactions: cloudTx, trashedTransactions: cloudTrash, lastUpdated: 1000 }),
    });

    const result = await pullSync('uid123');

    expect(result).toBe(true);
    expect(JSON.parse(localStorage.getItem('bm_transactions')!)).toEqual(cloudTx);
    expect(JSON.parse(localStorage.getItem('bm_trash_transactions')!)).toEqual(cloudTrash);
    expect(localStorage.getItem('bm_last_synced')).toBe('1000');
  });

  it('returns true when local has never synced and cloud has data', async () => {
    const cloudTx = [{ id: 'tx1', person: 'Carol', amount: 200 }];
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ transactions: cloudTx, trashedTransactions: [], lastUpdated: 500 }),
    });

    const result = await pullSync('uid123');

    expect(result).toBe(true);
    expect(JSON.parse(localStorage.getItem('bm_transactions')!)).toEqual(cloudTx);
  });
});

describe('pushSync', () => {
  beforeEach(() => {
    localStorage.clear();
    mockGetDoc.mockReset();
    mockSetDoc.mockReset();
    mockSetDoc.mockResolvedValue(undefined);
  });

  it('writes current localStorage transactions to Firestore', async () => {
    const txs = [{ id: 'tx1', person: 'Dave', amount: 300 }];
    const trash = [{ id: 'tx2', person: 'Eve', amount: 75 }];
    localStorage.setItem('bm_transactions', JSON.stringify(txs));
    localStorage.setItem('bm_trash_transactions', JSON.stringify(trash));

    await pushSync('uid123');

    expect(mockSetDoc).toHaveBeenCalledOnce();
    const [, data] = mockSetDoc.mock.calls[0] as [unknown, { transactions: unknown; trashedTransactions: unknown; lastUpdated: number }];
    expect(data.transactions).toEqual(txs);
    expect(data.trashedTransactions).toEqual(trash);
    expect(typeof data.lastUpdated).toBe('number');
  });

  it('updates bm_last_synced in localStorage after push', async () => {
    localStorage.setItem('bm_transactions', '[]');
    localStorage.setItem('bm_trash_transactions', '[]');

    const before = Date.now();
    await pushSync('uid123');
    const after = Date.now();

    const synced = parseInt(localStorage.getItem('bm_last_synced')!, 10);
    expect(synced).toBeGreaterThanOrEqual(before);
    expect(synced).toBeLessThanOrEqual(after);
  });

  it('handles empty localStorage gracefully', async () => {
    await pushSync('uid123');

    const [, data] = mockSetDoc.mock.calls[0] as [unknown, { transactions: unknown[]; trashedTransactions: unknown[] }];
    expect(data.transactions).toEqual([]);
    expect(data.trashedTransactions).toEqual([]);
  });
});
