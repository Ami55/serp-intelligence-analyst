import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { SERPSnapshot } from '../types';

interface PasteUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSnapshot: (snapshot: SERPSnapshot) => void;
  currentKeyword: string;
}

export const PasteUploadModal: React.FC<PasteUploadModalProps> = ({
  isOpen,
  onClose,
  onImportSnapshot,
  currentKeyword
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [rawText, setRawText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const parseAndImport = (content: string) => {
    setErrorMsg(null);
    if (!content.trim()) {
      setErrorMsg('Please paste raw SERP text or JSON data.');
      return;
    }

    try {
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch {
        // If not valid JSON, create a custom snapshot from raw text lines
        const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
        const organicResults = lines.map((line, idx) => {
          let url = line.startsWith('http') ? line : `https://${line.replace(/^\d+[\.\)]\s*/, '')}`;
          let domain = 'example.com';
          try {
            domain = new URL(url).hostname.replace(/^www\./, '');
          } catch {
            domain = line.split('/')[0] || 'domain.com';
          }
          return {
            position: idx + 1,
            title: line.length > 60 ? line.substring(0, 60) + '...' : line,
            url,
            domain,
            snippet: `Imported organic result line: "${line}"`,
            resultType: 'Imported Result'
          };
        });

        parsed = {
          keyword: currentKeyword.trim() || 'Imported Keyword',
          location: 'United States',
          language: 'English',
          device: 'desktop',
          searchEngine: 'Google',
          organicResults,
          aiOverview: {
            present: false,
            citations: [],
            mentionedEntities: []
          },
          features: []
        };
      }

      if (!parsed.keyword) {
        parsed.keyword = currentKeyword.trim() || 'Imported Query';
      }

      if (!Array.isArray(parsed.organicResults)) {
        throw new Error('Data must contain an organicResults array or list of ranking URLs.');
      }

      const snapshot: SERPSnapshot = {
        keyword: parsed.keyword,
        location: parsed.location || 'United States',
        language: parsed.language || 'English',
        device: parsed.device || 'desktop',
        searchEngine: parsed.searchEngine || 'Google',
        capturedAt: new Date().toISOString(),
        organicResults: parsed.organicResults,
        aiOverview: parsed.aiOverview || { present: false, citations: [], mentionedEntities: [] },
        features: parsed.features || [],
        source: 'imported' // Crucial: source is imported, NEVER live-api
      };

      onImportSnapshot(snapshot);
      onClose();
    } catch (err: any) {
      setErrorMsg(`Parsing Error: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseAndImport(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-800">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Paste or Upload SERP Data
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Import external SERP exports (JSON, CSV, or line-separated result URLs).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-lg text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Import Failed</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        <div className="flex border-b border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'paste'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Paste Text or JSON
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload File (.json / .csv)
          </button>
        </div>

        {activeTab === 'paste' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Raw SERP Data / URLs / JSON
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste SERP JSON output or line-separated URLs..."
              rows={8}
              className="w-full p-3 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 placeholder:text-slate-600"
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center bg-slate-950/50">
            <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-200 mb-1">
              Select a file from your computer
            </p>
            <p className="text-[11px] text-slate-400 mb-4">
              Supports .json or .csv files containing SERP results.
            </p>
            <input
              type="file"
              accept=".json,.csv,.txt"
              onChange={handleFileUpload}
              className="mx-auto block text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 mt-5 border-t border-slate-800">
          <div className="text-[11px] text-slate-400">
            Imported data is clearly tagged <strong className="text-slate-200">source: imported</strong>.
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            {activeTab === 'paste' && (
              <button
                type="button"
                onClick={() => parseAndImport(rawText)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Parse & Load Report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
