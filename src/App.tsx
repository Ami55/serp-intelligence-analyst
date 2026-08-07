/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { SearchControls } from './components/SearchControls';
import { TopSummary } from './components/TopSummary';
import { CurrentSerpTable } from './components/CurrentSerpTable';
import { AIOverviewSection } from './components/AIOverviewSection';
import { SerpFeaturesTable } from './components/SerpFeaturesTable';
import { SearchIntentSection } from './components/SearchIntentSection';
import { ContentRecommendationsSection } from './components/ContentRecommendationsSection';
import { CompareSnapshotSection } from './components/CompareSnapshotSection';
import { PasteUploadModal } from './components/PasteUploadModal';
import { SERPSnapshot, AnalysisReport, SerpQueryParams } from './types';
import { DEMO_SNAPSHOT, DEMO_ANALYSIS } from './data/demoData';
import { saveSnapshotToHistory } from './utils/history';
import { AlertCircle, Sparkles, RefreshCw, KeyRound, Info, Upload } from 'lucide-react';

export default function App() {
  const [queryParams, setQueryParams] = useState<SerpQueryParams>({
    keyword: 'project management software',
    location: 'United States',
    language: 'English',
    device: 'desktop',
    searchEngine: 'Google'
  });

  const [snapshot, setSnapshot] = useState<SERPSnapshot | null>(null);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'analyzing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isPasteUploadOpen, setIsPasteUploadOpen] = useState(false);

  // Request ID tracking for race condition protection
  const requestIdRef = useRef(0);

  /**
   * CRITICAL RULE:
   * The moment ANY of the five query fields changes, immediately clear current organic results,
   * clear AI Overview, clear analysis report, and reset status to 'idle'.
   */
  const handleQueryParamChange = (param: keyof SerpQueryParams, value: string) => {
    setQueryParams(prev => ({
      ...prev,
      [param]: value
    }));

    // Instantly wipe old SERP data & analysis report
    setSnapshot(null);
    setAnalysisReport(null);
    setErrorMessage(null);
    setErrorCode(null);
    setStatus('idle');
  };

  /**
   * Live SERP Fetch and AI Analysis Pipeline
   */
  const handleFetchSerp = async () => {
    const currentKeyword = queryParams.keyword.trim();
    if (!currentKeyword) return;

    // Generate unique request ID
    requestIdRef.current += 1;
    const thisRequestId = requestIdRef.current;

    // Clear previous results & set loading
    setSnapshot(null);
    setAnalysisReport(null);
    setErrorMessage(null);
    setErrorCode(null);
    setStatus('loading');

    try {
      // Step 1: Fetch Live SERP data from server endpoint
      const serpRes = await fetch('/api/serp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: currentKeyword,
          location: queryParams.location,
          language: queryParams.language,
          device: queryParams.device,
          searchEngine: queryParams.searchEngine,
          requestId: thisRequestId
        })
      });

      const serpData = await serpRes.json();

      // Race condition protection: Discard response if a newer request was dispatched!
      if (requestIdRef.current !== thisRequestId) {
        console.warn(`[Race Protection] Discarded older response for request ID #${thisRequestId}`);
        return;
      }

      if (!serpRes.ok || serpData.error) {
        setStatus('error');
        setErrorMessage(serpData.error || 'Failed to retrieve live SERP data.');
        setErrorCode(serpData.code || 'SERP_FETCH_ERROR');
        return; // NEVER substitute demo data on error!
      }

      const fetchedSnapshot: SERPSnapshot = serpData.snapshot;
      setSnapshot(fetchedSnapshot);
      saveSnapshotToHistory(fetchedSnapshot);
      setStatus('analyzing');

      // Step 2: Trigger AI Intelligence Analysis using Gemini endpoint
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshot: fetchedSnapshot,
          currentQuery: queryParams,
          requestId: thisRequestId
        })
      });

      const analyzeData = await analyzeRes.json();

      // Race condition protection check
      if (requestIdRef.current !== thisRequestId) {
        console.warn(`[Race Protection] Discarded older analysis response for request ID #${thisRequestId}`);
        return;
      }

      if (!analyzeRes.ok || analyzeData.error) {
        // SERP snapshot remains visible, but report generation flagged an error
        setStatus('success'); // keep SERP displayed
        setErrorMessage(analyzeData.error || 'SERP loaded, but AI Analysis failed.');
        return;
      }

      setAnalysisReport(analyzeData.report);
      setStatus('success');
    } catch (err: any) {
      if (requestIdRef.current === thisRequestId) {
        setStatus('error');
        setErrorMessage(err.message || 'An unexpected network error occurred.');
      }
    }
  };

  /**
   * Explicit Demo Data Loader
   */
  const handleLoadDemoData = () => {
    // Increment request ID to cancel any pending async fetches
    requestIdRef.current += 1;

    setQueryParams({
      keyword: DEMO_SNAPSHOT.keyword,
      location: DEMO_SNAPSHOT.location,
      language: DEMO_SNAPSHOT.language,
      device: DEMO_SNAPSHOT.device,
      searchEngine: DEMO_SNAPSHOT.searchEngine
    });

    setSnapshot(DEMO_SNAPSHOT);
    saveSnapshotToHistory(DEMO_SNAPSHOT);
    setAnalysisReport(DEMO_ANALYSIS);
    setErrorMessage(null);
    setErrorCode(null);
    setStatus('success');
  };

  /**
   * Paste or Uploaded Data Handler
   */
  const handleImportSnapshot = async (importedSnapshot: SERPSnapshot) => {
    requestIdRef.current += 1;
    const thisRequestId = requestIdRef.current;

    setQueryParams({
      keyword: importedSnapshot.keyword,
      location: importedSnapshot.location,
      language: importedSnapshot.language,
      device: importedSnapshot.device,
      searchEngine: importedSnapshot.searchEngine
    });

    setSnapshot(importedSnapshot);
    saveSnapshotToHistory(importedSnapshot);
    setErrorMessage(null);
    setErrorCode(null);
    setStatus('analyzing');

    try {
      // Analyze imported snapshot
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshot: importedSnapshot,
          currentQuery: {
            keyword: importedSnapshot.keyword,
            location: importedSnapshot.location,
            language: importedSnapshot.language,
            device: importedSnapshot.device,
            searchEngine: importedSnapshot.searchEngine
          },
          requestId: thisRequestId
        })
      });

      const analyzeData = await analyzeRes.json();
      if (requestIdRef.current !== thisRequestId) return;

      if (analyzeRes.ok && analyzeData.report) {
        setAnalysisReport(analyzeData.report);
      }
      setStatus('success');
    } catch {
      setStatus('success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Controls */}
        <SearchControls
          queryParams={queryParams}
          onQueryParamChange={handleQueryParamChange}
          onFetchSerp={handleFetchSerp}
          onOpenPasteUpload={() => setIsPasteUploadOpen(true)}
          onLoadDemoData={handleLoadDemoData}
          isLoading={status === 'loading' || status === 'analyzing'}
        />

        {/* Status Loading Banners */}
        {status === 'loading' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center shadow-xs mb-8">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-100">
              Retrieving SERP data for '{queryParams.keyword}'…
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Querying SerpApi live provider ({queryParams.location}, {queryParams.device})...
            </p>
          </div>
        )}

        {status === 'analyzing' && (
          <div className="bg-slate-900 rounded-xl border border-indigo-500/30 p-8 text-center shadow-xs mb-8">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-100">
              Analyzing SERP layout with Gemini AI…
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Extracting search intent, competitor patterns, and content recommendations...
            </p>
          </div>
        )}

        {/* Error States */}
        {status === 'error' && errorMessage && (
          <div className="bg-slate-900 rounded-xl border border-rose-900/60 p-6 shadow-xs mb-8">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-lg bg-rose-950/60 text-rose-400 flex items-center justify-center shrink-0 border border-rose-800/50">
                {errorCode === 'NO_API_KEY' ? <KeyRound className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-rose-200">
                  {errorCode === 'NO_API_KEY' ? 'SERP API Key Not Configured' : 'SERP Retrieval Failed'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {errorMessage}
                </p>

                {errorCode === 'NO_API_KEY' && (
                  <div className="mt-4 p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 space-y-2">
                    <p className="font-semibold text-slate-200">How to configure your SERP API key:</p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                      <li>Open <code className="text-indigo-300 font-mono">server/serp.ts</code> and set <code className="text-indigo-300 font-mono">HARDCODED_SERP_API_KEY = "YOUR_SERPAPI_KEY"</code></li>
                      <li>Or set the environment variable <code className="text-indigo-300 font-mono">SERPAPI_KEY</code> in <code className="text-indigo-300 font-mono">.env.example</code> / AI Studio Secrets</li>
                      <li>You can also click "Paste / Upload SERP" or "Load Demo Data" to test immediately without a key.</li>
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <button
                    onClick={() => setIsPasteUploadOpen(true)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md border border-slate-700 flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Paste / Upload SERP</span>
                  </button>
                  <button
                    onClick={handleLoadDemoData}
                    className="px-3.5 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold rounded-md border border-indigo-800/80 flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Load Demo Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Initial Empty State */}
        {status === 'idle' && !snapshot && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center shadow-xs my-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/60 mx-auto flex items-center justify-center mb-4">
              <Info className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              Ready for SERP Intelligence Analysis
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
              Enter a keyword and retrieve live SERP data, or paste/upload an existing SERP export.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleFetchSerp}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap"
              >
                Analyze "{queryParams.keyword}"
              </button>
              <button
                type="button"
                onClick={handleLoadDemoData}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg transition-colors border border-slate-700 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Load Demo Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Unified SERP Intelligence Report Output */}
        {snapshot && (
          <div>
            {/* Top-of-report summary findings */}
            {analysisReport && (
              <TopSummary summary={analysisReport.topSummary} />
            )}

            {/* Section 2: Current Organic Results */}
            <CurrentSerpTable snapshot={snapshot} />

            {/* Section 3: AI Overview */}
            <AIOverviewSection
              aiOverview={snapshot.aiOverview}
              source={snapshot.source}
              capturedAt={snapshot.capturedAt}
            />

            {/* Section 4: Other SERP Features */}
            <SerpFeaturesTable features={snapshot.features} />

            {/* Section 5: Search Intent Analysis */}
            {analysisReport && (
              <SearchIntentSection searchIntent={analysisReport.searchIntent} />
            )}

            {/* Section 6: Competitive Content Recommendations */}
            {analysisReport && (
              <ContentRecommendationsSection recommendations={analysisReport.contentRecommendations} />
            )}

            {/* Section 7: Compare With an Earlier SERP (Collapsed by default) */}
            <CompareSnapshotSection currentSnapshot={snapshot} />
          </div>
        )}
      </main>

      <PasteUploadModal
        isOpen={isPasteUploadOpen}
        onClose={() => setIsPasteUploadOpen(false)}
        onImportSnapshot={handleImportSnapshot}
        currentKeyword={queryParams.keyword}
      />
    </div>
  );
}
