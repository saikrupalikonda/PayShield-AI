import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  AtSign, 
  Phone, 
  MessageSquare, 
  SlidersHorizontal, 
  Search, 
  Loader2, 
  AlertTriangle, 
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Upload,
  ShieldAlert,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { RiskAnalysisResult, StructuredUPIQR, QRDetectResponse, MessageAnalysisResponse, DemoMessageItem } from '../types';
import { QRScannerModal } from '../components/qr/QRScannerModal';
import { AnalysisStages, StageItem } from '../components/common/AnalysisStages';

interface DetectPageProps {
  initialTab?: string;
  onAnalysisComplete: (result: RiskAnalysisResult) => void;
  onMessageAnalysisComplete?: (result: MessageAnalysisResponse) => void;
}

const MESSAGE_ANALYSIS_STAGES: StageItem[] = [
  { id: 'keywords', label: 'Scanning text & keywords', description: 'Detecting financial, authority, and reward phrases' },
  { id: 'patterns', label: 'Checking against known scam patterns', description: 'Matching multi-category heuristics & Indian scam linguistic cues' },
  { id: 'urgency', label: 'Evaluating urgency & emotional triggers', description: 'Assessing countdowns, panic language, and threat level' },
  { id: 'scoring', label: 'Calculating risk score & action plan', description: 'Compounding weighted signals with supervised classifier' },
];

export const DetectPage: React.FC<DetectPageProps> = ({
  initialTab = 'qr',
  onAnalysisComplete,
  onMessageAnalysisComplete,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // QR state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [decodedQr, setDecodedQr] = useState<QRDetectResponse | null>(null);

  // Inputs
  const [upiId, setUpiId] = useState('quick.refund99@paytm');
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [messageText, setMessageText] = useState(
    'Your refund of ₹5,000 has been processed by mistake. Please return it immediately to this alternate UPI ID to avoid bank hold.'
  );

  // Message detection animation stages
  const [isAnalyzingMessage, setIsAnalyzingMessage] = useState<boolean>(false);
  const [messageStageIndex, setMessageStageIndex] = useState<number>(0);
  const [demoMessages, setDemoMessages] = useState<DemoMessageItem[]>([]);

  // Behavioural inputs
  const [behRecipient, setBehRecipient] = useState('unknown.party@ybl');
  const [behAmount, setBehAmount] = useState('5000');
  const [behPurpose, setBehPurpose] = useState('Refund Reversal');
  const [behNewRecipient, setBehNewRecipient] = useState(true);
  const [behChannel, setBehChannel] = useState('SMS');
  const [behEmergency, setBehEmergency] = useState(false);
  const [behUrgency, setBehUrgency] = useState(true);

  // Fetch demo messages from API on mount
  useEffect(() => {
    const loadDemos = async () => {
      try {
        const demos = await api.getDemoMessages();
        if (demos && demos.length > 0) {
          setDemoMessages(demos);
        }
      } catch (err) {
        console.warn('Could not fetch remote demo messages, using built-in presets:', err);
      }
    };
    loadDemos();
  }, []);

  // Handle UPI Analysis
  const handleAnalyzeUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await api.analyzeRisk({
        identifier: upiId.trim(),
        identifier_type: 'upi',
        amount: 2500,
        is_new_recipient: true,
        payment_channel: 'Direct UPI',
      });
      onAnalysisComplete(result);
    } catch (err: any) {
      setError(err.message || 'Error analyzing UPI ID');
    } finally {
      setLoading(false);
    }
  };

  // Handle Mobile Analysis
  const handleAnalyzeMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cleanMobile = mobileNumber.trim();
      const result = await api.analyzeRisk({
        identifier: cleanMobile.startsWith('+91') ? cleanMobile : `+91${cleanMobile}`,
        identifier_type: 'mobile',
        amount: 3000,
        is_new_recipient: true,
        payment_channel: 'Phone call',
      });
      onAnalysisComplete(result);
    } catch (err: any) {
      setError(err.message || 'Error analyzing mobile number');
    } finally {
      setLoading(false);
    }
  };

  // Handle Message NLP Analysis with Real-time Stage Progression
  const handleAnalyzeMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setError(null);
    setLoading(true);
    setIsAnalyzingMessage(true);
    setMessageStageIndex(0);

    try {
      // Stage 0: scanning keywords
      await new Promise((r) => setTimeout(r, 200));
      setMessageStageIndex(1);

      // Stage 1: checking patterns
      await new Promise((r) => setTimeout(r, 250));
      setMessageStageIndex(2);

      // Stage 2: evaluating urgency
      await new Promise((r) => setTimeout(r, 200));
      setMessageStageIndex(3);

      const res = await api.detectMessage(messageText.trim());

      // If dedicated message analysis callback exists, invoke it
      if (onMessageAnalysisComplete) {
        onMessageAnalysisComplete(res);
      } else {
        // Fallback: convert to RiskAnalysisResult format
        const factors = res.detected_signals.map((s) => ({
          factor: s.signal,
          score_contribution: s.score_contribution,
          explanation: s.explanation,
          icon: s.icon,
        }));
        onAnalysisComplete({
          analysis_id: res.analysis_id,
          identifier: res.primary_category,
          identifier_type: 'sms_text',
          risk_score: res.risk_score,
          risk_level: res.risk_level as any,
          factors: factors,
          plain_explanation: res.plain_explanation,
          recommended_actions: [res.recommended_action],
          cooling_off_required: res.risk_score >= 60,
          cooling_off_seconds: 5,
          created_at: res.timestamp,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error analyzing message');
    } finally {
      setLoading(false);
      setIsAnalyzingMessage(false);
    }
  };

  // Handle QR Scan Complete from modal
  const handleQrScanned = async (payload: string, parsed?: StructuredUPIQR, qrDetectResult?: QRDetectResponse) => {
    if (qrDetectResult && qrDetectResult.analysis_result) {
      onAnalysisComplete(qrDetectResult.analysis_result);
      return;
    }

    setLoading(true);
    try {
      const result = await api.analyzeRisk({
        identifier: parsed?.pa || payload,
        identifier_type: 'qr',
        amount: parsed?.am ? parseFloat(parsed.am) : 5000,
        recipient_name: parsed?.pn,
        is_new_recipient: true,
        payment_channel: 'QR Scan',
      });
      onAnalysisComplete(result);
    } catch (err: any) {
      setError(err.message || 'Error evaluating QR payload');
    } finally {
      setLoading(false);
    }
  };

  // Handle Behavioural Form Analysis
  const handleAnalyzeBehavioural = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await api.analyzeRisk({
        identifier: behRecipient.trim(),
        identifier_type: 'upi',
        amount: parseFloat(behAmount) || 0,
        is_new_recipient: behNewRecipient,
        payment_channel: behChannel,
        claims_emergency: behEmergency,
        immediate_action_demanded: behUrgency,
      });
      onAnalysisComplete(result);
    } catch (err: any) {
      setError(err.message || 'Error running behavioural risk engine');
    } finally {
      setLoading(false);
    }
  };

  // Built-in fallback demo messages if API returned empty
  const fallbackPresets = [
    {
      id: 'demo_refund',
      title: 'Accidental Refund Scam',
      badge: 'High Risk',
      text: 'Refund of ₹5,000 sent to you by mistake. Return ₹5,000 immediately to alternate UPI ID quick.refund99@paytm to prevent legal action and police complaint.',
    },
    {
      id: 'demo_bank_block',
      title: 'Urgent Bank Account Block',
      badge: 'Critical Risk',
      text: 'SBI Alert: Dear customer, your NetBanking access is suspended today due to missing KYC. Call support immediately and verify your Netbanking credentials.',
    },
    {
      id: 'demo_electricity',
      title: 'Electricity Disconnection Threat',
      badge: 'High Risk',
      text: 'Dear Consumer, your electricity power will be disconnected at 9:30 PM tonight because your previous month bill was not updated. Please immediately pay ₹450 to avoid outage.',
    },
    {
      id: 'demo_job',
      title: 'Work From Home Task Lure',
      badge: 'Moderate Risk',
      text: 'Earn ₹3,000 daily from home by rating hotels and YouTube videos. Deposit ₹1,500 registration token to unlock high-payout Telegram tasks.',
    },
    {
      id: 'demo_lottery',
      title: 'Reward & Lottery Prize',
      badge: 'High Risk',
      text: 'Congratulations! You have won a cash reward of ₹25,000 in the festive lucky draw. Click here to claim your reward before expiry.',
    },
    {
      id: 'demo_clean',
      title: 'Clean Transaction Notification',
      badge: 'Safe Signal',
      text: 'Your account XX4092 has been debited by INR 450.00 for grocery store purchase at Metro Mart. Available balance: INR 18,240.50.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Risk Detection Workbench
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Inspect QR codes, payment messages, recipient UPI VPAs, and mobile numbers before approving digital transactions.
        </p>
      </div>

      {/* Tabs Navigation (4 Primary Tabs + Context Simulation) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'qr', label: 'Scan QR', icon: QrCode },
          { id: 'upi', label: 'Enter UPI ID', icon: AtSign },
          { id: 'mobile', label: 'Enter Mobile Number', icon: Phone },
          { id: 'message', label: 'Analyze Payment Message', icon: MessageSquare },
          { id: 'behavioural', label: 'Context Simulation', icon: SlidersHorizontal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError(null);
              }}
              className={`py-3 px-4 text-xs font-semibold rounded-t-xl border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-brand-600 text-brand-600 dark:text-blue-400 bg-blue-50/50 dark:bg-navy-800/60 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: SCAN QR (PART 1 REQUIREMENTS) */}
      {activeTab === 'qr' && (
        <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              UPI QR Code Scanner & Intelligence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Decode and inspect QR codes safely. Decodes recipient VPA, embedded amounts, and cross-references synthetic threat records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action 1: Upload QR Image */}
            <div
              onClick={() => setQrModalOpen(true)}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-navy-900/50 hover:border-brand-500 dark:hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-brand-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Upload QR Image
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Select a PNG, JPG, or WEBP screenshot from your device. Decodes without executing payments.
                </p>
              </div>
              <span className="text-xs font-semibold text-brand-600 dark:text-blue-400 mt-4 inline-flex items-center gap-1 group-hover:underline">
                Upload & Inspect <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Action 2: Live Camera Scan */}
            <div
              onClick={() => setQrModalOpen(true)}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-navy-900/50 hover:border-brand-500 dark:hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Scan with Camera
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Point your webcam or mobile camera at any physical barcode or storefront standee.
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-4 inline-flex items-center gap-1 group-hover:underline">
                Launch Camera <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Action 3: Try Demo QR */}
            <div
              onClick={() => setQrModalOpen(true)}
              className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Try Demo QR Scenarios
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Test known scammer QR (<code className="text-red-600 font-mono">scammer123@demo</code>), refund lure, or verified merchant.
                </p>
              </div>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-4 inline-flex items-center gap-1 group-hover:underline">
                Explore Demo QRs <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>Privacy & Safety Notice:</strong> PayShield operates strictly as an intelligence analysis layer. No UPI PIN, banking credentials, or wallet authorization tokens are ever handled.
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: ENTER UPI ID */}
      {activeTab === 'upi' && (
        <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Enter Virtual Payment Address (UPI ID)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Validates VPA format and looks up synthetic complaint intelligence and scam patterns.
            </p>
          </div>

          <form onSubmit={handleAnalyzeUpi} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                UPI ID / VPA
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <AtSign className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="merchant@okhdfcbank"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Quick Demo Presets */}
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1.5">
                Demo UPI Presets:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setUpiId('scammer123@demo')}
                  className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 font-mono text-[11px]"
                >
                  scammer123@demo (12 Complaints)
                </button>
                <button
                  type="button"
                  onClick={() => setUpiId('quick.refund99@paytm')}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-mono text-[11px]"
                >
                  quick.refund99@paytm (Refund Scam)
                </button>
                <button
                  type="button"
                  onClick={() => setUpiId('verifiedmerchant@demo')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-mono text-[11px]"
                >
                  verifiedmerchant@demo (Safe Merchant)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !upiId.trim()}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Analyze UPI Identifier</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: ENTER MOBILE NUMBER */}
      {activeTab === 'mobile' && (
        <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Enter Mobile Identifier
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates Indian phone format and searches synthetic complaint history.
            </p>
          </div>

          <form onSubmit={handleAnalyzeMobile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs font-semibold">
                  +91
                </div>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1.5">
                Demo Mobile Presets:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setMobileNumber('9876543210')}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-mono text-[11px]"
                >
                  9876543210 (31 Synthetic Complaints)
                </button>
                <button
                  type="button"
                  onClick={() => setMobileNumber('9123456789')}
                  className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 font-mono text-[11px]"
                >
                  9123456789 (Disconnection Threat)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || mobileNumber.length < 10}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Analyze Mobile Identifier</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: ANALYZE PAYMENT MESSAGE (NLP 10-CATEGORY DETECTOR) */}
      {activeTab === 'message' && (
        <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-600 dark:text-blue-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                NLP Payment Message Scam Classifier
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste an SMS, WhatsApp message, or email notification. PayShield classifies messages across 10 distinct scam categories with linguistic phrase highlighting and explainable risk scoring.
            </p>
          </div>

          {/* Real-time Stage Progression Tracker */}
          {isAnalyzingMessage && (
            <AnalysisStages
              stages={MESSAGE_ANALYSIS_STAGES}
              currentStageIndex={messageStageIndex}
            />
          )}

          <form onSubmit={handleAnalyzeMessage} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Message Content / SMS Text
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {messageText.length} characters
                </span>
              </div>

              <textarea
                rows={4}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Paste the suspicious SMS, WhatsApp message, or email here..."
                className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-brand-500 leading-relaxed font-sans shadow-inner"
              />
            </div>

            {/* Presets Grid: 6 Distinct Demo Scenarios */}
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                Quick Test Scenarios (Demo 1 to Demo 6):
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                {(demoMessages.length > 0 ? demoMessages.slice(0, 6) : fallbackPresets).map((preset: any) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setMessageText(preset.text)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-navy-900/50 hover:border-brand-400 dark:hover:border-blue-500 text-left transition-all group"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] group-hover:text-brand-600 dark:group-hover:text-blue-400 truncate">
                      {preset.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {preset.text}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !messageText.trim()}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Inspecting Message Signals...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Analyze Message with NLP</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: BEHAVIOURAL RISK SIMULATION */}
      {activeTab === 'behavioural' && (
        <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Simulated Transaction & Behavioural Risk
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Test how multi-factor contextual combinations (new recipient, amount anomaly, communication channel, emergency claims) combine into a unified risk signal.
            </p>
          </div>

          <form onSubmit={handleAnalyzeBehavioural} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Recipient Identifier
                </label>
                <input
                  type="text"
                  required
                  value={behRecipient}
                  onChange={(e) => setBehRecipient(e.target.value)}
                  placeholder="payee@upi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={behAmount}
                  onChange={(e) => setBehAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Transaction Purpose
                </label>
                <input
                  type="text"
                  value={behPurpose}
                  onChange={(e) => setBehPurpose(e.target.value)}
                  placeholder="Refund / Fee / Purchase"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Is this a new recipient?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBehNewRecipient(true)}
                    className={`py-2 px-3 rounded-lg border font-semibold ${
                      behNewRecipient
                        ? 'bg-blue-50 dark:bg-navy-800 border-brand-600 text-brand-700 dark:text-blue-400'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Yes (New)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBehNewRecipient(false)}
                    className={`py-2 px-3 rounded-lg border font-semibold ${
                      !behNewRecipient
                        ? 'bg-blue-50 dark:bg-navy-800 border-brand-600 text-brand-700 dark:text-blue-400'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    No (Frequent)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  How did you receive the payment request?
                </label>
                <select
                  value={behChannel}
                  onChange={(e) => setBehChannel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Friend/family">Friend or Family</option>
                  <option value="Merchant">Merchant Storefront</option>
                  <option value="SMS">Unsolicited SMS</option>
                  <option value="WhatsApp">WhatsApp Message</option>
                  <option value="Phone call">Cold Phone Call</option>
                  <option value="Social media">Social Media / Telegram</option>
                  <option value="Unknown">Unknown / Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Does sender claim an emergency?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBehEmergency(true)}
                    className={`py-2 px-3 rounded-lg border font-semibold ${
                      behEmergency
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-600 text-red-700 dark:text-red-300'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Yes (Emergency Claimed)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBehEmergency(false)}
                    className={`py-2 px-3 rounded-lg border font-semibold ${
                      !behEmergency
                        ? 'bg-blue-50 dark:bg-navy-800 border-brand-600 text-brand-700 dark:text-blue-400'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Demanding immediate action?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBehUrgency(true)}
                    className={`py-2 px-3 rounded-lg border font-semibold ${
                      behUrgency
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-600 text-amber-700 dark:text-amber-300'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Yes (Urgent Pressure)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBehUrgency(false)}
                    className={`py-2 px-3 rounded-lg border font-semibold ${
                      !behUrgency
                        ? 'bg-blue-50 dark:bg-navy-800 border-brand-600 text-brand-700 dark:text-blue-400'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SlidersHorizontal className="w-4 h-4" />}
              <span>Calculate Explainable Risk Score</span>
            </button>
          </form>
        </div>
      )}

      {/* QR Scanner Modal with Off-Screen Canvas Fix */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onScanComplete={handleQrScanned}
      />

    </div>
  );
};
