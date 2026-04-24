import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Transaction } from '../types';

export type ShareCSVOutcome = 'shared' | 'downloaded' | 'cancelled';

function buildCSV(transactions: Transaction[]): string {
  const headers = ['ID', 'Date', 'Type', 'Person', 'Amount', 'Currency', 'Status', 'Due Date', 'Tags', 'Note'];
  const rows = transactions.map(tx => [
    tx.id,
    new Date(tx.date).toLocaleDateString(),
    tx.type,
    tx.person,
    tx.amount.toFixed(2),
    tx.currency || 'USD',
    tx.status || 'pending',
    tx.dueDate ? new Date(tx.dueDate).toLocaleDateString() : '',
    tx.tags ? tx.tags.join('; ') : '',
    tx.note ? `"${tx.note.replace(/"/g, '""')}"` : '',
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

function isCapacitorNative(): boolean {
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return typeof cap !== 'undefined' && cap?.isNativePlatform?.() === true;
}

export async function shareCSV(transactions: Transaction[]): Promise<ShareCSVOutcome> {
  const csvString = buildCSV(transactions);
  const filename = `lent-manager-export-${new Date().toISOString().split('T')[0]}.csv`;

  if (isCapacitorNative()) {
    await Filesystem.writeFile({
      path: filename,
      data: csvString,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    const { uri } = await Filesystem.getUri({
      path: filename,
      directory: Directory.Cache,
    });

    try {
      await Share.share({ title: filename, url: uri, dialogTitle: 'Export CSV' });
      return 'shared';
    } catch (err) {
      if (isAbortError(err)) return 'cancelled';
      throw err;
    }
  }

  // Web/desktop: anchor download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
  return 'downloaded';
}
