import React from 'react';
import { Search, Cpu, Database } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-100 tracking-tight leading-none">
              SERP Intelligence Analyst
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Unified Search Engine Results & AI Overview Intelligence
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Server-side GenAI</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>SerpApi Provider</span>
          </div>
        </div>
      </div>
    </header>
  );
};
