import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, CheckSquare, Square, XCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { RiskAnalysisResult } from '../../types';

interface CoolingOffModalProps {
  isOpen: boolean;
  riskResult: RiskAnalysisResult;
  onCancelPayment: () => void;
  onProceedAnyway: () => void;
}

export const CoolingOffModal: React.FC<CoolingOffModalProps> = ({
  isOpen,
  riskResult,
  onCancelPayment,
  onProceedAnyway
}) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [checks, setChecks] = useState<{ [key: string]: boolean }>({
    knowPayee: false,
    officialChannel: false,
    noPressure: false,
    noOtpPin: false
  });

  useEffect(() => {
    if (!isOpen) return;
    setCountdown(5);
    setChecks({
      knowPayee: false,
      officialChannel: false,
      noPressure: false,
      noOtpPin: false
    });

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleCheck = (key: string) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checks).every(Boolean);
  const canProceed = countdown === 0 && allChecked;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-lg w-full shadow-2xl border border-red-500/30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with High-Risk Styling */}
        <div className="p-5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Cooling-Off Interlock Activated</h3>
                <span className="text-[10px] bg-black/20 text-white font-bold px-2 py-0.5 rounded uppercase">
                  Score: {riskResult.risk_score}/100
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5 font-medium">
                Take a moment before authorizing this payment.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 text-slate-800 dark:text-slate-200 text-sm">
          
          {/* Plain reason recap */}
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-xs leading-relaxed text-red-900 dark:text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p>
              PayShield detected high scam-pattern signals for transfer to <strong>{riskResult.identifier}</strong>. 
              Scammers rely on manufactured urgency to bypass your normal verification habits.
            </p>
          </div>

          {/* Countdown Indicator */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Mandatory Reflection Timer:</span>
            </div>
            <div className="text-xs font-bold text-brand-700 dark:text-blue-400 font-mono bg-white dark:bg-navy-900 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
              {countdown > 0 ? `00:0${countdown} remaining` : 'Timer Complete'}
            </div>
          </div>

          {/* Verification Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Please verify each safety check before proceeding:
            </h4>
            <div className="space-y-2">
              
              <button
                type="button"
                onClick={() => toggleCheck('knowPayee')}
                className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-navy-800/60 border border-slate-200 dark:border-slate-800 text-left transition-colors"
              >
                {checks.knowPayee ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  I personally know who I am paying and have confirmed their identity.
                </span>
              </button>

              <button
                type="button"
                onClick={() => toggleCheck('officialChannel')}
                className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-navy-800/60 border border-slate-200 dark:border-slate-800 text-left transition-colors"
              >
                {checks.officialChannel ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  I contacted them through an official verified number, not an incoming cold call or SMS link.
                </span>
              </button>

              <button
                type="button"
                onClick={() => toggleCheck('noPressure')}
                className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-navy-800/60 border border-slate-200 dark:border-slate-800 text-left transition-colors"
              >
                {checks.noPressure ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Nobody is rushing, threatening, or coercing me to act immediately.
                </span>
              </button>

              <button
                type="button"
                onClick={() => toggleCheck('noOtpPin')}
                className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-navy-800/60 border border-slate-200 dark:border-slate-800 text-left transition-colors"
              >
                {checks.noOtpPin ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  I have NOT shared OTP, UPI PIN, or installed any screen-sharing application (AnyDesk, etc.).
                </span>
              </button>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            
            {/* Primary Recommendation: CANCEL PAYMENT */}
            <button
              type="button"
              onClick={onCancelPayment}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Payment (Recommended)</span>
            </button>

            {/* Friction Continue */}
            <button
              type="button"
              disabled={!canProceed}
              onClick={onProceedAnyway}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>{countdown > 0 ? `Wait (${countdown}s)` : 'Proceed to Demo Payment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};
