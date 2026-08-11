import React from 'react';
import { Layers, CheckCircle2 } from 'lucide-react';
import { SERPFeature } from '../types';

interface SerpFeaturesTableProps {
  features: SERPFeature[];
}

export const SerpFeaturesTable: React.FC<SerpFeaturesTableProps> = ({ features }) => {
  const detectedFeatures = features.filter(f => f.present);

  return (
    <div id="serp-features-section" className="bg-slate-900 rounded-xl border border-slate-800 shadow-xs p-6 mb-8">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            SERP Footprint
          </span>
          <h2 className="text-lg font-bold text-slate-100 mt-0.5 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Detected SERP Features ({detectedFeatures.length})</span>
          </h2>
        </div>
      </div>

      {detectedFeatures.length === 0 ? (
        <div className="p-4 bg-slate-950 rounded-lg text-xs text-slate-400 text-center border border-slate-800">
          No secondary SERP features detected for this query.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-2.5 px-4">SERP Feature</th>
                <th scope="col" className="py-2.5 px-4 text-center">Present?</th>
                <th scope="col" className="py-2.5 px-4 text-center">Observed Position</th>
                <th scope="col" className="py-2.5 px-4">Key Details</th>
                <th scope="col" className="py-2.5 px-4">Optimization Opportunity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900">
              {detectedFeatures.map((feat, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-100 whitespace-nowrap">
                    {feat.type}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 whitespace-nowrap">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Yes</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-200 whitespace-nowrap">
                    {feat.position ? `#${feat.position}` : 'Top of page'}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {typeof feat.details === 'string'
                      ? feat.details
                      : JSON.stringify(feat.details)}
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-medium bg-slate-950/40">
                    {feat.opportunity || 'Optimize content structure for inclusion.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
