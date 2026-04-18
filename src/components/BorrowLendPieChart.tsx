import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BalanceSummary, Transaction } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export function BorrowLendPieChart({ summary, transactions }: { summary: BalanceSummary, transactions?: Transaction[] }) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'pie' | 'trend'>('pie');

  if (summary.totalBorrowed === 0 && summary.totalLent === 0) return null;

  const pieData = [
    { name: t('borrowed') || 'Borrowed', value: summary.totalBorrowed, color: '#f43f5e' },
    { name: t('lent') || 'Lent', value: summary.totalLent, color: '#10b981' }
  ];

  const trendData = useMemo(() => {
    if (!transactions) return [];
    
    // Generate last 4 months
    const months = Array.from({length: 4}).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (3 - i));
      return { 
        name: d.toLocaleString('default', { month: 'short' }),
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        Borrowed: 0, 
        Lent: 0 
      };
    });

    transactions.forEach(tx => {
      const d = new Date(tx.date);
      const match = months.find(m => m.monthIndex === d.getMonth() && m.year === d.getFullYear());
      if (match) {
        if (tx.type === 'borrowed') match.Borrowed += tx.amount;
        if (tx.type === 'lent') match.Lent += tx.amount;
      }
    });

    return months;
  }, [transactions]);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl p-4 shadow-sm w-full relative">
      <div className="flex justify-between items-center mb-2 px-2">
        <h3 className="font-bold text-gray-700 dark:text-gray-300">Overview</h3>
        {transactions && transactions.length > 0 && (
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1 border border-gray-200 dark:border-gray-600">
            <button 
              onClick={() => setViewMode('pie')}
              className={`text-[10px] px-3 py-1 font-bold uppercase rounded-full transition-colors ${viewMode === 'pie' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-fuchsia-400' : 'text-gray-500'}`}
            >
              Total
            </button>
            <button 
              onClick={() => setViewMode('trend')}
              className={`text-[10px] px-3 py-1 font-bold uppercase rounded-full transition-colors ${viewMode === 'trend' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-fuchsia-400' : 'text-gray-500'}`}
            >
              Trends
            </button>
          </div>
        )}
      </div>

      <div className="h-64 mt-4 w-full relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          {viewMode === 'pie' ? (
            <motion.div 
              key="pie"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="absolute inset-0"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)}`, 'Amount']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <motion.div 
              key="trend"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="absolute inset-0"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Borrowed" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="Lent" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
