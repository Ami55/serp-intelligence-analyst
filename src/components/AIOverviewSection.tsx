import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, ExternalLink, Link2, Info, ArrowUpRight } from 'lucide-react';
import { AIOverview, SERPSource } from '../types';

interface AIOverviewSectionProps {
  aiOverview: AIOverview;
  source: SERPSource;
  capturedAt: string;
}

const isProviderIdentifier = (value?: string) =>
  !value || /^(CAES|data:|[A-Za-z0-9_=-]{120,})/.test(value.trim());

const looksLikeDomain = (value?: string) =>
  Boolean(value && value.length < 100 && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value.trim()));

function citationDisplay(citation: AIOverview['citations'][number]) {
  let urlDomain = '';
  try { urlDomain = new URL(citation.url).hostname.replace(/^www\./, ''); } catch { /* Invalid provider URL */ }

  const domain = !isProviderIdentifier(citation.domain) && looksLikeDomain(citation.domain)
    ? citation.domain
    : looksLikeDomain(citation.title)
      ? citation.title!
      : urlDomain || 'Source website';
  const title = !isProviderIdentifier(citation.title) && citation.title !== domain
    ? citation.title!
    : domain;
  const claim = !isProviderIdentifier(citation.supportedClaim)
    ? citation.supportedClaim!
    : 'Referenced as a source in the AI Overview.';

  return { domain, title, claim };
}

export const AIOverviewSection: React.FC<AIOverviewSectionProps> = ({
  aiOverview,
  source,
  capturedAt
}) => {
  const sourceLabel =
    source === 'live-api'
      ? 'Live API'
      : source === 'imported'
      ? 'Imported'
      : 'Demo Data';

  if (!aiOverview.present) {
    return (
      <div id="ai-overview-section" className="bg-slate-900 rounded-xl border border-slate-800 shadow-xs p-6 mb-8">
        <div className="flex items-center space-x-2 text-slate-400 mb-2">
          <Sparkles className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-200">Google AI Overview</h2>
        </div>
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex items-start space-x-3">
          <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-200">No AI Overview Detected</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {aiOverview.statusNote || "Google AI Overview was not triggered for this specific keyword, location, or device configuration."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="ai-overview-section" className="bg-slate-900 rounded-xl border border-indigo-500/30 shadow-xs p-6 mb-8 relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />

      {/* Header & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/80 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-100">Google AI Overview</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center space-x-1 whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3" />
                <span>Present</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generative response observed in SERP • Position #{aiOverview.position || 1}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 whitespace-nowrap">
          <span>Captured: {new Date(capturedAt).toLocaleString()}</span>
          <span>•</span>
          <span>Source: <strong className="text-slate-200">{sourceLabel}</strong></span>
        </div>
      </div>

      {/* Status Note if citations unavailable */}
      {aiOverview.statusNote && (
        <div className="mb-5 p-3.5 bg-amber-950/50 border border-amber-800/80 rounded-lg flex items-start space-x-2.5 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Citation Note</p>
            <p className="mt-0.5 text-amber-300/90">{aiOverview.statusNote}</p>
          </div>
        </div>
      )}

      {/* Answer Summary Bullets */}
      {aiOverview.answerText && (
        <div className="mb-6 bg-slate-950 p-4 rounded-lg border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            AI Overview Generated Summary
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed font-normal mb-3">
            {aiOverview.answerText}
          </p>
          {aiOverview.answerBullets && aiOverview.answerBullets.length > 0 && (
            <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-300 font-medium">
              {aiOverview.answerBullets.map((bullet, idx) => (
                <li key={idx}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Sites Cited Table */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Link2 className="w-4 h-4 text-indigo-400" />
              <span>Sites Cited by AI Overview ({aiOverview.citations.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct source links explicitly provided in the AI Overview response payload.
            </p>
          </div>
        </div>

        {aiOverview.citations.length === 0 ? (
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 text-center">
            No direct citation links returned by the SERP provider for this AI Overview.
          </div>
        ) : (
          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40 divide-y divide-slate-800/80">
            {aiOverview.citations.map((cite, idx) => {
              const display = citationDisplay(cite);
              return (
                <div
                  key={`${cite.url}-${idx}`}
                  className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_auto_auto] gap-3 lg:gap-5 items-center px-4 py-3 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-slate-100 break-words">{display.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate" title={display.domain}>{display.domain}</div>
                  </div>
                  <p className="min-w-0 text-xs leading-relaxed text-slate-300 break-words">{display.claim}</p>
                  <div className="flex lg:block items-center gap-2 whitespace-nowrap">
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 lg:hidden">Organic:</span>
                    {cite.alsoInOrganicTop10 ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                        Top 10 #{cite.organicPosition}
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                        Outside top 10
                      </span>
                    )}
                  </div>
                  <a
                    href={cite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open citation from ${display.domain}`}
                    className="w-8 h-8 rounded-md border border-slate-700 text-slate-400 hover:text-indigo-300 hover:border-indigo-700 inline-flex items-center justify-center transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Brands / Entities Mentioned Table */}
      <div className="mb-8">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <span>Brands, Products & Entities Mentioned ({aiOverview.mentionedEntities.length})</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Named entities in the AI Overview answer. Note: Being named in the text does NOT automatically make a site a cited source.
          </p>
        </div>

        {aiOverview.mentionedEntities.length === 0 ? (
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 text-center">
            No specific brand or product entities extracted.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-2.5 px-3">Mentioned Entity</th>
                  <th scope="col" className="py-2.5 px-3">Type</th>
                  <th scope="col" className="py-2.5 px-3">Context in Answer</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Cited Source Available?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900">
                {aiOverview.mentionedEntities.map((ent, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-100">
                      {ent.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <span className="inline-block px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-medium text-slate-300 whitespace-nowrap">
                        {ent.type || 'Entity'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {ent.context || 'Referenced in answer body.'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {ent.citedSourceAvailable ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 whitespace-nowrap">
                          Cited Source Exists
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800 whitespace-nowrap">
                          Mention Only (Uncited)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Overview Competitive Analysis */}
      {aiOverview.competitiveAnalysis && (
        <div className="p-4 bg-indigo-950/40 rounded-lg border border-indigo-800/60 text-xs">
          <h4 className="font-bold text-indigo-300 mb-1 flex items-center space-x-1.5 text-xs uppercase tracking-wider">
            <ArrowUpRight className="w-4 h-4 text-indigo-400" />
            <span>AI Overview Citation Competitive Analysis</span>
          </h4>
          <p className="text-slate-300 mb-3">
            Of the <strong className="text-white">{aiOverview.competitiveAnalysis.totalCitedSites}</strong> cited sources,{' '}
            <strong className="text-white">{aiOverview.competitiveAnalysis.citedInOrganicTop10Count}</strong> also rank in the organic Top 10, while{' '}
            <strong className="text-white">{aiOverview.competitiveAnalysis.citedOutsideOrganicTop10Count}</strong> gained AI Overview visibility without holding a top organic spot.
          </p>
          <div className="font-semibold text-slate-200 mb-1">Opportunities to become citable:</div>
          <ul className="list-disc pl-4 space-y-1 text-slate-300">
            {aiOverview.competitiveAnalysis.opportunitiesToBecomeCitable.map((opp, i) => (
              <li key={i}>{opp}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
