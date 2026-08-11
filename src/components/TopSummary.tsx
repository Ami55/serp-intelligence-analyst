import React from 'react';
import { Target, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { TopReportSummary } from '../types';

interface TopSummaryProps {
  summary: TopReportSummary;
}

export const TopSummary: React.FC<TopSummaryProps> = ({ summary }) => {
  return (
    <div className="bg-slate-900 text-white rounded-xl shadow-sm p-6 mb-8 border border-slate-800">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Executive Briefing
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
            Key SERP Findings & Strategic Overview
          </h2>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium whitespace-nowrap">
          Top 4 Findings
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Finding 1: Dominant Intent */}
        <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Target className="w-4 h-4 shrink-0" />
              <span>1. Dominant Search Intent</span>
            </div>
            <p className="text-sm font-medium text-slate-100 leading-snug">
              {summary.dominantIntent}
            </p>
          </div>
        </div>

        {/* Finding 2: Competitor Pattern */}
        <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4 shrink-0" />
              <span>2. Competitor Pattern</span>
            </div>
            <p className="text-sm font-medium text-slate-100 leading-snug">
              {summary.competitorPattern}
            </p>
          </div>
        </div>

        {/* Finding 3: AI Overview Opportunity */}
        <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>3. AI Overview Opportunity</span>
            </div>
            <p className="text-sm font-medium text-slate-100 leading-snug">
              {summary.aiOverviewOpportunity}
            </p>
          </div>
        </div>

        {/* Finding 4: Recommended Action */}
        <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>4. Priority Action</span>
            </div>
            <p className="text-sm font-medium text-slate-100 leading-snug">
              {summary.recommendedAction}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
