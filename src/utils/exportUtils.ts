import { Transaction } from '../types';

export function downloadTransactionsCSV(transactions: Transaction[]) {
  // Define headers
  const headers = ['ID', 'Date', 'Type', 'Person', 'Amount', 'Currency', 'Status', 'Due Date', 'Tags', 'Note'];
  
  // Format rows
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
    tx.note ? `"${tx.note.replace(/"/g, '""')}"` : ''
  ]);
  
  // Combine into CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');
  
  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `borrow-manager-export-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
