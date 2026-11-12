import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Carpark, VehicleFilter, AgencyFilter, StatusFilter } from '../types/carpark';
import { Locate, Navigation2, Layers, Search, Car, Bike, Truck, RefreshCw } from 'lucide-react';

interface CarparkMapProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  userLocation: { lat: number; lng: number } | null;
  onRequestUserLocation: () => void;
  isLocating: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const REGION_SHORTCUTS = [
  { name: 'All Singapore', center: [1.3521, 103.8198] as [number, number], zoom: 12 },
  { name: 'Marina Bay', center: [1.2880, 103.8590] as [number, number], zoom: 15 },
  { name: 'Orchard Road', center: [1.3030, 103.8360] as [number, number], zoom: 15 },
  { name: 'Bugis / CBD', center: [1.2930, 103.8520] as [number, number], zoom: 15 },
  { name: 'Jurong East', center: [1.3340, 103.7440] as [number, number], zoom: 15 },
  { name: 'Tampines', center: [1.3530, 103.9440] as [number, number], zoom: 15 },
  { name: 'Changi / Jewel', center: [1.3580, 103.9880] as [number, number], zoom: 14 },
  { name: 'VivoCity / Sentosa', center: [1.2580, 103.8210] as [number, number], zoom: 14 },
];

export const CarparkMap: React.FC<CarparkMapProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  userLocation,
  onRequestUserLocation,
  isLocating,
  onRefresh,
  isRefreshing,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [activeRegion, setActiveRegion] = useState('All Singapore');
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>('ALL');
  const [agencyFilter, setAgencyFilter] = useState<AgencyFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [mapSearch, setMapSearch] = useState('');
  const [tileStyle, setTileStyle] = useState<'positron' | 'osm' | 'dark'>('positron');

  // Filtered carparks for the map
  const filteredCarparks = carparks.filter(c => {
    if (vehicleFilter !== 'ALL' && c.lotType !== vehicleFilter) return false;
    if (agencyFilter !== 'ALL' && c.agency !== agencyFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (mapSearch.trim()) {
      const q = mapSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q) ||
        c.carparkId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default tile layer: CartoDB Positron for clean uncluttered dashboard look
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    });
    tileLayer.addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer if changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old tile layer
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    if (tileStyle === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (tileStyle === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    L.tileLayer(url, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);
  }, [tileStyle]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredCarparks.forEach((carpark) => {
      const isSelected = selectedCarpark?.id === carpark.id;

      // Color based on status
      let bgColor = 'bg-emerald-600 text-white border-emerald-700';
      let ringColor = 'ring-emerald-300';
      if (carpark.status === 'moderate') {
        bgColor = 'bg-amber-500 text-white border-amber-600';
        ringColor = 'ring-amber-300';
      } else if (carpark.status === 'limited') {
        bgColor = 'bg-rose-600 text-white border-rose-700';
        ringColor = 'ring-rose-300';
      } else if (carpark.status === 'full') {
        bgColor = 'bg-slate-700 text-slate-100 border-slate-900';
        ringColor = 'ring-slate-400';
      }

      const lotLabel = carpark.availableLots > 999 ? '999+' : carpark.availableLots.toString();
      const lotTypeIcon = carpark.lotType === 'Y' ? '🛵' : carpark.lotType === 'H' ? '🚛' : '🚗';

      const customHtml = `
        <div class="cursor-pointer transition-transform duration-150 hover:scale-110 ${isSelected ? 'scale-125 z-50' : 'z-10'}">
          <div class="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold shadow-md border ${bgColor} ${isSelected ? `ring-2 ${ringColor}` : ''}">
            <span class="text-[10px]">${lotTypeIcon}</span>
            <span class="font-mono tabular-nums">${lotLabel}</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: 'custom-carpark-marker',
        iconSize: [44, 26],
        iconAnchor: [22, 13]
      });

      const marker = L.marker([carpark.lat, carpark.lng], { icon });

      // Click opens selection and popup
      marker.on('click', () => {
        onSelectCarpark(carpark);
      });

      // Bind detailed popup
      const popupHtml = `
        <div class="p-3 w-64 text-slate-800">
          <div class="flex items-start justify-between gap-2 mb-1">
            <h4 class="font-semibold text-sm leading-tight text-slate-900">${carpark.name}</h4>
          </div>
          <div class="text-xs text-slate-500 mb-2">
            <span>${carpark.area}</span>
            <span class="mx-1">·</span>
            <span>${carpark.agency}</span>
            <span class="mx-1">·</span>
            <span>Lot ID: ${carpark.carparkId}</span>
          </div>
          <div class="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 mb-2">
            <div>
              <div class="text-[10px] uppercase font-medium text-slate-500">Available Lots</div>
              <div class="text-lg font-bold font-mono tabular-nums text-slate-900 leading-none mt-0.5">${carpark.availableLots}</div>
            </div>
            <div class="text-right">
              <div class="text-[10px] uppercase font-medium text-slate-500">Vehicle Type</div>
              <div class="text-xs font-semibold text-slate-700 mt-0.5">${carpark.lotType === 'C' ? 'Cars' : carpark.lotType === 'Y' ? 'Motorcycles' : 'Heavy'}</div>
            </div>
          </div>
          <div class="text-[11px] text-slate-600 mb-2">
            <span class="font-medium">Rates:</span> ${carpark.rates.weekdayDay}
          </div>
          <div class="flex gap-2">
            <button id="view-details-btn-${carpark.id.replace(/\W/g, '_')}" class="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium text-center transition-colors">
              Full Details
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${carpark.lat},${carpark.lng}" target="_blank" rel="noopener noreferrer" class="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium text-center transition-colors">
              Directions
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-details-btn-${carpark.id.replace(/\W/g, '_')}`);
        if (btn) {
          btn.addEventListener('click', () => {
            onSelectCarpark(carpark);
          });
        }
      });

      marker.addTo(markersGroup);
    });
  }, [filteredCarparks, selectedCarpark, onSelectCarpark]);

  // Handle user location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const userIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center">
              <span class="absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-60 animate-ping"></span>
              <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-lg"></span>
            </div>
          `,
          className: 'user-location-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
        marker.bindTooltip('Your Location', { permanent: false, direction: 'top' });
        userMarkerRef.current = marker;
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  // Pan to selected carpark if changed externally
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedCarpark) return;

    map.flyTo([selectedCarpark.lat, selectedCarpark.lng], 16, {
      animate: true,
      duration: 0.8
    });
  }, [selectedCarpark]);

  const handleRegionClick = (center: [number, number], zoom: number, name: string) => {
    setActiveRegion(name);
    mapInstanceRef.current?.flyTo(center, zoom, {
      animate: true,
      duration: 1.0
    });
  };

  return (
    <div className="relative w-full h-[620px] lg:h-[720px] rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* Top Map Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Search input on map */}
        <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            placeholder="Search carparks or areas..."
            className="w-full text-xs bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
          />
          {mapSearch && (
            <button
              onClick={() => setMapSearch('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Buttons: Locate Me, Refresh, Map Style */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-slate-200 shadow-sm">
          <button
            onClick={onRequestUserLocation}
            title="Locate Me in Singapore"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Near Me</span>
          </button>

          <div className="w-px h-4 bg-slate-200" />

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Live Data"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <div className="w-px h-4 bg-slate-200" />

          {/* Map style toggle */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-md">
            <button
              onClick={() => setTileStyle('positron')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded ${tileStyle === 'positron' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Clean
            </button>
            <button
              onClick={() => setTileStyle('osm')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded ${tileStyle === 'osm' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              OSM
            </button>
            <button
              onClick={() => setTileStyle('dark')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded ${tileStyle === 'dark' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Region Shortcuts Bar */}
      <div className="absolute top-16 left-3 right-3 z-[1000] pointer-events-none flex items-center overflow-x-auto no-scrollbar gap-1 py-1">
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-slate-200 shadow-sm max-w-full overflow-x-auto">
          {REGION_SHORTCUTS.map((reg) => (
            <button
              key={reg.name}
              onClick={() => handleRegionClick(reg.center, reg.zoom, reg.name)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeRegion === reg.name
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {reg.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map Viewport Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Bottom Map Legend and Filters */}
      <div className="absolute bottom-4 left-3 z-[1000] pointer-events-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Lots:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span>&gt;50</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>15–50</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            <span>&lt;15</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
            <span>Full (0)</span>
          </div>
        </div>

        <div className="hidden sm:block w-px h-4 bg-slate-200" />

        {/* Quick Vehicle Filter on Map */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 font-medium">Type:</span>
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-md">
            <button
              onClick={() => setVehicleFilter('ALL')}
              className={`px-2 py-0.5 text-xs font-medium rounded ${vehicleFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All
            </button>
            <button
              onClick={() => setVehicleFilter('C')}
              className={`px-2 py-0.5 text-xs font-medium rounded ${vehicleFilter === 'C' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Cars"
            >
              Cars
            </button>
            <button
              onClick={() => setVehicleFilter('Y')}
              className={`px-2 py-0.5 text-xs font-medium rounded ${vehicleFilter === 'Y' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Motorcycles"
            >
              Bikes
            </button>
            <button
              onClick={() => setVehicleFilter('H')}
              className={`px-2 py-0.5 text-xs font-medium rounded ${vehicleFilter === 'H' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Heavy Vehicles"
            >
              Heavy
            </button>
          </div>
        </div>
      </div>

      {/* Floating active carpark count summary */}
      <div className="absolute bottom-4 right-14 z-[1000] pointer-events-none hidden sm:block bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 shadow-sm font-mono tabular-nums">
        Showing {filteredCarparks.length} of {carparks.length} carparks
      </div>
    </div>
  );
};
