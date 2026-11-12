import { Carpark, LTACarparkRaw, APIConfig, AvailabilityStatus } from '../types/carpark';
import { INITIAL_MOCK_RAW_DATA, getEstimatedRates, getSimulatedHourlyTrends } from '../data/mockCarparks';

export function parseCoordinates(locationStr: string): { lat: number; lng: number } {
  if (!locationStr) return { lat: 1.3521, lng: 103.8198 };
  const parts = locationStr.trim().split(/\s+/);
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  return { lat: 1.3521, lng: 103.8198 };
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function determineStatus(availableLots: number): AvailabilityStatus {
  if (availableLots >= 50) return 'abundant';
  if (availableLots >= 15) return 'moderate';
  if (availableLots > 0) return 'limited';
  return 'full';
}

export function determineRegion(area: string, lat: number, lng: number): Carpark['region'] {
  if (area === 'Orchard') return 'Orchard';
  if (area === 'Marina') return 'Marina';
  if (area === 'Sentosa' || lat < 1.260) return 'Sentosa';
  if (area === 'East' || lng > 103.89) return 'East';
  if (area === 'West' || lng < 103.78) return 'West';
  if (area === 'North' || lat > 1.41) return 'North';
  if (area === 'North-East' || (lat > 1.34 && lng > 103.86 && lng <= 103.92)) return 'North-East';
  return 'Central';
}

export function transformRawToCarpark(
  raw: LTACarparkRaw,
  userLocation?: { lat: number; lng: number } | null,
  previousLots?: number
): Carpark {
  const { lat, lng } = parseCoordinates(raw.Location);
  const region = determineRegion(raw.Area, lat, lng);
  const agency = (raw.Agency as Carpark['agency']) || 'LTA';
  const lotType = (raw.LotType as Carpark['lotType']) || 'C';
  const availableLots = Math.max(0, raw.AvailableLots || 0);

  // Estimate total capacity based on available lots and typical buffer
  const capacitySeed = Math.max(availableLots + 50, Math.round(availableLots * 1.4) + 30);
  const totalCapacity = Math.min(1800, capacitySeed);

  const lotTrend = previousLots !== undefined ? availableLots - previousLots : 0;
  const status = determineStatus(availableLots);
  const rates = getEstimatedRates(agency, raw.Area, raw.Development);

  let distanceKm: number | undefined = undefined;
  if (userLocation) {
    distanceKm = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return {
    id: `${raw.CarParkID}_${raw.LotType}`,
    carparkId: raw.CarParkID,
    name: raw.Development || `Carpark ${raw.CarParkID}`,
    area: raw.Area || 'Singapore',
    region,
    agency,
    lotType,
    availableLots,
    totalCapacity,
    lat,
    lng,
    lotTrend,
    status,
    rates,
    distanceKm,
    lastUpdated: timeStr,
    hourlyTrends: getSimulatedHourlyTrends(raw.CarParkID)
  };
}

let simulatedRawState: LTACarparkRaw[] = JSON.parse(JSON.stringify(INITIAL_MOCK_RAW_DATA));

export async function fetchCarparkData(
  config: APIConfig,
  userLocation?: { lat: number; lng: number } | null,
  previousDataMap?: Map<string, number>
): Promise<{ carparks: Carpark[]; rawCount: number; error?: string }> {
  try {
    let rawItems: LTACarparkRaw[] = [];

    if (config.source === 'serverless_api') {
      const headers: Record<string, string> = {
        'accept': 'application/json'
      };
      if (config.accountKey) {
        headers['AccountKey'] = config.accountKey;
      }

      const response = await fetch('/api/carparkavailability', { headers });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        if (response.status === 401 && errJson.error === 'LTA_ACCOUNT_KEY_MISSING') {
          throw new Error('Serverless endpoint /api/carparkavailability is active! To fetch live LTA data, please set LTA_ACCOUNT_KEY or input it in API Settings.');
        }
        throw new Error(errJson.message || `Serverless API error (${response.status} ${response.statusText})`);
      }
      const json = await response.json();
      rawItems = Array.isArray(json) ? json : json.value || [];
    } else if (config.source === 'workshop_simulation') {
      // Simulate realistic fluctuation: a few carparks lose or gain 1-5 lots
      if (config.simulateFluctuation) {
        simulatedRawState = simulatedRawState.map(item => {
          // 40% chance of lot count shift
          if (Math.random() < 0.4) {
            const shift = Math.floor(Math.random() * 7) - 3; // -3 to +3
            const newLots = Math.max(0, item.AvailableLots + shift);
            return { ...item, AvailableLots: newLots };
          }
          return item;
        });
      }
      rawItems = simulatedRawState;
    } else if (config.source === 'custom_proxy') {
      if (!config.proxyUrl) {
        throw new Error('Proxy URL is not specified. Please enter your backend endpoint URL in API Settings.');
      }
      const response = await fetch(config.proxyUrl, {
        headers: config.accountKey ? { 'AccountKey': config.accountKey } : undefined
      });
      if (!response.ok) {
        throw new Error(`Proxy HTTP error: ${response.status} ${response.statusText}`);
      }
      const json = await response.json();
      rawItems = Array.isArray(json) ? json : json.value || [];
    } else if (config.source === 'lta_direct') {
      if (!config.accountKey) {
        throw new Error('LTA DataMall AccountKey is required for direct connection.');
      }
      
      // Note: Direct calls to datamall2 from browser usually get CORS blocked without proxy.
      try {
        const response = await fetch('https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2', {
          headers: {
            'AccountKey': config.accountKey,
            'accept': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`LTA DataMall error: ${response.status} ${response.statusText}`);
        }
        const json = await response.json();
        rawItems = json.value || [];
      } catch (err: any) {
        // Handle browser CORS restriction with informative guidance
        throw new Error(
          `CORS Error: The LTA DataMall server does not allow direct browser-to-API requests without a backend proxy. Use the "Workshop API Hub" to connect via your Express or FastAPI backend proxy, or use "Workshop Simulation". (${err.message})`
        );
      }
    }

    const carparks: Carpark[] = rawItems.map(raw => {
      const prevLots = previousDataMap ? previousDataMap.get(`${raw.CarParkID}_${raw.LotType}`) : undefined;
      return transformRawToCarpark(raw, userLocation, prevLots);
    });

    return {
      carparks,
      rawCount: rawItems.length
    };
  } catch (error: any) {
    return {
      carparks: simulatedRawState.map(raw => transformRawToCarpark(raw, userLocation)),
      rawCount: simulatedRawState.length,
      error: error.message || 'Failed to fetch carpark data.'
    };
  }
}
