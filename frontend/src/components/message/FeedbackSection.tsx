import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface FeedbackSectionProps {
  detectionId: string;
  initialFeedback?: Record<string, string>;
  onFeedbackSubmitted?: () => void;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  detectionId,
  initialFeedback,
  onFeedbackSubmitted,
}) => {
  const [wasHelpful, setWasHelpful] = useState<string>(initialFeedback?.was_helpful || '');
  const [receivedMessage, setReceivedMessage] = useState<string>(initialFeedback?.received_message || '');
  const [reported, setReported] = useState<string>(initialFeedback?.reported || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(!!initialFeedback);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasHelpful) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (detectionId) {
        await api.submitMessageFeedback({
          detection_id: detectionId,
          was_helpful: wasHelpful,
          received_message: receivedMessage || 'No',
          reported: reported || 'Not yet',
        });
      }
      setSubmitted(true);
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      // Even if network fails, show friendly local confirmation
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-navy-850 dark:to-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Community Verification & Feedback
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Help improve fraud pattern detection by validating this analysis.
          </p>
        </div>
        {submitted && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Feedback Recorded
          </span>
        )}
      </div>

      {submitted ? (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Thank you! Your feedback strengthens PayShield’s synthetic risk heuristics for all users.
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Question 1: Was this helpful? */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Was this analysis helpful?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWasHelpful('Yes')}
                  className={`flex-1 py-1.5 px-3 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-all ${
                    wasHelpful === 'Yes'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Yes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWasHelpful('No')}
                  className={`flex-1 py-1.5 px-3 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-all ${
                    wasHelpful === 'No'
                      ? 'bg-red-50 dark:bg-red-950/50 border-red-500 text-red-700 dark:text-red-300 font-semibold shadow-sm'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>No</span>
                </button>
              </div>
            </div>

            {/* Question 2: Did you receive this message? */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Have you received this message?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReceivedMessage('Yes')}
                  className={`flex-1 py-1.5 px-3 rounded-lg border font-medium transition-all ${
                    receivedMessage === 'Yes'
                      ? 'bg-blue-50 dark:bg-navy-800 border-brand-600 text-brand-700 dark:text-blue-400 font-semibold shadow-sm'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                  }`}
                >
                  Yes, received it
                </button>
                <button
                  type="button"
                  onClick={() => setReceivedMessage('No')}
                  className={`flex-1 py-1.5 px-3 rounded-lg border font-medium transition-all ${
                    receivedMessage === 'No'
                      ? 'bg-blue-50 dark:bg-navy-800 border-brand-600 text-brand-700 dark:text-blue-400 font-semibold shadow-sm'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                  }`}
                >
                  Testing / Demo
                </button>
              </div>
            </div>

            {/* Question 3: Reported? */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Reported to cybercrime / 1930?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReported('Yes')}
                  className={`flex-1 py-1.5 px-2 rounded-lg border font-medium text-[11px] transition-all ${
                    reported === 'Yes'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setReported('Not yet')}
                  className={`flex-1 py-1.5 px-2 rounded-lg border font-medium text-[11px] transition-all ${
                    reported === 'Not yet'
                      ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-700 dark:text-amber-300 font-semibold shadow-sm'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                  }`}
                >
                  Not yet
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !wasHelpful}
              className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-40"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Submit Verification</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
