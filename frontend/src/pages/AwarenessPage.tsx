import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  RotateCcw, 
  Headphones, 
  FileWarning, 
  TrendingUp, 
  QrCode, 
  PhoneCall, 
  ExternalLink, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  RefreshCw, 
  AlertOctagon, 
  ShieldAlert, 
  Clock 
} from 'lucide-react';
import { api } from '../services/api';
import { AwarenessArticle } from '../types';

interface AwarenessPageProps {
  initialArticleId?: string;
}

export const AwarenessPage: React.FC<AwarenessPageProps> = ({ initialArticleId }) => {
  const [articles, setArticles] = useState<AwarenessArticle[]>([]);
  const [news, setNews] = useState<AwarenessArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<AwarenessArticle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshingNews, setIsRefreshingNews] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [artData, newsData] = await Promise.all([
        api.getAwarenessArticles(),
        api.getNews(false)
      ]);
      setArticles(artData);
      setNews(newsData);

      if (initialArticleId) {
        const match = artData.find((a) => a.id === initialArticleId);
        if (match) setSelectedArticle(match);
      }
    } catch (err) {
      console.error("Awareness data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshNews = async () => {
    setIsRefreshingNews(true);
    try {
      const updatedNews = await api.getNews(true);
      setNews(updatedNews);
    } catch (err) {
      console.error("Error refreshing news:", err);
    } finally {
      setIsRefreshingNews(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'RotateCcw': return <RotateCcw className="w-5 h-5" />;
      case 'Headphones': return <Headphones className="w-5 h-5" />;
      case 'FileWarning': return <FileWarning className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      case 'QrCode': return <QrCode className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Payment Fraud & Scam Awareness
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Master the psychological manipulation techniques used in Authorised Push Payment scams.
        </p>
      </div>

      {/* Cybercrime Helpline Banner (Section 25) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-900/90 via-navy-900 to-slate-900 text-white border border-red-500/30 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>National Cyber Fraud Response</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Reported an Unauthorized Transfer or Loss?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              If you have been tricked into transferring money, dial <strong>1930</strong> immediately. Reporting within the "golden hour" helps authorities freeze beneficiary bank accounts before cash withdrawal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="tel:1930"
              className="py-3 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-105"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 1930 Helpline</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 5 Curated Awareness Guides (Section 23) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Essential Scam Playbooks
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="p-6 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-brand-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                    {art.category}
                  </span>
                  <span className="text-slate-400">{art.read_time}</span>
                </div>

                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-navy-800 text-brand-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {getIcon(art.icon)}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {art.short_description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-blue-400">
                <span>Read Full Article</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Real-Time Scam Awareness News (Section 24) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Latest Scam Awareness Bulletins
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified security updates and newly emerged social-engineering patterns
            </p>
          </div>

          <button
            onClick={handleRefreshNews}
            disabled={isRefreshingNews}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingNews ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {news.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{item.source}</span>
                  <span>{item.published_date}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                  {item.short_description}
                </p>
              </div>

              <div className="pt-2">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    <span>Read bulletin</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <button
                    onClick={() => setSelectedArticle(item)}
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    <span>Read article</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pre-Reporting Evidence Checklist (Section 25) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Pre-Reporting Checklist for Victims
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Gather these evidentiary items before filing your official report on cybercrime.gov.in or calling 1930:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">1. Transaction ID</span>
            <span className="text-slate-500 text-[11px]">12-digit UTR reference from your bank SMS or debit statement.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">2. Exact Timestamps</span>
            <span className="text-slate-500 text-[11px]">Date, hour, and minute when the transfer authorization occurred.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">3. Recipient Identifiers</span>
            <span className="text-slate-500 text-[11px]">Beneficiary UPI ID, phone number, or QR code image scanned.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">4. Chat & SMS Evidence</span>
            <span className="text-slate-500 text-[11px]">Unedited screenshots of WhatsApp, SMS, or caller numbers.</span>
          </div>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-800 dark:text-amber-200 font-semibold text-center">
          "Never share your UPI PIN, OTP, password or CVV with anyone—including police officers or bank personnel."
        </div>
      </section>

      {/* Article Detail Modal Reader */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-navy-850 to-slate-900 text-white flex items-start justify-between border-b border-slate-800">
              <div className="space-y-1 pr-6">
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                  {selectedArticle.category} • {selectedArticle.published_date}
                </span>
                <h3 className="font-bold text-lg leading-snug">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 overflow-y-auto text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
              <p className="font-medium text-slate-900 dark:text-white text-sm sm:text-base border-b border-slate-100 dark:border-slate-800 pb-4">
                {selectedArticle.short_description}
              </p>
              
              <div className="prose dark:prose-invert max-w-none whitespace-pre-line">
                {selectedArticle.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-navy-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Source: {selectedArticle.source || 'PayShield Security Research'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
              >
                Close Article
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
