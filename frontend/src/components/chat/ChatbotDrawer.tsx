import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Shield, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  PhoneCall, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { RiskAnalysisResult, MessageAnalysisResponse } from '../../types';
import { formatISTTimestamp } from '../../utils/date';

interface ChatMessage {

  sender: 'user' | 'bot';
  text: string;
  time: string;
}

interface ChatbotDrawerProps {
  currentRiskReport?: RiskAnalysisResult | null;
  currentMessageReport?: MessageAnalysisResponse | null;
  forceOpen?: boolean;
  onCloseDrawer?: () => void;
}

const DEFAULT_GREETING = "Hello! I'm PayShield Assistant.\n\nAsk me about scam patterns, why a specific transaction or message was flagged, or how to verify requests before you pay.";

const DEFAULT_QUICK_CHIPS = [
  "Why was this flagged?",
  "What does my risk score mean?",
  "Is this a scam?",
  "What should I do now?",
  "Explain this report",
  "How do I report fraud?"
];

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  currentRiskReport,
  currentMessageReport,
  forceOpen = false,
  onCloseDrawer,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: DEFAULT_GREETING,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(DEFAULT_QUICK_CHIPS);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle external force open
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  // If a new risk report arrives, add a context notice
  useEffect(() => {
    if (currentRiskReport && isOpen) {
      const promptNotice: ChatMessage = {
        sender: 'bot',
        text: `I noticed you just analyzed **${currentRiskReport.identifier}** with a risk score of **${currentRiskReport.risk_score}/100** (${currentRiskReport.risk_level}). Ask me why it was flagged or if you should proceed!`,
        time: 'Just now'
      };
      setMessages((prev) => [...prev, promptNotice]);
    }
  }, [currentRiskReport?.analysis_id, isOpen]);

  // If a new message report arrives, add a context notice
  useEffect(() => {
    if (currentMessageReport && isOpen) {
      const promptNotice: ChatMessage = {
        sender: 'bot',
        text: `I noticed you just analyzed a message flagged as **${currentMessageReport.primary_category}** with a risk score of **${currentMessageReport.risk_score}/100** (${currentMessageReport.risk_level}). Ask me why it was flagged or how to stay safe!`,
        time: 'Just now'
      };
      setMessages((prev) => [...prev, promptNotice]);
    }
  }, [currentMessageReport?.analysis_id, isOpen]);

  // Build standardized active context object
  const getActiveContext = () => {
    if (currentMessageReport) {
      return {
        detection_type: 'sms_text',
        identifier: currentMessageReport.primary_category,
        risk_score: currentMessageReport.risk_score,
        risk_level: currentMessageReport.risk_level,
        primary_category: currentMessageReport.primary_category,
        detected_categories: currentMessageReport.detected_categories,
        plain_explanation: currentMessageReport.plain_explanation,
        signals: currentMessageReport.detected_signals.map((s) => ({
          name: s.signal,
          weight: s.score_contribution,
          explanation: s.explanation,
        })),
        matched_phrases: currentMessageReport.matched_phrases,
        raw_message: currentMessageReport.message,
      };
    }

    if (currentRiskReport) {
      return {
        detection_type: currentRiskReport.identifier_type || (currentRiskReport.qr_data ? 'qr' : 'upi'),
        identifier: currentRiskReport.identifier,
        risk_score: currentRiskReport.risk_score,
        risk_level: currentRiskReport.risk_level,
        signals: currentRiskReport.factors.map((f) => ({
          name: f.factor,
          weight: f.score_contribution,
          explanation: f.explanation,
        })),
        plain_explanation: currentRiskReport.plain_explanation,
        recommended_actions: currentRiskReport.recommended_actions,
        cooling_off_required: currentRiskReport.cooling_off_required,
        synthetic_report_match: currentRiskReport.synthetic_report_match,
        qr_data: currentRiskReport.qr_data,
        demo_scenario_name: currentRiskReport.demo_scenario_name,
      };
    }

    return null;
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const activeContext = getActiveContext();
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await api.sendChatMessage(query, activeContext, historyPayload);
      const botMsg: ChatMessage = {
        sender: 'bot',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
      if (res.suggested_questions && res.suggested_questions.length > 0) {
        setSuggestedQuestions(res.suggested_questions);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "I am experiencing a temporary connection issue. In emergency scam situations, please dial 1930 directly to reach the National Cyber Crime Reporting Helpline.",
          time: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: DEFAULT_GREETING,
        time: 'Just now'
      }
    ]);
    setSuggestedQuestions(DEFAULT_QUICK_CHIPS);
  };

  const activeContext = getActiveContext();

  return (
    <>
      {/* Floating Trigger Button on the Bottom-Right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-brand-600 to-blue-700 hover:from-brand-700 hover:to-blue-800 text-white rounded-full shadow-2xl shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-blue-400/30"
        aria-label="Ask PayShield Assistant"
      >
        <div className="relative">
          <Shield className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-navy-900 animate-pulse" />
        </div>
        <span className="text-xs font-bold tracking-wide">Ask PayShield</span>
      </button>

      {/* Slide-out Drawer Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[94vw] sm:w-[440px] max-h-[640px] h-[82vh] bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-navy-850 via-navy-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm">PayShield Assistant</h3>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold uppercase">
                    Fraud Safety
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 italic">
                  "Understand the risk. Verify before you pay."
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Start New Chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onCloseDrawer) onCloseDrawer();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Section 20: Compact Current Report Card inside Chatbot */}
          {activeContext && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-navy-850 dark:to-navy-900 px-3.5 py-2.5 border-b border-blue-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full bg-brand-600 animate-ping shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                    Current Analysis
                  </span>
                  <div className="font-semibold text-slate-900 dark:text-white truncate font-mono text-[11px]">
                    {activeContext.identifier || 'Active Transaction'}
                  </div>
                  {(currentRiskReport?.created_at || currentMessageReport?.timestamp) && (
                    <span className="text-[9px] text-slate-400 font-mono block truncate">
                      {formatISTTimestamp(currentRiskReport?.created_at || currentMessageReport?.timestamp)}
                    </span>
                  )}
                </div>
              </div>


              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                  (activeContext.risk_score || 0) >= 60
                    ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                    : (activeContext.risk_score || 0) >= 30
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                }`}>
                  {activeContext.risk_score}/100
                </span>

                <button
                  type="button"
                  onClick={() => handleSend("Why was this flagged?")}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-navy-800 hover:bg-brand-50 dark:hover:bg-navy-700 text-brand-700 dark:text-blue-400 font-semibold text-[10px] border border-blue-200 dark:border-slate-700 flex items-center gap-1 transition-colors shadow-xs"
                >
                  <span>Ask about report</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-navy-950/40 text-xs">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white dark:bg-navy-850 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700/80 rounded-bl-none shadow-sm space-y-1.5'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs">{msg.text}</p>
                  <span className={`block text-[9px] ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                    {msg.time}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs pl-8">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600 dark:text-blue-400" />
                <span>PayShield Assistant is analyzing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Action Chips */}
          <div className="p-2.5 bg-white dark:bg-navy-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Quick Questions
              </span>
              <span className="text-[10px] text-slate-400">Click to ask</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 dark:bg-navy-800 hover:bg-brand-50 hover:border-brand-300 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-1.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this payment, scams, 1930, or safety..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs border border-transparent focus:border-brand-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Never share OTPs or UPI PINs</span>
              <span className="text-red-600 dark:text-red-400 font-semibold">
                Cyber Helpline: 1930
              </span>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
