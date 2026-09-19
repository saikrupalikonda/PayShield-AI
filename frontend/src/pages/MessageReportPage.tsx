import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  PhoneCall, 
  Share2, 
  Sparkles, 
  RotateCcw,
  Bot,
  BrainCircuit,
  ExternalLink,
  Clock
} from 'lucide-react';
import { MessageAnalysisResponse } from '../types';
import { MessageHighlighter } from '../components/message/MessageHighlighter';
import { SignalCards } from '../components/message/SignalCards';
import { FeedbackSection } from '../components/message/FeedbackSection';
import { formatISTTimestamp } from '../utils/date';


interface MessageReportPageProps {
  report: MessageAnalysisResponse;
  onBack: () => void;
  onOpenChatWithContext?: (report: MessageAnalysisResponse) => void;
}

export const MessageReportPage: React.FC<MessageReportPageProps> = ({
  report,
  onBack,
  onOpenChatWithContext,
}) => {
  const [copied, setCopied] = useState(false);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 border-red-300 dark:border-red-800';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800';
    if (score >= 30) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950/60 border-yellow-300 dark:border-yellow-800';
    return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800';
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `PayShield Scam Warning: Flagged as "${report.primary_category}" with risk score ${report.risk_score}/100. Be cautious!`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Navigation & Header Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Risk Detection Workbench</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied Warning!' : 'Share Alert'}</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Card */}
      <div className="bg-white dark:bg-navy-850 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Top Header Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                SMS / Message Scam Classification
              </span>
              {report.analysis_id && (
                <span className="text-[10px] text-slate-400 font-mono">
                  ID: {report.analysis_id}
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formatISTTimestamp(report.timestamp)}</span>
              </span>
            </div>

            
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-brand-600 dark:text-blue-400 shrink-0" />
              <span>{report.primary_category}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {report.detected_categories.map((cat, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Risk Gauge Badge */}
          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1 shrink-0">
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                {report.risk_score}<span className="text-lg text-slate-400 font-normal">/100</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Confidence Risk Signal
              </span>
            </div>
            
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getRiskColor(report.risk_score)}`}>
              {report.risk_score >= 60 ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              {report.risk_level}
            </span>
          </div>
        </div>

        {/* Section 1: Highlighted Text Box */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Analyzed Message with Linguistic Highlights
          </h2>
          <MessageHighlighter
            message={report.message}
            phrases={report.matched_phrases || []}
          />
        </div>

        {/* Section 2: Plain Language Explanation */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-navy-900/70 border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Plain-Language Explanation
          </h3>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {report.plain_explanation}
          </p>
        </div>

        {/* Section 3: Recommended Action Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Recommended Action</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed font-semibold">
            {report.recommended_action}
          </p>
        </div>

      </div>

      {/* Section 4: Why Was This Flagged (Signal Breakdown Cards) */}
      <SignalCards signals={report.detected_signals || []} />

      {/* Section 5: Machine Learning Classifier Insights */}
      {report.ml_prediction && (
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-brand-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Supervised NLP Classifier Insights
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {report.ml_prediction.classifier || 'TF-IDF + Calibrated Linear Classifier'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Top Predicted Class:</span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span>{report.ml_prediction.category}</span>
                <span className="text-xs font-normal font-mono text-brand-600 dark:text-blue-400">
                  ({(report.ml_prediction.confidence * 100).toFixed(1)}% confidence)
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Synthetic Scam Assessment:</span>
              <div className="text-sm font-semibold flex items-center gap-1.5">
                {report.ml_prediction.is_scam ? (
                  <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> High Risk Scam Pattern
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Typical Transactional Tone
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Probabilities Preview if available */}
          {report.ml_prediction.probabilities && Object.keys(report.ml_prediction.probabilities).length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Top Class Probabilities:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                {Object.entries(report.ml_prediction.probabilities)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([cat, prob]) => (
                    <div key={cat} className="p-2 rounded-lg bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
                      <div className="truncate text-slate-600 dark:text-slate-300 font-medium">{cat}</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{(prob * 100).toFixed(1)}%</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 6: User Feedback Section */}
      <FeedbackSection detectionId={report.analysis_id} />

      {/* Section 7: National Cyber Helpline Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-red-600/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm">
              Lost money or shared confidential OTPs?
            </h4>
            <p className="text-[11px] text-red-100">
              Immediately call the National Cyber Crime Reporting Helpline at <strong>1930</strong> or report online.
            </p>
          </div>
        </div>

        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-4 py-2 rounded-xl bg-white text-red-700 font-bold text-xs hover:bg-red-50 transition-colors flex items-center gap-1.5"
        >
          <span>cybercrime.gov.in</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-300 dark:border-slate-700"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Analyze Another Message</span>
        </button>

        {onOpenChatWithContext && (
          <button
            type="button"
            onClick={() => onOpenChatWithContext(report)}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
          >
            <Bot className="w-4 h-4" />
            <span>Ask PayShield Chatbot About This Signal</span>
          </button>
        )}
      </div>

    </div>
  );
};
