import React from 'react';
import { Target, CheckCircle2, Layout, HelpCircle } from 'lucide-react';
import { SearchIntentAnalysis } from '../types';

interface SearchIntentSectionProps {
  searchIntent: SearchIntentAnalysis;
}

export const SearchIntentSection: React.FC<SearchIntentSectionProps> = ({ searchIntent }) => {
  return (
    <div id="search-intent-section" className="bg-slate-900 rounded-xl border border-slate-800 shadow-xs p-6 mb-8">
      <div className="pb-4 mb-5 border-b border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          User & Behavioral Intelligence
        </span>
        <h2 className="text-lg font-bold text-slate-100 mt-0.5 flex items-center space-x-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <span>Search Intent & Expectations Analysis</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Primary Intent */}
        <div className="bg-indigo-950/60 p-4 rounded-lg border border-indigo-800/80">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block mb-1">
            Primary Intent
          </span>
          <div className="text-base font-bold text-indigo-100">
            {searchIntent.primaryIntent}
          </div>
        </div>

        {/* Secondary Intent */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Secondary Intent
          </span>
          <div className="text-base font-bold text-slate-200">
            {searchIntent.secondaryIntent}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence from Rankings */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Ranking Evidence & Observations</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {searchIntent.evidence.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2 bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dominant Format & Expectations */}
        <div className="space-y-4">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              <Layout className="w-4 h-4 text-indigo-400" />
              <span>Dominant Result Format</span>
            </div>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {searchIntent.dominantFormat}
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>User Expectations & Mindset</span>
            </div>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {searchIntent.userExpectations}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
