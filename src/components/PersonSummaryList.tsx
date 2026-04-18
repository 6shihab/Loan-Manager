import { PersonBalance } from '../types';
import { Share2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function PersonSummaryList({ balances, onClickPerson }: { balances: PersonBalance[], onClickPerson: (person: string) => void }) {
  const { t } = useLanguage();
  
  const handleShare = async (b: PersonBalance) => {
    if (b.net === 0) return;
    
    const absNet = Math.abs(b.net).toFixed(2);
    const defaultCurrency = localStorage.getItem('bm_defaultCurrency') || 'BDT';
    const sym = defaultCurrency === 'BDT' ? '৳' : defaultCurrency === 'USD' ? '$' : defaultCurrency === 'EUR' ? '€' : defaultCurrency === 'GBP' ? '£' : defaultCurrency === 'INR' ? '₹' : 'R$';
    
    const text = `╭━━━━━━━━━━━━━━━━━━━━╮
    ✨ ${b.net > 0 ? t('shareCardTitleOweMe') : t('shareCardTitleIOwe')} ✨
╰━━━━━━━━━━━━━━━━━━━━╯

👤 ${t('shareCardName')}: ${b.person}
${b.net > 0 ? `💰 ${t('shareCardOweMeText')}: ${sym}${absNet}` : `💸 ${t('shareCardIOweText')}: ${sym}${absNet}`}

💬 ${b.net > 0 ? t('shareCardNoteOweMe') : t('shareCardNoteIOwe')}

💳 ${t('shareCardFooter')}`;
      
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Borrow Manager Summary',
          text,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Message copied to clipboard!');
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory pt-2 scrollbar-none px-1">
      {balances.map(b => (
        <div key={b.person} className="shrink-0 w-44 snap-start cursor-pointer" onClick={() => onClickPerson(b.person)}>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 p-4 rounded-3xl shadow-md flex flex-col h-full relative group hover:scale-[1.02] transition-transform">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 truncate pr-6" title={b.person}>{b.person}</h3>
            
            {b.net !== 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleShare(b); }}
                className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-indigo-500 bg-gray-50 hover:bg-indigo-50 dark:bg-gray-700/50 dark:hover:bg-indigo-500/20 rounded-full transition-colors"
                title="Share via message"
              >
                <Share2 size={14} />
              </button>
            )}
            
            <div className="mt-auto">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('netBalance')}</span>
              <div className={`text-lg font-extrabold ${b.net === 0 ? 'text-gray-500' : b.net > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                {b.net > 0 ? '+' : ''}{b.net.toFixed(2)}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 uppercase font-bold tracking-wider">
                {b.net > 0 ? t('owesYou') : b.net < 0 ? t('youOwe') : t('settled')}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
