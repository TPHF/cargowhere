import React from 'react';
import { RefreshCw, Server, MapPin } from 'lucide-react';

interface TopNavProps {
  activeTab: 'map' | 'list' | 'estimator';
  onSelectTab: (tab: 'map' | 'list' | 'estimator') => void;
  onOpenBackendHub: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenBackendHub,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-[1100] flex items-center justify-between gap-8 px-6 py-4 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('map');
        }}
        className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-700 transition-colors"
      >
        SG ParkLive
      </a>

      {/* Zone 2: 4-5 concise single-line text navigation links */}
      <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => onSelectTab('map')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'map' ? 'text-slate-900 border-b-2 border-slate-900 font-semibold' : ''
          }`}
        >
          Live Map
        </button>
        <button
          onClick={() => onSelectTab('list')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'list' ? 'text-slate-900 border-b-2 border-slate-900 font-semibold' : ''
          }`}
        >
          Carpark Directory
        </button>
        <button
          onClick={() => onSelectTab('estimator')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'estimator' ? 'text-slate-900 border-b-2 border-slate-900 font-semibold' : ''
          }`}
        >
          Fee Calculator
        </button>
        <button
          onClick={onOpenBackendHub}
          className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 text-slate-600 flex items-center gap-1.5"
        >
          <span>API Hub</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 disabled:opacity-75"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>
    </header>
  );
};
