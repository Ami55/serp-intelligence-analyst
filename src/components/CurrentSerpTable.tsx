import React from 'react';
import { ExternalLink, Database, Globe, Smartphone, Monitor, ShieldCheck } from 'lucide-react';
import { SERPSnapshot } from '../types';

interface CurrentSerpTableProps {
  snapshot: SERPSnapshot;
}

export const CurrentSerpTable: React.FC<CurrentSerpTableProps> = ({ snapshot }) => {
  const sourceLabel =
    snapshot.source === 'live-api'
      ? 'Live SERP API'
      : snapshot.source === 'imported'
      ? 'Imported SERP File'
      : 'Demo Data — Not Live Results';

  const sourceBadgeColor =
    snapshot.source === 'live-api'
      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
      : snapshot.source === 'imported'
      ? 'bg-blue-950/80 text-blue-300 border-blue-800'
      : 'bg-amber-950/80 text-amber-300 border-amber-800';

  return (
    <div id="current-serp-section" className="bg-slate-900 rounded-xl border border-slate-800 shadow-xs mb-8 overflow-hidden">
      {/* Header & Metadata Bar */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                SERP Observation
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${sourceBadgeColor}`}>
                {sourceLabel}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-1">
              Current Organic Results: "{snapshot.keyword}"
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-1 whitespace-nowrap">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{snapshot.location} ({snapshot.language})</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center space-x-1 whitespace-nowrap">
              {snapshot.device === 'mobile' ? (
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="capitalize">{snapshot.device}</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center space-x-1 whitespace-nowrap">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Captured {new Date(snapshot.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* Counts summary */}
        <div className="mt-3 flex items-center space-x-4 text-xs font-medium text-slate-400 pt-2 border-t border-slate-800/80">
          <div>
            Organic Results: <span className="font-bold text-slate-200">{snapshot.organicResults.length}</span>
          </div>
          <span>•</span>
          <div>
            SERP Features Detected: <span className="font-bold text-slate-200">{snapshot.features.length}</span>
          </div>
          <span>•</span>
          <div>
            AI Overview: <span className="font-bold text-slate-200">{snapshot.aiOverview.present ? 'Present' : 'Not Present'}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-3 px-4 w-16 text-center">Pos</th>
              <th scope="col" className="py-3 px-4">Title & Snippet</th>
              <th scope="col" className="py-3 px-4 w-40">Domain</th>
              <th scope="col" className="py-3 px-4 w-32">Result Type</th>
              <th scope="col" className="py-3 px-4 w-12 text-center">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900">
            {snapshot.organicResults.map((res) => (
              <tr key={`${res.position}-${res.domain}`} className="hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-4 text-center font-bold text-slate-100">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold">
                    #{res.position}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-indigo-300 text-sm leading-snug">
                    {res.title}
                  </div>
                  {res.snippet && (
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {res.snippet}
                    </p>
                  )}
                </td>
                <td className="py-3 px-4 font-mono text-slate-300 font-medium whitespace-nowrap">
                  {res.domain}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                    {res.resultType || 'Organic'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-slate-400 hover:text-indigo-400 inline-block transition-colors"
                    title={`Open ${res.url}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
