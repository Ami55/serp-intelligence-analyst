import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowUpDown, Plus, AlertTriangle, Sparkles, RefreshCw, History, Calendar, Trash2 } from 'lucide-react';
import { SERPSnapshot } from '../types';
import { calculateMovement } from '../utils/movement';
import { DEMO_PREVIOUS_SNAPSHOT } from '../data/demoData';
import { getHistoryForKeyword, deleteSnapshotFromHistory } from '../utils/history';

interface CompareSnapshotSectionProps {
  currentSnapshot: SERPSnapshot;
}

export const CompareSnapshotSection: React.FC<CompareSnapshotSectionProps> = ({ currentSnapshot }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previousSnapshot, setPreviousSnapshot] = useState<SERPSnapshot | null>(null);
  const [historyList, setHistoryList] = useState<SERPSnapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>('');
  const [pasteInput, setPasteInput] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);

  // Load history list for the current keyword whenever currentSnapshot changes
  useEffect(() => {
    const historicalSnapshots = getHistoryForKeyword(currentSnapshot.keyword);
    
    // Exclude current snapshot (by capturedAt) from available prior comparison list
    const priorSnapshots = historicalSnapshots.filter(
      s => s.capturedAt !== currentSnapshot.capturedAt
    );

    setHistoryList(priorSnapshots);

    // Auto-select the most recent prior snapshot if available and no previous snapshot manually picked
    if (priorSnapshots.length > 0) {
      setPreviousSnapshot(priorSnapshots[0]);
      setSelectedSnapshotId(priorSnapshots[0].capturedAt);
    } else if (currentSnapshot.keyword === DEMO_PREVIOUS_SNAPSHOT.keyword) {
      // Default to demo prior if keywords match
      setPreviousSnapshot(DEMO_PREVIOUS_SNAPSHOT);
      setSelectedSnapshotId('demo');
    } else {
      setPreviousSnapshot(null);
      setSelectedSnapshotId('');
    }
  }, [currentSnapshot]);

  const handleSelectHistoryOption = (capturedAtId: string) => {
    setSelectedSnapshotId(capturedAtId);
    if (capturedAtId === 'demo') {
      setPreviousSnapshot(DEMO_PREVIOUS_SNAPSHOT);
    } else if (capturedAtId === '') {
      setPreviousSnapshot(null);
    } else {
      const found = historyList.find(s => s.capturedAt === capturedAtId);
      if (found) {
        setPreviousSnapshot(found);
      }
    }
  };

  const handleLoadDemoPrevious = () => {
    setPreviousSnapshot(DEMO_PREVIOUS_SNAPSHOT);
    setSelectedSnapshotId('demo');
    setParseError(null);
    setShowInputModal(false);
  };

  const handleParsePaste = () => {
    setParseError(null);
    if (!pasteInput.trim()) {
      setParseError('Please paste valid SERP snapshot JSON.');
      return;
    }

    try {
      const parsed = JSON.parse(pasteInput);
      if (!parsed.keyword || !Array.isArray(parsed.organicResults)) {
        throw new Error('Invalid SERP snapshot format. Missing keyword or organicResults array.');
      }

      setPreviousSnapshot(parsed as SERPSnapshot);
      setSelectedSnapshotId('custom_pasted');
      setShowInputModal(false);
      setPasteInput('');
    } catch (err: any) {
      setParseError(`Failed to parse snapshot JSON: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.keyword || !Array.isArray(parsed.organicResults)) {
          throw new Error('Invalid SERP snapshot file format.');
        }
        setPreviousSnapshot(parsed as SERPSnapshot);
        setSelectedSnapshotId('custom_file');
        setShowInputModal(false);
        setParseError(null);
      } catch (err: any) {
        setParseError(`Failed to parse uploaded JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteHistoryItem = (capturedAt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSnapshotFromHistory(capturedAt);
    const updated = historyList.filter(s => s.capturedAt !== capturedAt);
    setHistoryList(updated);
    if (selectedSnapshotId === capturedAt) {
      if (updated.length > 0) {
        setPreviousSnapshot(updated[0]);
        setSelectedSnapshotId(updated[0].capturedAt);
      } else {
        setPreviousSnapshot(null);
        setSelectedSnapshotId('');
      }
    }
  };

  const movementData = previousSnapshot ? calculateMovement(previousSnapshot, currentSnapshot) : null;

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Prior Period';
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div id="compare-snapshot-section" className="bg-slate-900 rounded-xl border border-slate-800 shadow-xs mb-8 overflow-hidden">
      {/* Header Button (Collapsible) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 text-left flex items-center justify-between bg-slate-900 hover:bg-slate-800/80 transition-colors cursor-pointer border-b border-slate-800"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/80 flex items-center justify-center">
            <ArrowUpDown className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>7. Compare With an Earlier SERP</span>
              {historyList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {historyList.length} Saved Period{historyList.length > 1 ? 's' : ''}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {previousSnapshot
                ? `Comparing current SERP vs prior period (${formatDate(previousSnapshot.capturedAt)})`
                : 'Automatically saves past searches so you can compare current rankings with previous periods'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {previousSnapshot && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800 whitespace-nowrap">
              Comparison Active
            </span>
          )}
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-6">
          {/* Historical Period Selector Control */}
          <div className="mb-6 p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2.5">
              <History className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Select Benchmark Period for Comparison
                </span>
                <span className="text-[11px] text-slate-400">
                  Choose from automatically preserved past SERP searches or upload an external export
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedSnapshotId}
                onChange={(e) => handleSelectHistoryOption(e.target.value)}
                className="bg-slate-900 text-xs font-medium text-slate-200 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-xs"
              >
                <option value="">-- Select Prior SERP Period --</option>
                {historyList.map((item, idx) => (
                  <option key={item.capturedAt || idx} value={item.capturedAt}>
                    {formatDate(item.capturedAt)} ({item.source === 'live-api' ? 'Live SERP' : 'Imported'})
                  </option>
                ))}
                <option value="demo">Demo Benchmark Snapshot</option>
              </select>

              <button
                type="button"
                onClick={() => setShowInputModal(true)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg border border-slate-700 flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                title="Upload or paste custom prior SERP JSON"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Add Snapshot</span>
              </button>
            </div>
          </div>

          {!previousSnapshot ? (
            <div className="bg-slate-950 border border-dashed border-slate-800 rounded-xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/80 mx-auto flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-100">No Prior SERP Benchmark Selected</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5 leading-relaxed">
                Future searches for <span className="font-semibold text-slate-200">"{currentSnapshot.keyword}"</span> will be automatically saved here to enable instant position tracking over time. You can also upload or select a prior period benchmark.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowInputModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload / Paste Prior SERP</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadDemoPrevious}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg transition-colors border border-slate-700 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Use Demo Benchmark</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Active Comparison Sub-Header */}
              <div className="mb-5 p-3.5 bg-indigo-950/40 border border-indigo-800/60 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2 text-indigo-200">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    Comparing Current ({formatDate(currentSnapshot.capturedAt)}) vs Benchmark Period (<strong>{formatDate(previousSnapshot.capturedAt)}</strong>)
                  </span>
                </div>
                {selectedSnapshotId !== 'demo' && selectedSnapshotId !== 'custom_pasted' && selectedSnapshotId !== 'custom_file' && selectedSnapshotId && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteHistoryItem(selectedSnapshotId, e)}
                    className="text-slate-400 hover:text-rose-400 font-medium text-[11px] flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                    title="Delete this historical snapshot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Snapshot</span>
                  </button>
                )}
              </div>

              {/* Snapshot Metadata Warning if locations differ */}
              {(previousSnapshot.location !== currentSnapshot.location || previousSnapshot.device !== currentSnapshot.device) && (
                <div className="mb-5 p-3.5 bg-amber-950/50 border border-amber-800/80 rounded-lg flex items-start space-x-2 text-xs text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Query Parameter Discrepancy</p>
                    <p className="mt-0.5 text-amber-300/90">
                      The prior snapshot uses location <strong>"{previousSnapshot.location}"</strong> ({previousSnapshot.device}), while current query uses <strong>"{currentSnapshot.location}"</strong> ({currentSnapshot.device}). Movement insights reflect these parameter differences.
                    </p>
                  </div>
                </div>
              )}

              {/* Movement Summary Metrics */}
              {movementData && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Significant Movers (3+ pos)</span>
                      <span className="text-xl font-bold text-indigo-300 mt-1 block">
                        {movementData.summary.moversCount}
                      </span>
                    </div>

                    <div className="bg-emerald-950/40 p-3.5 rounded-lg border border-emerald-800/80">
                      <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">New Top 10 Entrants</span>
                      <span className="text-xl font-bold text-emerald-200 mt-1 block">
                        {movementData.summary.newEntrantsCount}
                      </span>
                    </div>

                    <div className="bg-rose-950/40 p-3.5 rounded-lg border border-rose-800/80">
                      <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider block">Dropped Off Top 10</span>
                      <span className="text-xl font-bold text-rose-200 mt-1 block">
                        {movementData.summary.dropOffsCount}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">AI Overview Change</span>
                      <span className="text-xs font-semibold text-slate-200 mt-1 block line-clamp-2">
                        {movementData.summary.aiOverviewChanges}
                      </span>
                    </div>
                  </div>

                  {/* Strategic Implications */}
                  <div className="mb-6 p-4 bg-indigo-950/40 rounded-lg border border-indigo-800/60 text-xs">
                    <h4 className="font-bold text-indigo-300 mb-2 uppercase tracking-wider text-[11px]">
                      Strategic Implications of Ranking Movement
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      {movementData.summary.strategicImplications.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Movement Table */}
                  <div className="overflow-x-auto border border-slate-800 rounded-lg mb-4">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800 uppercase tracking-wider">
                        <tr>
                          <th scope="col" className="py-2.5 px-3">Domain / Title</th>
                          <th scope="col" className="py-2.5 px-3 text-center">Prev Pos</th>
                          <th scope="col" className="py-2.5 px-3 text-center">Current Pos</th>
                          <th scope="col" className="py-2.5 px-3 text-center">Change</th>
                          <th scope="col" className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 bg-slate-900">
                        {movementData.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-100">{item.domainOrUrl}</div>
                              {item.title && <div className="text-[11px] text-slate-400 line-clamp-1">{item.title}</div>}
                            </td>
                            <td className="py-2.5 px-3 text-center font-medium text-slate-400 whitespace-nowrap">
                              {item.previousPosition ? `#${item.previousPosition}` : 'Unranked'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-100 whitespace-nowrap">
                              {item.currentPosition ? `#${item.currentPosition}` : 'Dropped'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold whitespace-nowrap">
                              {item.change > 0 ? (
                                <span className="text-emerald-400">+{item.change}</span>
                              ) : item.change < 0 ? (
                                <span className="text-rose-400">{item.change}</span>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {item.status === 'moved_up' && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 whitespace-nowrap">
                                  Moved Up
                                </span>
                              )}
                              {item.status === 'moved_down' && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800 whitespace-nowrap">
                                  Moved Down
                                </span>
                              )}
                              {item.status === 'new_entry' && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-800 whitespace-nowrap">
                                  New Entry
                                </span>
                              )}
                              {item.status === 'dropped_off' && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 whitespace-nowrap">
                                  Dropped Off
                                </span>
                              )}
                              {item.status === 'url_replaced' && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-800 whitespace-nowrap">
                                  URL Replaced
                                </span>
                              )}
                              {item.status === 'unchanged' && (
                                <span className="text-slate-500 text-[11px] whitespace-nowrap">Unchanged</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviousSnapshot(null);
                        setSelectedSnapshotId('');
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Clear Benchmark Selection</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Input Modal for Prior Snapshot */}
      {showInputModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-800">
            <h3 className="text-base font-bold text-slate-100 mb-1">
              Add Prior SERP Snapshot
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Paste SERP JSON export or upload a file representing earlier rankings.
            </p>

            {parseError && (
              <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-lg text-xs">
                {parseError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Upload SERP JSON File
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-950 file:text-indigo-300 hover:file:bg-indigo-900 border border-slate-800 rounded-lg p-1 bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Or Paste Raw JSON Snapshot
                </label>
                <textarea
                  value={pasteInput}
                  onChange={(e) => setPasteInput(e.target.value)}
                  placeholder='{"keyword": "...", "organicResults": [...]}'
                  rows={5}
                  className="w-full p-2.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 mt-5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowInputModal(false)}
                className="px-3.5 py-1.5 text-slate-400 hover:text-slate-200 text-xs font-medium cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleParsePaste}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
              >
                Load Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
