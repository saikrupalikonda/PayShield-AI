import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { RiskAnalysisResult } from '../../types';

interface SimulatedPaymentModalProps {
  isOpen: boolean;
  riskResult: RiskAnalysisResult;
  amount: number;
  recipient: string;
  purpose?: string;
  onPaymentOutcome: (status: 'confirmed' | 'cancelled') => void;
  onClose: () => void;
}

export const SimulatedPaymentModal: React.FC<SimulatedPaymentModalProps> = ({
  isOpen,
  riskResult,
  amount,
  recipient,
  purpose = 'Simulated Transfer',
  onPaymentOutcome,
  onClose,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTxnId, setCompletedTxnId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const res = await api.simulatePayment({
        analysis_id: riskResult.analysis_id,
        recipient: recipient || riskResult.identifier,
        amount: amount || 500,
        purpose,
        action_taken: 'confirmed'
      });
      setCompletedTxnId(res.transaction_id);
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      await api.simulatePayment({
        analysis_id: riskResult.analysis_id,
        recipient: recipient || riskResult.identifier,
        amount: amount || 500,
        purpose,
        action_taken: 'cancelled'
      });
    } catch (err) {
      console.error("Cancel error:", err);
    }
    onPaymentOutcome('cancelled');
    onClose();
  };

  const handleFinish = () => {
    onPaymentOutcome('confirmed');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-navy-850 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Simulated UPI Payment</h3>
              <p className="text-[11px] text-slate-300">Demo execution environment</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded">
            DEMO ONLY
          </span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {completedTxnId ? (
            /* Success State */
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-300 dark:border-emerald-800 animate-in zoom-in-50 duration-200">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Simulated Payment Successful
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Reference: <span className="font-mono text-slate-700 dark:text-slate-300">{completedTxnId}</span>
                </p>
              </div>

              {/* DEMO NOTICE (Section 20) */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-800 dark:text-amber-200 font-semibold">
                DEMO ONLY – No real money was transferred.
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Outcome logged to your personal PayShield activity record for analysis and educational feedback.
              </p>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
              >
                Complete & Review Experience
              </button>
            </div>
          ) : (
            /* Confirmation Form */
            <>
              {/* Payment Details Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Payee Identifier:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {recipient || riskResult.identifier}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Transfer Amount:</span>
                  <span className="font-bold text-base text-brand-700 dark:text-blue-400">
                    ₹{(amount || 500).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">PayShield Risk Score:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    riskResult.risk_score >= 60 
                      ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                      : riskResult.risk_score >= 30
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {riskResult.risk_score}/100 ({riskResult.risk_level})
                  </span>
                </div>
              </div>

              {/* High Risk Warning Callout */}
              {riskResult.risk_score >= 60 && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Caution Advised</p>
                    <p className="text-[11px] text-red-700 dark:text-red-300 mt-0.5">
                      This transaction has multiple risk indicators matching known APP fraud schemes.
                    </p>
                  </div>
                </div>
              )}

              {/* DEMO NOTICE BANNER (Section 20) */}
              <div className="p-3 bg-blue-50 dark:bg-navy-800 rounded-xl border border-blue-200 dark:border-blue-900/50 text-center text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-brand-700 dark:text-blue-400 block mb-0.5">
                  DEMO ONLY – No Real Money Transferred
                </span>
                This sandbox confirms the decision flow and logs telemetry without contacting banking networks.
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>Cancel Payment</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Proceed Anyway</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
