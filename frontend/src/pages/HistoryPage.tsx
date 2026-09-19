import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  ShieldAlert, 
  ShieldCheck, 
  Loader2,
  Calendar,
  XCircle,
  CheckCircle2,
  MessageSquare,
  QrCode,
  ThumbsUp,
  Tag
} from 'lucide-react';
import { api } from '../services/api';
import { DetectionHistoryItem, RiskAnalysisResult, MessageDetectionRecord, MessageAnalysisResponse } from '../types';
import { formatISTTimestamp, formatRelativeISTTimestamp, parseTimestampToMs } from '../utils/date';

interface HistoryPageProps {
  onViewReport: (result: RiskAnalysisResult) => void;
  onViewMessageReport?: (result: MessageAnalysisResponse) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onViewReport, onViewMessageReport }) => {
  const [activeHistoryTab, setActiveHistoryTab] = useState<'payments' | 'messages'>('payments');
  const [history, setHistory] = useState<DetectionHistoryItem[]>([]);
  const [messageHistory, setMessageHistory] = useState<MessageDetectionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    if (activeHistoryTab === 'payments') {
      fetchPaymentHistory();
    } else {
      fetchMessageHistory();
    }
  }, [activeHistoryTab, search, riskFilter, typeFilter]);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory({
        search: search.trim() || undefined,
        risk_level: riskFilter !== 'ALL' ? riskFilter : undefined,
        detection_type: typeFilter !== 'ALL' ? typeFilter : undefined,
      });
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessageHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getMessageDetections();
      setMessageHistory(data);
    } catch (err) {
      console.error('Failed to fetch message history:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortedPaymentHistory = [...history].sort((a, b) => {
    const tA = parseTimestampToMs(a.timestamp);
    const tB = parseTimestampToMs(b.timestamp);
    return sortOrder === 'desc' ? tB - tA : tA - tB;
  });

  const sortedMessageHistory = [...messageHistory]
    .filter((m) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        m.message_category.toLowerCase().includes(q) ||
        m.message_preview.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const tA = parseTimestampToMs(a.timestamp);
      const tB = parseTimestampToMs(b.timestamp);
      return sortOrder === 'desc' ? tB - tA : tA - tB;
    });


  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Detection History & Activity Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review previous risk evaluations, QR scans, and NLP scam message classifications.
        </p>
      </div>

      {/* Sub-Tabs: Payment Identifiers vs Message Detections */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveHistoryTab('payments')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-xl border-b-2 flex items-center gap-2 transition-all ${
            activeHistoryTab === 'payments'
              ? 'border-brand-600 text-brand-600 dark:text-blue-400 bg-blue-50/50 dark:bg-navy-800/60 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>UPI & QR Payment Identifiers ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveHistoryTab('messages')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-xl border-b-2 flex items-center gap-2 transition-all ${
            activeHistoryTab === 'messages'
              ? 'border-brand-600 text-brand-600 dark:text-blue-400 bg-blue-50/50 dark:bg-navy-800/60 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Scam Message Detections ({messageHistory.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeHistoryTab === 'payments'
                ? 'Search by identifier or reason...'
                : 'Search by category or message text...'
            }
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {activeHistoryTab === 'payments' && (
            <>
              {/* Risk Level Filter */}
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW RISK SIGNAL">Low Risk (0-29)</option>
                <option value="MODERATE RISK SIGNAL">Moderate (30-59)</option>
                <option value="HIGH RISK SIGNAL">High Risk (60-79)</option>
                <option value="VERY HIGH RISK SIGNAL">Very High (80-100)</option>
              </select>

              {/* Detection Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="ALL">All Types</option>
                <option value="UPI">UPI ID</option>
                <option value="QR">QR Code</option>
                <option value="MOBILE">Mobile</option>
                <option value="SMS_TEXT">Message / SMS</option>
              </select>
            </>
          )}

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Toggle sort order"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* History Content */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
          <p className="text-xs text-slate-500">Loading detection records...</p>
        </div>
      ) : activeHistoryTab === 'payments' ? (
        // Tab 1: Payments Table
        sortedPaymentHistory.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <History className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">No Detection Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria or run a detection on the Workbench.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-navy-900 text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Identifier / Target</th>
                    <th className="p-4">Risk Score</th>
                    <th className="p-4">Risk Signal</th>
                    <th className="p-4">Action Taken</th>
                    <th className="p-4 text-right">Inspection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedPaymentHistory.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition-colors"
                    >
                      <td className="p-4 font-mono whitespace-nowrap" title={formatISTTimestamp(item.timestamp)}>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {formatRelativeISTTimestamp(item.timestamp)}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          {formatISTTimestamp(item.timestamp)}
                        </div>
                      </td>


                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.detection_type}
                        </span>
                      </td>

                      <td className="p-4 font-mono font-medium text-slate-900 dark:text-white max-w-[200px] truncate">
                        {item.identifier}
                      </td>

                      <td className="p-4 font-bold font-mono text-slate-900 dark:text-white">
                        {item.risk_score}/100
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.risk_score >= 60
                              ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                              : item.risk_score >= 30
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {item.risk_level}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium capitalize ${
                            item.action_taken === 'cancelled' || item.action_taken === 'cooling_off_cancelled'
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                              : item.action_taken === 'confirmed'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {item.action_taken === 'cancelled' || item.action_taken === 'cooling_off_cancelled' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : null}
                          {item.action_taken || 'Analyzed'}
                        </span>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onViewReport(item.analysis_result)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                          title="View full report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        // Tab 2: Message Detections Table
        sortedMessageHistory.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">No Message Records Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Analyze an SMS or message in the Risk Detection Workbench to view results here.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-navy-900 text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Scam Category</th>
                    <th className="p-4">Message Preview</th>
                    <th className="p-4">Risk Score</th>
                    <th className="p-4">Community Feedback</th>
                    <th className="p-4 text-right">View Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedMessageHistory.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition-colors"
                    >
                      <td className="p-4 font-mono whitespace-nowrap" title={formatISTTimestamp(item.timestamp)}>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {formatRelativeISTTimestamp(item.timestamp)}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          {formatISTTimestamp(item.timestamp)}
                        </div>
                      </td>


                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {item.message_category}
                        </span>
                      </td>

                      <td className="p-4 text-slate-800 dark:text-slate-200 max-w-[280px] truncate">
                        {item.message_preview}
                      </td>

                      <td className="p-4 font-bold font-mono text-slate-900 dark:text-white whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            item.risk_score >= 60
                              ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                              : item.risk_score >= 30
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {item.risk_score}/100
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {item.user_feedback ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <ThumbsUp className="w-3 h-3" />
                              Helpful: {item.user_feedback.was_helpful || 'Yes'}
                            </span>
                            {item.user_feedback.reported === 'Yes' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                Reported: 1930
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            No feedback yet
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        {onViewMessageReport && item.analysis_result ? (
                          <button
                            onClick={() => onViewMessageReport(item.analysis_result)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                            title="View NLP analysis"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

    </div>
  );
};
