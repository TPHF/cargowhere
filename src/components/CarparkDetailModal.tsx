import React, { useState } from 'react';
import { Carpark } from '../types/carpark';
import { X, Navigation, Copy, Check, Clock, ShieldCheck, MapPin, ExternalLink, Code2, AlertTriangle, Star } from 'lucide-react';

interface CarparkDetailModalProps {
  carpark: Carpark | null;
  onClose: () => void;
  allCarparks: Carpark[];
  onSelectCarpark: (carpark: Carpark) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  onClose,
  allCarparks,
  onSelectCarpark,
  isFavorite,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  if (!carpark) return null;

  // Find 3 closest alternatives in the same region or nearby
  const alternatives = allCarparks
    .filter((c) => c.id !== carpark.id && c.lotType === carpark.lotType)
    .map((c) => {
      // Calculate straight-line distance between the two carparks
      const dLat = (c.lat - carpark.lat) * 111;
      const dLng = (c.lng - carpark.lng) * 111 * Math.cos(carpark.lat * (Math.PI / 180));
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      return { ...c, relativeDistKm: Math.round(dist * 10) / 10 };
    })
    .sort((a, b) => a.relativeDistKm - b.relativeDistKm)
    .slice(0, 3);

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${carpark.lat}, ${carpark.lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawJsonSnippet = {
    CarParkID: carpark.carparkId,
    Area: carpark.area,
    Development: carpark.name,
    Location: `${carpark.lat} ${carpark.lng}`,
    AvailableLots: carpark.availableLots,
    LotType: carpark.lotType,
    Agency: carpark.agency
  };

  const currentHour = new Date().getHours();

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {carpark.agency} Managed
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">Lot ID: {carpark.carparkId}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {carpark.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{carpark.area}, Singapore</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{carpark.lat.toFixed(5)}, {carpark.lng.toFixed(5)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onToggleFavorite(carpark.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isFavorite
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500'
              }`}
              title={isFavorite ? 'Remove favorite' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6">
          {/* Main Lot Availability Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Available Lots Now</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
                  {carpark.availableLots}
                </span>
                <span className="text-xs text-slate-500">
                  / ~{carpark.totalCapacity} total
                </span>
              </div>
              <div className="mt-2 text-[11px] font-medium text-emerald-700">
                {carpark.availableLots > 50 ? 'Lots readily available' : carpark.availableLots > 15 ? 'Filling up steadily' : 'Critically low lots'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Vehicle Category</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {carpark.lotType === 'C' ? 'Cars (Class 3)' : carpark.lotType === 'Y' ? 'Motorcycles (Class 2)' : 'Heavy Vehicles'}
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Lot Code: <span className="font-mono font-semibold">{carpark.lotType}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Height Limit &amp; Grace</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {carpark.rates.heightLimit || '2.0m'}
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Grace period: <span className="font-semibold text-slate-700">{carpark.rates.gracePeriod}</span>
              </div>
            </div>
          </div>

          {/* Rate Schedule Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Parking Rate Structure
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between p-3 bg-white">
                <span className="font-medium text-slate-700">Weekday Daytime (07:00 – 17:00)</span>
                <span className="font-mono tabular-nums text-slate-900 font-semibold">{carpark.rates.weekdayDay}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white">
                <span className="font-medium text-slate-700">Weekday Evening / Overnight</span>
                <span className="font-mono tabular-nums text-slate-900 font-semibold">{carpark.rates.weekdayEvening}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white">
                <span className="font-medium text-slate-700">Weekends &amp; Public Holidays</span>
                <span className="font-mono tabular-nums text-slate-900 font-semibold">{carpark.rates.weekend}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50">
                <span className="text-slate-500">Complimentary Grace Period</span>
                <span className="font-mono tabular-nums text-slate-700">{carpark.rates.gracePeriod}</span>
              </div>
            </div>
          </div>

          {/* 24-Hour Occupancy Trends Curve */}
          {carpark.hourlyTrends && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Typical Daily Occupancy Pattern
                </h3>
                <span className="text-[11px] text-slate-400">Current time highlighted</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-end justify-between h-20 gap-1 pt-2">
                  {carpark.hourlyTrends.map((val, idx) => {
                    const isCurrent = idx === currentHour;
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative"
                      >
                        <div
                          className={`w-full rounded-t transition-all ${
                            isCurrent
                              ? 'bg-blue-600'
                              : val > 80
                              ? 'bg-rose-400'
                              : val > 50
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                          style={{ height: `${val}%` }}
                        />
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20 font-mono">
                          {idx}:00 - {val}% busy
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00 (Lunch peak)</span>
                  <span>18:00 (Evening)</span>
                  <span>23:00</span>
                </div>
              </div>
            </div>
          )}

          {/* Nearby Alternatives */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Nearby Alternative Carparks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {alternatives.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => onSelectCarpark(alt)}
                  className="p-3 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs rounded-xl cursor-pointer transition-all"
                >
                  <div className="font-medium text-xs text-slate-800 line-clamp-1 mb-1">
                    {alt.name}
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                      {alt.availableLots} lots
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ~{alt.relativeDistKm} km
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Developer / Vibe Coding Workshop Raw JSON Inspection */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                <Code2 className="w-4 h-4 text-slate-400" />
                <span>{showRawJson ? 'Hide' : 'Inspect'} LTA DataMall Raw JSON Schema</span>
              </button>
              <button
                onClick={handleCopyCoords}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy GPS'}</span>
              </button>
            </div>

            {showRawJson && (
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto">
                {JSON.stringify(rawJsonSnippet, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10">
          <div className="text-xs text-slate-500">
            Updated: <span className="font-mono text-slate-700">{carpark.lastUpdated}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${carpark.lat},${carpark.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Start Navigation</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
