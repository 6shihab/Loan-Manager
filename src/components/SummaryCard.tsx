import { BalanceSummary } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export function SummaryCard({ summary }: { summary: BalanceSummary }) {
  const { t } = useLanguage();
  const isPositiveNet = summary.netBalance >= 0;

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('overallNet')}</span>
        <div className={`text-4xl font-extrabold tracking-tight mb-6 ${isPositiveNet ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
          {summary.netBalance >= 0 ? '+' : '-'}{Math.abs(summary.netBalance).toFixed(2)}
        </div>

        <div className="flex w-full justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-white/40 dark:border-gray-700/50">
          <div className="flex flex-col items-start w-1/2">
            <span className="text-xs text-rose-500 dark:text-rose-400 font-bold mb-1 flex items-center">
              <span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span> {t('totalBorrowed')}
            </span>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{summary.totalBorrowed.toFixed(2)}</span>
          </div>
          
          <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 mx-2"></div>
          
          <div className="flex flex-col items-end w-1/2">
            <span className="text-xs text-emerald-500 dark:text-emerald-400 font-bold mb-1 flex items-center justify-end">
              {t('totalLent')} <span className="w-2 h-2 rounded-full bg-emerald-500 ml-2"></span>
            </span>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{summary.totalLent.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
