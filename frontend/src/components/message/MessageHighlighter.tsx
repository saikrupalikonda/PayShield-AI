import React from 'react';
import { DetectedPhrase } from '../../types';

interface MessageHighlighterProps {
  message: string;
  phrases: DetectedPhrase[];
}

export const MessageHighlighter: React.FC<MessageHighlighterProps> = ({ message, phrases }) => {
  // Determine color scheme based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Urgency & Pressure':
        return {
          bg: 'bg-amber-100 dark:bg-amber-950/70',
          text: 'text-amber-950 dark:text-amber-200',
          border: 'border-b-2 border-amber-500',
          badge: 'bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700',
          name: 'Urgency & Pressure',
        };
      case 'Fake Authority & Threat':
      case 'Fake Tech Support & Impersonation':
        return {
          bg: 'bg-purple-100 dark:bg-purple-950/70',
          text: 'text-purple-950 dark:text-purple-200',
          border: 'border-b-2 border-purple-500',
          badge: 'bg-purple-200/80 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700',
          name: 'Impersonation & Threat',
        };
      case 'Accidental Refund Scam':
      case 'OTP & Credential Theft':
      case 'KYC & Account Suspension':
      case 'Deceptive Payment Instruction':
        return {
          bg: 'bg-red-100 dark:bg-red-950/70',
          text: 'text-red-950 dark:text-red-200',
          border: 'border-b-2 border-red-500',
          badge: 'bg-red-200/80 dark:bg-red-900/60 text-red-900 dark:text-red-200 border-red-300 dark:border-red-700',
          name: 'Financial & Credential Threat',
        };
      case 'Reward & Cashback Lure':
      case 'Investment & Part-Time Job Scam':
      case 'Delivery & Customs Fee Scam':
      default:
        return {
          bg: 'bg-blue-100 dark:bg-blue-950/70',
          text: 'text-blue-950 dark:text-blue-200',
          border: 'border-b-2 border-blue-500',
          badge: 'bg-blue-200/80 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700',
          name: 'Rewards & Lures',
        };
    }
  };

  // Build segments from message and non-overlapping phrases
  const renderHighlightedMessage = () => {
    if (!phrases || phrases.length === 0) {
      return <span>{message}</span>;
    }

    // Sort phrases by start_index
    const sorted = [...phrases].sort((a, b) => a.start_index - b.start_index);

    // Merge or deduplicate overlaps
    const nonOverlapping: DetectedPhrase[] = [];
    let lastEnd = 0;

    for (const p of sorted) {
      if (p.start_index >= lastEnd && p.end_index <= message.length && p.start_index < p.end_index) {
        nonOverlapping.push(p);
        lastEnd = p.end_index;
      }
    }

    const elements: React.ReactNode[] = [];
    let currentIndex = 0;

    nonOverlapping.forEach((p, idx) => {
      // Plain text before match
      if (p.start_index > currentIndex) {
        elements.push(
          <span key={`plain-${currentIndex}`}>
            {message.substring(currentIndex, p.start_index)}
          </span>
        );
      }

      // Highlighted phrase
      const colors = getCategoryColor(p.category);
      const matchedText = message.substring(p.start_index, p.end_index);

      elements.push(
        <mark
          key={`match-${idx}`}
          title={`${p.category} (+${p.score_contribution} risk signal)`}
          className={`relative group inline-block font-semibold px-1 py-0.5 rounded cursor-help mx-0.5 ${colors.bg} ${colors.text} ${colors.border}`}
        >
          {matchedText}
          <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-30 px-2 py-1 rounded bg-slate-900 text-white text-[10px] whitespace-nowrap shadow-lg">
            {p.category} (+{p.score_contribution})
          </span>
        </mark>
      );

      currentIndex = p.end_index;
    });

    // Remainder of text
    if (currentIndex < message.length) {
      elements.push(
        <span key={`plain-${currentIndex}`}>
          {message.substring(currentIndex)}
        </span>
      );
    }

    return elements;
  };

  // Find unique categories present in matched phrases
  const activeCategories = Array.from(new Set(phrases.map((p) => p.category)));

  return (
    <div className="space-y-3">
      {/* Category Legend */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-200 dark:border-slate-800 text-[11px]">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1">
          Signal Highlights:
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-medium bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Financial / OTP / Refund
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Urgency & Pressure
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-medium bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          Impersonation & Threat
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-medium bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Rewards & Lures
        </span>
      </div>

      {/* Message Content Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 text-sm leading-relaxed text-slate-900 dark:text-slate-100 font-normal selection:bg-brand-500 selection:text-white shadow-inner">
        {renderHighlightedMessage()}
      </div>

      {activeCategories.length > 0 && (
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span>Matched categories:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {activeCategories.join(' • ')}
          </span>
        </div>
      )}
    </div>
  );
};
