import React, { useState } from 'react';
import { Carpark, VehicleFilter, AgencyFilter, StatusFilter, SortOption } from '../types/carpark';
import { Search, MapPin, Navigation, Star, ArrowUpRight, TrendingUp, TrendingDown, Minus, Filter, ArrowUpDown } from 'lucide-react';

interface CarparkListProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSwitchToMap: () => void;
}

export const CarparkList: React.FC<CarparkListProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  favorites,
  onToggleFavorite,
  onSwitchToMap,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>('ALL');
  const [agencyFilter, setAgencyFilter] = useState<AgencyFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('lots_desc');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Filter logic
  const filtered = carparks.filter((c) => {
    if (onlyFavorites && !favorites.includes(c.id)) return false;
    if (vehicleFilter !== 'ALL' && c.lotType !== vehicleFilter) return false;
    if (agencyFilter !== 'ALL' && c.agency !== agencyFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (regionFilter !== 'ALL' && c.region !== regionFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q) ||
        c.carparkId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'lots_desc') return b.availableLots - a.availableLots;
    if (sortBy === 'lots_asc') return a.availableLots - b.availableLots;
    if (sortBy === 'distance_asc') {
      const distA = a.distanceKm ?? 999;
      const distB = b.distanceKm ?? 999;
      return distA - distB;
    }
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    return 0;
  });

  const regions = ['ALL', 'Central', 'Orchard', 'Marina', 'East', 'West', 'North', 'North-East', 'Sentosa'];

  return (
    <div className="w-full space-y-4">
      {/* Controls Container */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Top Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by carpark name, area, or lot ID (e.g., Suntec, Orchard, VivoCity)..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="lots_desc">Most Available Lots</option>
              <option value="lots_asc">Fewest Available Lots</option>
              <option value="distance_asc">Nearest (GPS Distance)</option>
              <option value="name_asc">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Vehicle Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Vehicle:</span>
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
              {(['ALL', 'C', 'Y', 'H'] as VehicleFilter[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setVehicleFilter(type)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    vehicleFilter === type
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type === 'ALL' ? 'All' : type === 'C' ? 'Cars' : type === 'Y' ? 'Bikes' : 'Heavy'}
                </button>
              ))}
            </div>
          </div>

          {/* Agency Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Agency:</span>
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
              {(['ALL', 'LTA', 'HDB', 'URA'] as AgencyFilter[]).map((agency) => (
                <button
                  key={agency}
                  onClick={() => setAgencyFilter(agency)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    agencyFilter === agency
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {agency}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Availability:</span>
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('abundant')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === 'abundant' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Plenty (&gt;50)
              </button>
              <button
                onClick={() => setStatusFilter('limited')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === 'limited' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Limited (&lt;15)
              </button>
            </div>
          </div>

          {/* Favorites Only Toggle */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
              onlyFavorites
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
            <span>Starred ({favorites.length})</span>
          </button>
        </div>

        {/* Region Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs text-slate-400 shrink-0">Region:</span>
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setRegionFilter(reg)}
              className={`px-2.5 py-0.5 text-xs rounded-md whitespace-nowrap transition-colors ${
                regionFilter === reg
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {reg === 'ALL' ? 'All Regions' : reg}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <span className="font-semibold text-slate-800 font-mono tabular-nums">{sorted.length}</span> carparks
        </div>
        <div className="flex items-center gap-3">
          <span>Click any card for full rates &amp; trends</span>
        </div>
      </div>

      {/* Carpark Cards Grid */}
      {sorted.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No carparks found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing vehicle filters, or switching region tabs.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setVehicleFilter('ALL');
              setAgencyFilter('ALL');
              setStatusFilter('ALL');
              setRegionFilter('ALL');
              setOnlyFavorites(false);
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map((carpark) => {
            const isFav = favorites.includes(carpark.id);
            const lotPercent = Math.min(100, Math.round((carpark.availableLots / carpark.totalCapacity) * 100));

            let statusLabel = 'Abundant lots';
            let statusTextColor = 'text-emerald-700';
            let barColor = 'bg-emerald-500';
            if (carpark.status === 'moderate') {
              statusLabel = 'Filling up';
              statusTextColor = 'text-amber-700';
              barColor = 'bg-amber-500';
            } else if (carpark.status === 'limited') {
              statusLabel = 'Almost full';
              statusTextColor = 'text-rose-700';
              barColor = 'bg-rose-500';
            } else if (carpark.status === 'full') {
              statusLabel = 'Carpark full';
              statusTextColor = 'text-slate-600';
              barColor = 'bg-slate-400';
            }

            return (
              <div
                key={carpark.id}
                onClick={() => onSelectCarpark(carpark)}
                className="group relative bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-4 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top line: Name & Favorite Star */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {carpark.name}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(carpark.id);
                      }}
                      className="text-slate-300 hover:text-amber-500 transition-colors p-0.5 shrink-0"
                      title={isFav ? 'Remove from favorites' : 'Save as favorite'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* Clean unboxed metadata with bullet separators (Zero-Pill compliant) */}
                  <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 mb-3">
                    <span>{carpark.area}</span>
                    <span aria-hidden="true">·</span>
                    <span>{carpark.agency}</span>
                    <span aria-hidden="true">·</span>
                    <span>{carpark.lotType === 'C' ? 'Cars' : carpark.lotType === 'Y' ? 'Bikes' : 'Heavy'}</span>
                    {carpark.distanceKm !== undefined && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-slate-600 font-medium">{carpark.distanceKm} km</span>
                      </>
                    )}
                  </div>

                  {/* Available Lots Counter & Trend */}
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                        {carpark.availableLots}
                      </span>
                      <span className="text-xs text-slate-500 ml-1.5">lots open</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      {carpark.lotTrend > 0 ? (
                        <span className="flex items-center text-emerald-600 font-mono font-medium">
                          <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{carpark.lotTrend}
                        </span>
                      ) : carpark.lotTrend < 0 ? (
                        <span className="flex items-center text-rose-600 font-mono font-medium">
                          <TrendingDown className="w-3.5 h-3.5 mr-0.5" />{carpark.lotTrend}
                        </span>
                      ) : (
                        <span className="flex items-center text-slate-400 font-mono">
                          <Minus className="w-3.5 h-3.5 mr-0.5" />0
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${Math.max(4, Math.min(100, lotPercent))}%` }}
                    />
                  </div>

                  {/* Status Text and Rate snippet */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className={`font-medium ${statusTextColor}`}>{statusLabel}</span>
                    <span className="text-slate-400 font-mono text-[11px] tabular-nums">ID: {carpark.carparkId}</span>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-1">
                    <span className="font-medium text-slate-700">Rate:</span> {carpark.rates.weekdayDay}
                  </div>
                </div>

                {/* Bottom Action strip */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">Sync {carpark.lastUpdated}</span>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${carpark.lat},${carpark.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
                      title="Open GPS Directions"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
