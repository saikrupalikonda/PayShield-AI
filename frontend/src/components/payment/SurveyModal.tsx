import React, { useState } from 'react';
import { HelpCircle, CheckCircle, Send, Loader2, Sparkles, X } from 'lucide-react';
import { api } from '../../services/api';

interface SurveyModalProps {
  isOpen: boolean;
  analysisId: string;
  onClose: () => void;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({
  isOpen,
  analysisId,
  onClose
}) => {
  const [wasLegitimate, setWasLegitimate] = useState<string>('No');
  const [warningHelped, setWarningHelped] = useState<string>('Yes');
  const [feltPressured, setFeltPressured] = useState<string>('Yes');
  const [requestType, setRequestType] = useState<string>('Refund');
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitSurvey({
        analysis_id: analysisId,
        was_legitimate: wasLegitimate,
        warning_helped: warningHelped,
        felt_pressured: feltPressured,
        request_type: requestType,
        feedback: feedback.trim() || undefined
      });
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Survey error:', err);
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-brand-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Payment Experience Feedback</h3>
              <p className="text-[11px] text-blue-100">Help improve PayShield's behavioral detection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Thank You for Your Feedback!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your input directly enriches PayShield's educational and detection insights.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              
              {/* Question 1 */}
              <div>
                <label className="block font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
                  1. In your assessment, was this transaction legitimate?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Yes', 'No', "I'm not sure"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setWasLegitimate(opt)}
                      className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                        wasLegitimate === opt
                          ? 'bg-blue-50 dark:bg-navy-800 border-brand-600 text-brand-700 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-navy-800/40'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div>
                <label className="block font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
                  2. Did PayShield's risk signal and explanation help you pause?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Yes', 'Somewhat', 'No'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setWarningHelped(opt)}
                      className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                        warningHelped === opt
                          ? 'bg-blue-50 dark:bg-navy-800 border-brand-600 text-brand-700 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-navy-800/40'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div>
                <label className="block font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
                  3. Did you feel pressured or hurried before this transaction?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Yes', 'No'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFeltPressured(opt)}
                      className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                        feltPressured === opt
                          ? 'bg-blue-50 dark:bg-navy-800 border-brand-600 text-brand-700 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-navy-800/40'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4 */}
              <div>
                <label className="block font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
                  4. What type of request did you receive?
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="Refund">Refund / Accidental Deposit</option>
                  <option value="Customer support">Fake Customer Support / Bank Officer</option>
                  <option value="Friend/family">Friend / Family Emergency</option>
                  <option value="Merchant">Merchant Purchase</option>
                  <option value="Investment">Investment / Work From Home Task</option>
                  <option value="Other">Other Category</option>
                </select>
              </div>

              {/* Question 5 */}
              <div>
                <label className="block font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
                  5. Optional comments or observations:
                </label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Any details on how the request occurred..."
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
