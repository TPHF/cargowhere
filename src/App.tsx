/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Carpark, APIConfig, DataSource } from './types/carpark';
import { fetchCarparkData } from './services/ltaApi';
import { TopNav } from './components/TopNav';
import { CarparkMap } from './components/CarparkMap';
import { CarparkList } from './components/CarparkList';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { BackendIntegrationModal } from './components/BackendIntegrationModal';
import { RateEstimator } from './components/RateEstimator';
import { Server, MapPin, Car, Shield, RefreshCw, AlertCircle, Compass, Radio } from 'lucide-react';

const DEFAULT_CONFIG: APIConfig = {
  source: 'serverless_api',
  accountKey: '',
  proxyUrl: '/api/carparkavailability',
  refreshIntervalSeconds: 30,
  autoRefresh: true,
  simulateFluctuation: true,
};

export default function App() {
  const [carparks, setCarparks] = useState<Carpark[]>([]);
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'estimator'>('map');
  const [isBackendHubOpen, setIsBackendHubOpen] = useState(false);
  const [config, setConfig] = useState<APIConfig>(() => {
    try {
      const saved = localStorage.getItem('sg_carpark_config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sg_carpark_favorites');
      return saved ? JSON.parse(saved) : ['1_C', '10_C', '40_C']; // Suntec, ION, Jewel default
    } catch {
      return ['1_C', '10_C', '40_C'];
    }
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(config.refreshIntervalSeconds);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Store previous lots map to calculate trends (+/-)
  const previousDataMapRef = useRef<Map<string, number>>(new Map());

  // Save config to localStorage
  const handleSaveConfig = (newConfig: APIConfig) => {
    setConfig(newConfig);
    setCountdown(newConfig.refreshIntervalSeconds);
    try {
      localStorage.setItem('sg_carpark_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Could not save config to localStorage', e);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('sg_carpark_favorites', JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save favorites', e);
      }
      return next;
    });
  };

  // Core Data Fetcher
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    setErrorMessage(null);

    const result = await fetchCarparkData(
      config,
      userLocation,
      previousDataMapRef.current
    );

    if (result.error) {
      setErrorMessage(result.error);
    } else {
      setErrorMessage(null);
    }

    setCarparks(result.carparks);

    // Update reference map for next diff calculation
    const map = new Map<string, number>();
    result.carparks.forEach((c) => {
      map.set(c.id, c.availableLots);
    });
    previousDataMapRef.current = map;

    const now = new Date();
    setLastSyncTime(
      now.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    setCountdown(config.refreshIntervalSeconds);
    setIsRefreshing(false);
  }, [config, userLocation]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh timer countdown & polling
  useEffect(() => {
    if (!config.autoRefresh) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadData();
          return config.refreshIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [config.autoRefresh, config.refreshIntervalSeconds, loadData]);

  // Request browser geolocation
  const handleRequestUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setIsLocating(false);
        // re-fetch data with distance calculation
        loadData();
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        // Fallback to Singapore central location if denied
        setUserLocation({ lat: 1.3521, lng: 103.8198 });
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Test connection for backend hub modal
  const handleTestConnection = async () => {
    const res = await fetchCarparkData(config, userLocation);
    if (res.error) {
      return { success: false, message: res.error };
    }
    return {
      success: true,
      message: `Successfully connected! Received ${res.rawCount} carpark records.`,
      count: res.rawCount,
    };
  };

  // Aggregated KPIs
  const totalAvailableLots = carparks.reduce((sum, c) => sum + c.availableLots, 0);
  const totalCarparks = carparks.length;
  const criticalCarparks = carparks.filter((c) => c.status === 'limited' || c.status === 'full').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Bar */}
      <TopNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenBackendHub={() => setIsBackendHubOpen(true)}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Workspace Kicker & Live Status Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Singapore Land Transport Authority</span>
              <span aria-hidden="true">·</span>
              <span>DataMall API v2</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{totalCarparks} Carpark Locations</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Real-Time Carpark Lot Availability
            </h1>
          </div>

          {/* Telemetry metadata: No pill boxes, clean typographic separators */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="font-medium text-slate-800">
                {config.source === 'serverless_api'
                  ? 'Serverless (/api)'
                  : config.source === 'workshop_simulation'
                  ? 'Workshop Simulator'
                  : config.source === 'custom_proxy'
                  ? 'Backend Proxy'
                  : 'LTA Direct'}
              </span>
            </div>

            <span aria-hidden="true" className="text-slate-300">·</span>

            <div className="flex items-center gap-1">
              <span className="text-slate-500">Synced:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                {lastSyncTime || 'Pending'}
              </span>
            </div>

            {config.autoRefresh && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Next sync in:</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-800">
                    {countdown}s
                  </span>
                </div>
              </>
            )}

            <button
              onClick={() => setIsBackendHubOpen(true)}
              className="ml-1 text-blue-600 hover:text-blue-800 font-medium underline-offset-2 hover:underline"
            >
              Configure API
            </button>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Notice:</span> {errorMessage}
              </div>
            </div>
            <button
              onClick={() => setIsBackendHubOpen(true)}
              className="text-amber-800 font-semibold underline shrink-0 hover:text-amber-950"
            >
              Open API Hub
            </button>
          </div>
        )}

        {/* 4-Metric KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Total Available Lots</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {totalAvailableLots.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across all monitored sectors</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Monitored Facilities</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {totalCarparks}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">LTA, HDB &amp; URA car parks</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Filling Fast / Full</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 mt-1">
              {criticalCarparks}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">&lt;15 lots remaining</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Your Starred Facilities</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {favorites.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Saved for quick access</div>
          </div>
        </div>

        {/* Tab Switcher for Mobile / Sub-views */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'map'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Map View
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Carpark Directory
          </button>
          <button
            onClick={() => setActiveTab('estimator')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'estimator'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Parking Fee Calculator
          </button>
        </div>

        {/* Active Tab View */}
        {activeTab === 'map' && (
          <CarparkMap
            carparks={carparks}
            selectedCarpark={selectedCarpark}
            onSelectCarpark={setSelectedCarpark}
            userLocation={userLocation}
            onRequestUserLocation={handleRequestUserLocation}
            isLocating={isLocating}
            onRefresh={loadData}
            isRefreshing={isRefreshing}
          />
        )}

        {activeTab === 'list' && (
          <CarparkList
            carparks={carparks}
            selectedCarpark={selectedCarpark}
            onSelectCarpark={setSelectedCarpark}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSwitchToMap={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'estimator' && (
          <RateEstimator
            carparks={carparks}
            selectedCarpark={selectedCarpark}
            onSelectCarpark={setSelectedCarpark}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            Data sourced in accordance with Singapore Land Transport Authority (LTA) DataMall Open Data License.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBackendHubOpen(true)}
              className="text-slate-700 hover:text-slate-900 font-medium underline-offset-2 hover:underline"
            >
              Developer Integration Guide
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <a
              href="https://datamall.lta.gov.sg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 hover:text-slate-900 font-medium underline-offset-2 hover:underline"
            >
              LTA DataMall Portal
            </a>
          </div>
        </div>
      </footer>

      {/* Carpark Detail Drawer / Modal */}
      <CarparkDetailModal
        carpark={selectedCarpark}
        onClose={() => setSelectedCarpark(null)}
        allCarparks={carparks}
        onSelectCarpark={setSelectedCarpark}
        isFavorite={selectedCarpark ? favorites.includes(selectedCarpark.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Workshop Backend Hub Modal */}
      <BackendIntegrationModal
        isOpen={isBackendHubOpen}
        onClose={() => setIsBackendHubOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onTestConnection={handleTestConnection}
      />
    </div>
  );
}
