import React from 'react';
import { Sparkles, CheckSquare, BookOpen, Trophy, ShieldCheck, ListOrdered } from 'lucide-react';
import { ContentRecommendations } from '../types';

interface ContentRecommendationsSectionProps {
  recommendations: ContentRecommendations;
}

export const ContentRecommendationsSection: React.FC<ContentRecommendationsSectionProps> = ({ recommendations }) => {
  return (
    <div id="content-recommendations-section" className="bg-slate-900 rounded-xl border border-slate-800 shadow-xs p-6 mb-8">
      <div className="pb-4 mb-5 border-b border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Content Blueprint
        </span>
        <h2 className="text-lg font-bold text-slate-100 mt-0.5 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>Competitive Content Recommendations</span>
        </h2>
      </div>

      {/* Page Type Header */}
      <div className="mb-6 bg-slate-950 border border-slate-800 text-white p-4 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Recommended Target Page Architecture
          </span>
          <div className="text-lg font-bold text-white mt-0.5">
            {recommendations.recommendedPageType}
          </div>
        </div>
        <div className="px-3 py-1 bg-indigo-950/80 rounded-lg border border-indigo-800 text-xs font-medium text-indigo-300 self-start sm:self-center whitespace-nowrap">
          Tailored to Top Rankings
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Required Sections */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-1.5">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            <span>Required Page Sections</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300 font-medium">
            {recommendations.requiredSections.map((sec, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{sec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Essential Topics */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Core Topics & Sub-queries</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300 font-medium">
            {recommendations.topicsToCover.map((topic, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Feature Opportunities */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>SERP Feature Tactics</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300 font-medium">
            {recommendations.featureOpportunities.map((opp, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{opp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Differentiators */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Competitive Differentiators</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300 font-medium">
            {recommendations.competitiveDifferentiators.map((diff, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>{diff}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* E-E-A-T */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>E-E-A-T & Trust Requirements</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300 font-medium">
            {recommendations.eeatRequirements.map((eeat, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{eeat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top 3 Priority Actions */}
        <div className="bg-indigo-950/60 p-4 rounded-lg border border-indigo-800/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-3 flex items-center space-x-1.5">
            <ListOrdered className="w-4 h-4 text-indigo-400" />
            <span>Top 3 Priority Execution Steps</span>
          </h3>
          <ol className="space-y-2 text-xs text-slate-200 font-semibold list-decimal list-inside">
            {recommendations.topActions.slice(0, 3).map((act, idx) => (
              <li key={idx} className="leading-snug">
                <span className="font-medium text-slate-200">{act}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};
