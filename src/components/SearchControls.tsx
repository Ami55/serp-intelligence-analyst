import React from 'react';
import { Search, Upload, Sparkles, Monitor, Smartphone, Globe, MapPin } from 'lucide-react';
import { SerpQueryParams } from '../types';

interface SearchControlsProps {
  queryParams: SerpQueryParams;
  onQueryParamChange: (param: keyof SerpQueryParams, value: string) => void;
  onFetchSerp: () => void;
  onOpenPasteUpload: () => void;
  onLoadDemoData: () => void;
  isLoading: boolean;
}

export const SearchControls: React.FC<SearchControlsProps> = ({
  queryParams,
  onQueryParamChange,
  onFetchSerp,
  onOpenPasteUpload,
  onLoadDemoData,
  isLoading
}) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryParams.keyword.trim() || isLoading) return;
    onFetchSerp();
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xs p-5 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Keyword Search Row */}
        <div>
          <label htmlFor="keyword-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Target Keyword <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              id="keyword-input"
              type="text"
              value={queryParams.keyword}
              onChange={(e) => onQueryParamChange('keyword', e.target.value)}
              placeholder="e.g. project management software, things to do in Vancouver..."
              className="w-full pl-10 pr-4 py-2.5 text-slate-100 text-sm bg-slate-950 border border-slate-700/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Location */}
          <div>
            <label htmlFor="location-select" className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location / Country
            </label>
            <select
              id="location-select"
              value={queryParams.location}
              onChange={(e) => onQueryParamChange('location', e.target.value)}
              className="w-full px-3 py-1.5 text-xs text-slate-200 bg-slate-950 border border-slate-700/80 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Japan">Japan</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language-select" className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" /> Language
            </label>
            <select
              id="language-select"
              value={queryParams.language}
              onChange={(e) => onQueryParamChange('language', e.target.value)}
              className="w-full px-3 py-1.5 text-xs text-slate-200 bg-slate-950 border border-slate-700/80 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
          </div>

          {/* Device */}
          <div>
            <label htmlFor="device-select" className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
              {queryParams.device === 'mobile' ? (
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
              )}
              Device
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-0.5 rounded-md border border-slate-700/80">
              <button
                type="button"
                onClick={() => onQueryParamChange('device', 'desktop')}
                className={`py-1 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${
                  queryParams.device === 'desktop'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3 h-3" /> Desktop
              </button>
              <button
                type="button"
                onClick={() => onQueryParamChange('device', 'mobile')}
                className={`py-1 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${
                  queryParams.device === 'mobile'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3 h-3" /> Mobile
              </button>
            </div>
          </div>

          {/* Search Engine */}
          <div>
            <label htmlFor="engine-select" className="block text-xs font-medium text-slate-400 mb-1">
              Search Engine
            </label>
            <input
              id="engine-select"
              type="text"
              disabled
              value="Google"
              className="w-full px-3 py-1.5 text-xs text-slate-500 bg-slate-950/60 border border-slate-800 rounded-md cursor-not-allowed"
            />
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              disabled={isLoading || !queryParams.keyword.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-medium text-sm rounded-lg transition-colors shadow-xs flex items-center space-x-2 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Retrieving SERP data for '{queryParams.keyword}'…</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Get SERP Data</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenPasteUpload}
              disabled={isLoading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-lg transition-colors border border-slate-700 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <Upload className="w-4 h-4 text-slate-400" />
              <span>Paste or Upload SERP Data</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onLoadDemoData}
            disabled={isLoading}
            className="px-3.5 py-2 text-slate-300 hover:text-amber-300 font-medium text-xs rounded-lg transition-colors border border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-950/60 hover:bg-slate-800 flex items-center space-x-1.5 cursor-pointer ml-auto whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Demo Data</span>
          </button>
        </div>
      </form>
    </div>
  );
};
