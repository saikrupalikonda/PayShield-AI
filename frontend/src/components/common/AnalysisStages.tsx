import React from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

export interface StageItem {
  id: string;
  label: string;
  description?: string;
}

interface AnalysisStagesProps {
  stages: StageItem[];
  currentStageIndex: number;
  completed?: boolean;
}

export const AnalysisStages: React.FC<AnalysisStagesProps> = ({
  stages,
  currentStageIndex,
  completed = false,
}) => {
  return (
    <div className="py-3 px-4 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {completed ? 'Analysis Complete' : 'AI Inspection In Progress'}
      </div>
      <div className="space-y-2">
        {stages.map((stage, idx) => {
          const isDone = completed || idx < currentStageIndex;
          const isCurrent = !completed && idx === currentStageIndex;

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-2.5 text-xs transition-colors duration-200 ${
                isDone
                  ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                  : isCurrent
                  ? 'text-brand-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-600 dark:text-blue-400" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
                )}
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span>{stage.label}</span>
                {stage.description && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                    {stage.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
