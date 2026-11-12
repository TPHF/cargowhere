import React, { useState } from 'react';
import { Carpark } from '../types/carpark';
import { Calculator, Clock, DollarSign, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

interface RateEstimatorProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
}

export const RateEstimator: React.FC<RateEstimatorProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
}) => {
  const [activeCarparkId, setActiveCarparkId] = useState<string>(
    selectedCarpark?.id || (carparks[0] ? carparks[0].id : '')
  );
  const [entryHour, setEntryHour] = useState<number>(14);
  const [entryMinute, setEntryMinute] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(120); // 2 hours default
  const [isWeekend, setIsWeekend] = useState<boolean>(false);

  const currentCarpark = carparks.find((c) => c.id === activeCarparkId) || carparks[0];

  // Calculate estimated fee
  const calculateFee = () => {
    if (!currentCarpark) return { total: 0, breakdown: 'No carpark selected', isGrace: false };

    // Grace period check (typically 10-15 mins in SG)
    const graceMin = currentCarpark.rates.gracePeriod.includes('10') ? 10 : 15;
    if (durationMinutes <= graceMin) {
      return {
        total: 0,
        breakdown: `Free of charge! (Within ${graceMin}-minute grace period)`,
        isGrace: true
      };
    }

    const durationHours = durationMinutes / 60;

    // HDB / URA rates: $0.60 per 30 mins ($1.20/hr)
    if (currentCarpark.agency === 'HDB' || currentCarpark.agency === 'URA') {
      const blocksOf30 = Math.ceil(durationMinutes / 30);
      const total = blocksOf30 * 0.6;
      return {
        total,
        breakdown: `${blocksOf30} × 30-min blocks @ $0.60/block`,
        isGrace: false
      };
    }

    // Commercial Orchard rate
    if (currentCarpark.area === 'Orchard') {
      // Entry after 5pm (17:00)
      if (entryHour >= 17) {
        return {
          total: 4.50,
          breakdown: 'Per-entry flat rate (Evening after 5:00 PM)',
          isGrace: false
        };
      }
      if (isWeekend) {
        // $4.00 for first 2 hours, $1.80 sub 30 mins
        if (durationMinutes <= 120) {
          return { total: 4.00, breakdown: 'First 2 hours block rate', isGrace: false };
        }
        const extraMinutes = durationMinutes - 120;
        const extraBlocks = Math.ceil(extraMinutes / 30);
        const total = 4.00 + extraBlocks * 1.80;
        return {
          total,
          breakdown: `$4.00 (1st 2 hrs) + ${extraBlocks} × $1.80 (subsequent 30 mins)`,
          isGrace: false
        };
      } else {
        // Weekday: $3.20 1st hr, $1.60 sub 30 mins
        if (durationMinutes <= 60) {
          return { total: 3.20, breakdown: 'First hour charge', isGrace: false };
        }
        const extraMinutes = durationMinutes - 60;
        const extraBlocks = Math.ceil(extraMinutes / 30);
        const total = 3.20 + extraBlocks * 1.60;
        return {
          total,
          breakdown: `$3.20 (1st hr) + ${extraBlocks} × $1.60 (subsequent 30 mins)`,
          isGrace: false
        };
      }
    }

    // Marina Bay / CBD
    if (currentCarpark.area === 'Marina' || currentCarpark.area === 'Central') {
      if (entryHour >= 17) {
        return {
          total: 3.50,
          breakdown: 'Per-entry flat rate (Evening after 5:00 PM)',
          isGrace: false
        };
      }
      if (durationMinutes <= 60) {
        return { total: 2.80, breakdown: 'First hour charge', isGrace: false };
      }
      const extraMinutes = durationMinutes - 60;
      const extraBlocks = Math.ceil(extraMinutes / 30);
      const total = 2.80 + extraBlocks * 1.40;
      return {
        total,
        breakdown: `$2.80 (1st hr) + ${extraBlocks} × $1.40 (subsequent 30 mins)`,
        isGrace: false
      };
    }

    // Default suburban mall rate
    if (entryHour >= 18) {
      return { total: 2.50, breakdown: 'Evening flat rate (after 6:00 PM)', isGrace: false };
    }
    const blocksOf30 = Math.ceil(durationMinutes / 30);
    const total = 1.80 + Math.max(0, blocksOf30 - 2) * 0.60;
    return {
      total,
      breakdown: `$1.80 (1st hr) + $0.60 per subsequent 15 mins`,
      isGrace: false
    };
  };

  const estimate = calculateFee();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Singapore Carpark Parking Fee Calculator
            </h2>
            <p className="text-xs text-slate-500">
              Estimate parking charges based on entry time, duration, and local agency/mall rates
            </p>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Destination Carpark Select */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700">Choose Carpark / Development</label>
            <select
              value={activeCarparkId}
              onChange={(e) => {
                setActiveCarparkId(e.target.value);
                const cp = carparks.find((c) => c.id === e.target.value);
                if (cp) onSelectCarpark(cp);
              }}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {carparks.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.area} · {c.agency} · {c.availableLots} lots available)
                </option>
              ))}
            </select>
          </div>

          {/* Time of Entry */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Time of Entry</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={entryHour}
                onChange={(e) => setEntryHour(parseInt(e.target.value, 10))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 font-mono tabular-nums"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, '0')}:00 {i >= 12 ? 'PM' : 'AM'} {i >= 17 ? '(Evening Rate)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Day of Week */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Day Category</span>
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setIsWeekend(false)}
                className={`py-1.5 font-medium rounded-md transition-colors ${
                  !isWeekend ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Weekday (Mon - Fri)
              </button>
              <button
                type="button"
                onClick={() => setIsWeekend(true)}
                className={`py-1.5 font-medium rounded-md transition-colors ${
                  isWeekend ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Weekend / PH
              </button>
            </div>
          </div>

          {/* Duration Selector */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">Parking Duration</label>
              <span className="font-mono tabular-nums font-bold text-slate-900">
                {Math.floor(durationMinutes / 60)} hrs {durationMinutes % 60 > 0 ? `${durationMinutes % 60} mins` : ''}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={480}
              step={15}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>10m (Grace)</span>
              <span>1 hr</span>
              <span>2 hrs</span>
              <span>4 hrs</span>
              <span>8 hrs</span>
            </div>
          </div>
        </div>

        {/* Calculation Result Box */}
        {currentCarpark && (
          <div className="p-5 rounded-xl bg-slate-900 text-white space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  Estimated Total Parking Fee
                </div>
                <div className="text-3xl font-extrabold font-mono tabular-nums text-emerald-400 mt-0.5">
                  ${estimate.total.toFixed(2)} SGD
                </div>
              </div>

              <div className="text-left sm:text-right text-xs">
                <div className="text-slate-300 font-semibold">{currentCarpark.name}</div>
                <div className="text-slate-400 font-mono tabular-nums text-[11px] mt-0.5">
                  {currentCarpark.availableLots} lots available right now
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1">
              <div><span className="font-medium text-slate-400">Calculation:</span> {estimate.breakdown}</div>
              <div><span className="font-medium text-slate-400">Grace period:</span> {currentCarpark.rates.gracePeriod}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
