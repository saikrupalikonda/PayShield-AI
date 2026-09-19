import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  XCircle, 
  Play, 
  RotateCcw, 
  Clock, 
  Info,
  PhoneCall,
  ExternalLink,
  ChevronDown,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { RiskAnalysisResult } from '../types';
import { CoolingOffModal } from '../components/risk/CoolingOffModal';
import { SimulatedPaymentModal } from '../components/payment/SimulatedPaymentModal';
import { SurveyModal } from '../components/payment/SurveyModal';
import { formatISTTimestamp } from '../utils/date';


interface ReportPageProps {
  report: RiskAnalysisResult;
  onBack: () => void;
  onPaymentOutcomeRecorded: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({
  report,
  onBack,
  onPaymentOutcomeRecorded
}) => {
  const [coolingOffOpen, setCoolingOffOpen] = useState(false);
  const [simulatedPayOpen, setSimulatedPayOpen] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [paymentOutcome, setPaymentOutcome] = useState<'confirmed' | 'cancelled' | null>(null);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 border-red-300 dark:border-red-800';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800';
    if (score >= 30) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950/60 border-yellow-300 dark:border-yellow-800';
    return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800';
  };

  const handleStartPaymentFlow = () => {
    if (report.cooling_off_required) {
      setCoolingOffOpen(true);
    } else {
      setSimulatedPayOpen(true);
    }
  };

  const handleCancelImmediately = () => {
    setPaymentOutcome('cancelled');
    setSurveyOpen(true);
  };

  const handleCoolingOffProceed = () => {
    setCoolingOffOpen(false);
    setSimulatedPayOpen(true);
  };

  const handlePaymentCompleted = (outcome: 'confirmed' | 'cancelled') => {
    setPaymentOutcome(outcome);
    setSimulatedPayOpen(false);
    onPaymentOutcomeRecorded();
    setSurveyOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Detection Workbench</span>
        </button>

        {report.demo_scenario_name && (
          <span className="text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-brand-700 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            {report.demo_scenario_name}
          </span>
        )}
      </div>

      {/* Main Risk Header Card */}
      <div className="bg-white dark:bg-navy-850 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm overflow-hidden relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                PayShield Risk Inspection
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ID: {report.analysis_id}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {report.identifier}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Evaluated: {formatISTTimestamp(report.created_at)}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Evaluated using multi-layer contextual, behavioural, and synthetic intelligence models.
            </p>

          </div>

          {/* Risk Gauge Badge */}
          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                {report.risk_score}<span className="text-lg text-slate-400 font-normal">/100</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Scam-Pattern Score
              </span>
            </div>
            
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getRiskColor(report.risk_score)}`}>
              {report.risk_score >= 60 ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              {report.risk_level}
            </span>
          </div>

        </div>

        {/* Plain Language Summary (Section 17 & 40) */}
        <div className="py-6 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Executive Plain-Language Summary
          </h2>
          <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {report.plain_explanation}
          </p>
        </div>

        {/* Outcome status banner if action taken */}
        {paymentOutcome && (
          <div className={`p-4 rounded-2xl mb-4 border flex items-center justify-between text-xs font-semibold ${
            paymentOutcome === 'cancelled'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                {paymentOutcome === 'cancelled' 
                  ? 'Payment stopped before confirmation. Safety interlock successful.' 
                  : 'Simulated payment outcome logged in PayShield history.'}
              </span>
            </div>
            <button
              onClick={() => setSurveyOpen(true)}
              className="underline text-[11px] hover:opacity-80"
            >
              Feedback Survey
            </button>
          </div>
        )}

        {/* Action Button Strip */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          
          <button
            type="button"
            onClick={handleCancelImmediately}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-300 dark:border-slate-700"
          >
            <XCircle className="w-4 h-4 text-red-500" />
            <span>Cancel Payment</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-300 dark:border-slate-700"
          >
            <RotateCcw className="w-4 h-4 text-blue-500" />
            <span>Review Again</span>
          </button>

          <button
            type="button"
            onClick={handleStartPaymentFlow}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <Play className="w-4 h-4" />
            <span>Continue to Simulated Payment</span>
          </button>

        </div>
      </div>

      {/* Contributing Signals Breakdown (Section 17 & 40) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Why PayShield Flagged This
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Itemized signals and score contributions calculated by the explainable risk engine
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {report.factors.length} signals analyzed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.factors.map((factor, index) => (
            <div
              key={index}
              className={`p-5 rounded-2xl border transition-all ${
                factor.score_contribution > 0
                  ? 'bg-white dark:bg-navy-850 border-slate-200 dark:border-slate-800'
                  : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${
                    factor.score_contribution > 0
                      ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {factor.score_contribution > 0 ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </span>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                    {factor.factor}
                  </h3>
                </div>

                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  factor.score_contribution > 0
                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40'
                    : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                }`}>
                  {factor.score_contribution > 0 ? `+${factor.score_contribution}` : `${factor.score_contribution}`} signal
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-8">
                {factor.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Synthetic Report Intelligence (if matched) */}
      {report.synthetic_report_match && (
        <div className="p-6 rounded-2xl bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Synthetic Community Intelligence Record
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Claimed Entity:</span>
              <span className="font-semibold text-slate-800 dark:text-white">{report.synthetic_report_match.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Demonstration Reports:</span>
              <span className="font-semibold text-slate-800 dark:text-white">{report.synthetic_report_match.report_count} complaints</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Reported Categories:</span>
              <span className="font-semibold text-slate-800 dark:text-white">{report.synthetic_report_match.categories.join(', ') || 'N/A'}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-2">
            * Demonstration dataset provided for hackathon evaluation; not a real police or banking repository.
          </p>
        </div>
      )}

      {/* "What You Should Do" Checklist (Section 17) */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          What You Should Do
        </h2>

        <div className="space-y-3">
          {report.recommended_actions.map((action, i) => (
            <div key={i} className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-navy-800 text-brand-600 dark:text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-slate-700">
                {i + 1}
              </div>
              <p>{action}</p>
            </div>
          ))}
        </div>

        {/* Boundary Notice */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
            "PayShield provides a risk signal, not a definitive fraud determination."
          </p>
        </div>
      </div>

      {/* Cooling-Off Modal */}
      <CoolingOffModal
        isOpen={coolingOffOpen}
        riskResult={report}
        onCancelPayment={() => {
          setCoolingOffOpen(false);
          handleCancelImmediately();
        }}
        onProceedAnyway={handleCoolingOffProceed}
      />

      {/* Simulated Payment Modal */}
      <SimulatedPaymentModal
        isOpen={simulatedPayOpen}
        riskResult={report}
        amount={5000}
        recipient={report.identifier}
        onPaymentOutcome={handlePaymentCompleted}
        onClose={() => setSimulatedPayOpen(false)}
      />

      {/* Post-Payment Survey Modal */}
      <SurveyModal
        isOpen={surveyOpen}
        analysisId={report.analysis_id}
        onClose={() => setSurveyOpen(false)}
      />

    </div>
  );
};
