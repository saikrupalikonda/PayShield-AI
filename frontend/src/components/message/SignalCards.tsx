import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Award, 
  Lock, 
  FileText, 
  Building2, 
  HelpCircle,
  Truck,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { DetectedSignalCard } from '../../types';

interface SignalCardsProps {
  signals: DetectedSignalCard[];
}

export const SignalCards: React.FC<SignalCardsProps> = ({ signals }) => {
  const getIcon = (category: string, iconName?: string) => {
    switch (category) {
      case 'Urgency & Pressure':
        return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'Fake Authority & Threat':
        return <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'OTP & Credential Theft':
        return <Lock className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'Reward & Cashback Lure':
        return <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'Investment & Part-Time Job Scam':
        return <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Delivery & Customs Fee Scam':
        return <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'Fake Tech Support & Impersonation':
        return <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'Accidental Refund Scam':
      case 'Deceptive Payment Instruction':
      default:
        return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Urgency & Pressure':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'Fake Authority & Threat':
      case 'Fake Tech Support & Impersonation':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-900';
      case 'Reward & Cashback Lure':
      case 'Delivery & Customs Fee Scam':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      case 'Investment & Part-Time Job Scam':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
      default:
        return 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900';
    }
  };

  if (!signals || signals.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>No coercive social engineering cues or scam phrases detected in this message.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Why PayShield Flagged This ({signals.length} {signals.length === 1 ? 'Signal' : 'Signals'})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {signals.map((card, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-900 shrink-0">
                    {getIcon(card.category, card.icon)}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                    {card.signal}
                  </h4>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                  +{card.score_contribution}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {card.explanation}
              </p>
            </div>

            <div>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getCategoryBadgeClass(card.category)}`}>
                {card.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
