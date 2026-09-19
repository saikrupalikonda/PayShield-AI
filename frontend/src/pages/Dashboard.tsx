import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  QrCode, 
  AtSign, 
  Phone, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  PhoneCall, 
  ExternalLink, 
  Activity, 
  FileText,
  Clock,
  ChevronRight,
  RefreshCw,
  Eye
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { api } from '../services/api';
import { RiskAnalysisResult, AwarenessArticle, DetectionHistoryItem } from '../types';
import { DemoScenarioBar } from '../components/common/DemoScenarioBar';
import { QRScannerModal } from '../components/qr/QRScannerModal';

interface DashboardProps {
  onNavigate: (tab: string, contextData?: any) => void;
  onSelectScenario: (result: RiskAnalysisResult) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectScenario }) => {
  const [stats, setStats] = useState<any>(null);
  const [recentDetections, setRecentDetections] = useState<DetectionHistoryItem[]>([]);
  const [articles, setArticles] = useState<AwarenessArticle[]>([]);
  const [news, setNews] = useState<AwarenessArticle[]>([]);
  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);
  const [isRefreshingNews, setIsRefreshingNews] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, histData, artData, newsData] = await Promise.allSettled([
        api.getHistoryStats(),
        api.getHistory(),
        api.getAwarenessArticles(),
        api.getNews(false)
      ]);

      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (histData.status === 'fulfilled') setRecentDetections(histData.value.slice(0, 4));
      if (artData.status === 'fulfilled') setArticles(artData.value.slice(0, 3));
      if (newsData.status === 'fulfilled') setNews(newsData.value.slice(0, 3));
    } catch (err) {
      console.error("Dashboard loading error:", err);
    }
  };

  const handleRefreshNews = async () => {
    setIsRefreshingNews(true);
    try {
      const updatedNews = await api.getNews(true);
      setNews(updatedNews.slice(0, 3));
    } catch (err) {
      console.error("Error refreshing news:", err);
    } finally {
      setIsRefreshingNews(false);
    }
  };

  const handleQrComplete = async (payload: string) => {
    try {
      const result = await api.analyzeRisk({
        identifier: payload,
        identifier_type: 'qr',
        is_new_recipient: true,
        payment_channel: 'QR Scan'
      });
      onSelectScenario(result);
    } catch (err) {
      console.error("QR Analysis error:", err);
      onNavigate('detect');
    }
  };

  return (
    <div className="space-y-10 pb-16">
      
      {/* 1. Demo Mode Bar (Section 37) */}
      <DemoScenarioBar onScenarioLoaded={onSelectScenario} />

      {/* 2. Hero Section (Section 8) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AI-Assisted Payment Interlock</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
              Before You Pay, Let PayShield Take a <span className="text-blue-400">Second Look</span>.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
              Detect social-engineering and authorised-push-payment scam patterns before you authorize a UPI transaction. Protect yourself from accidental-deposit frauds, fake support threats, and coercive payment requests.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('detect')}
                className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>Start Detection</span>
              </button>

              <button
                onClick={() => onNavigate('awareness')}
                className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-semibold flex items-center gap-2 transition-all"
              >
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Learn How Scams Work</span>
              </button>
            </div>
          </div>

          {/* Minimalist Security Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm p-6 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/90 border border-slate-700/80 shadow-inner">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">APP-SCAM-MONITOR</span>
              </div>

              <div className="py-4 space-y-3">
                <div className="p-2.5 rounded-lg bg-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Incoming UPI Intent</span>
                  <span className="font-mono text-blue-300">quick.refund99@paytm</span>
                </div>
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/50 flex items-center justify-between text-xs text-red-300">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>Refund Scam Cue</span>
                  </div>
                  <span className="font-mono font-bold">+25 Risk</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 flex items-center justify-between text-xs text-amber-300">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Urgency Pressure</span>
                  </div>
                  <span className="font-mono font-bold">+20 Risk</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Pre-Payment Interlock</span>
                <span className="font-bold text-red-400">Cooling-Off Triggered</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Value Cards Below Hero (Section 8) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-800/80">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <h3 className="text-sm font-bold text-white mb-1">Real-Time Risk Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-signal contextual inspection of UPI IDs, QR payloads, mobile identifiers, and SMS text cues.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <h3 className="text-sm font-bold text-white mb-1">Explainable Warnings</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent, itemized breakdowns of why each transaction was flagged—no black-box predictions.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <h3 className="text-sm font-bold text-white mb-1">Scam Awareness</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated playbooks on refund deceit, KYC phishing, fake customer support, and official 1930 reporting.
            </p>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 text-center mt-3">
          Demonstration metrics and synthetic pattern intelligence; not live banking statistics.
        </p>
      </section>

      {/* 3. Three Detection Selection Cards (Section 9) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Detect Suspicious Payment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose an input method to evaluate recipient safety before sending money
            </p>
          </div>
          <button
            onClick={() => onNavigate('detect')}
            className="text-xs font-semibold text-brand-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Open Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Scan QR */}
          <div
            onClick={() => setIsQrOpen(true)}
            className="p-6 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-navy-800 text-brand-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>Scan QR Code</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-blue-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Analyze static or dynamic merchant and peer QR codes. Detect hidden debit amounts and malformed URIs.
            </p>
          </div>

          {/* Card 2: Enter UPI ID */}
          <div
            onClick={() => onNavigate('detect', { tab: 'upi' })}
            className="p-6 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-navy-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <AtSign className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>Enter UPI ID</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Verify virtual payment address against PayShield's synthetic complaint intelligence and known scam patterns.
            </p>
          </div>

          {/* Card 3: Enter Mobile Number */}
          <div
            onClick={() => onNavigate('detect', { tab: 'mobile' })}
            className="p-6 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-navy-800 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>Enter Mobile Number</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Check if an unknown caller or SMS sender has accumulated prior complaints in the demonstration dataset.
            </p>
          </div>

        </div>
      </section>

      {/* 4. "How PayShield Protects You" (Detect -> Explain -> Warn -> Decide) */}
      <section className="p-8 rounded-3xl bg-slate-100 dark:bg-navy-850/60 border border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            How PayShield Protects You
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            A frictionless pre-payment interlock replacing blind trust with contextual intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-brand-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Contextual Input</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Scan a QR, paste a UPI handle, or input the message text you received.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-brand-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Explainable Signal</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Calculates 0-100 score and explains plain-language drivers (urgency, refund claim, novelty).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-brand-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Cooling-Off Interlock</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              High-risk patterns activate a 5-second reflection timer and a safety checklist.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-brand-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
              4
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Informed User Decision</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Cancel payment to stop fraud in its tracks, or proceed only after independent verification.
            </p>
          </div>

        </div>
      </section>

      {/* 5. Personal Activity Statistics (Section 22) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Your PayShield Activity
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personal demonstration telemetry (not actual banking records)
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-brand-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Full History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Stat Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Total Analyses</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">
              {stats?.total_analyzed ?? 14}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">High-Risk Signals</span>
            <span className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1 block">
              {stats?.high_risk_count ?? 5}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Payments Stopped</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {stats?.cancelled_count ?? 4}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Warnings Reviewed</span>
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">
              {stats?.warnings_reviewed ?? 9}
            </span>
          </div>
        </div>

        {/* Recharts Analytics Row */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">
            
            {/* Timeline Bar Chart */}
            <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                Analysis Velocity & High-Risk Interventions
              </h3>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.activity_timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0F172A', 
                        borderColor: '#334155', 
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#F8FAFC'
                      }} 
                    />
                    <Bar dataKey="scans" name="Total Scans" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="flags" name="High Risk Flags" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Distribution Pie Chart */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Risk Distribution
              </h3>
              <div className="h-40 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.risk_distribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={58}
                      paddingAngle={4}
                    >
                      {stats.risk_distribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0F172A', 
                        borderColor: '#334155', 
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#F8FAFC'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                {stats.risk_distribution.map((item: any) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                    <span className="truncate">{item.name}: {item.count}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </section>

      {/* 6. Recent Detections Quick List */}
      {recentDetections.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Recent Inspections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentDetections.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectScenario(item.analysis_result)}
                className="p-3.5 rounded-xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="space-y-1 truncate pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-900 dark:text-white truncate">
                      {item.identifier}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-navy-800 text-slate-500 font-medium">
                      {item.detection_type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {item.analysis_result.plain_explanation}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    item.risk_score >= 60
                      ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                      : item.risk_score >= 30
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {item.risk_score}/100
                  </span>
                  <span className="block text-[9px] text-slate-400 mt-1 capitalize">
                    {item.action_taken || 'Analyzed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Community Scam Awareness (Section 23 & 24) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Stay One Step Ahead of Scammers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Curated playbooks on social-engineering techniques and defensive payment habits
            </p>
          </div>
          <button
            onClick={() => onNavigate('awareness')}
            className="text-xs font-semibold text-brand-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Guides</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => onNavigate('awareness', { articleId: art.id })}
              className="p-5 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-brand-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                    {art.category}
                  </span>
                  <span className="text-slate-400">{art.read_time}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {art.short_description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-blue-400">
                <span>Read guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Latest Scam Awareness News (Section 24) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Latest Scam Awareness Updates
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified fraud alerts and payment security bulletins
            </p>
          </div>
          <button
            onClick={handleRefreshNews}
            disabled={isRefreshingNews}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingNews ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {news.map((n) => (
            <div
              key={n.id}
              className="p-5 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{n.source}</span>
                  <span>{n.published_date}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {n.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                  {n.short_description}
                </p>
              </div>

              <div className="pt-2">
                {n.url ? (
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    <span>Read external bulletin</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <button
                    onClick={() => onNavigate('awareness')}
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    <span>Read awareness article</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Cybercrime Complaint Support: "Already Lost Money?" (Section 25) */}
      <section className="p-8 rounded-3xl bg-gradient-to-br from-red-950/70 via-navy-900 to-slate-900 border border-red-800/40 text-white shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Victim Support Helpline</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Already Lost Money to a Digital Fraudster?
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              If you believe you have been a victim of online financial fraud, report it through the official cybercrime reporting channels immediately. Quick action within the "Golden Hour" maximizes the probability that police and banks can freeze the fraudulent account.
            </p>

            {/* Checklist Before Reporting */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-300 mb-1.5">
                Keep these details ready before calling 1930:
              </h4>
              <p className="text-xs text-slate-300 font-mono">
                • Bank Transaction Reference (UTR) & Date/Time &nbsp; • Recipient UPI ID &nbsp; • Sender Phone & Chat Screenshots
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <a
              href="tel:1930"
              className="py-3 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-105"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 1930 Helpline</span>
            </a>

            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <span>National Portal (cybercrime.gov.in)</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={() => onNavigate('awareness')}
              className="text-xs text-slate-300 hover:text-white underline text-center pt-1"
            >
              Learn Step-by-Step Reporting Guide
            </button>
          </div>
        </div>
      </section>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        onScanComplete={handleQrComplete}
      />

    </div>
  );
};
