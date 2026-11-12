export interface LTACarparkRaw {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // Format: "Latitude Longitude", e.g. "1.29375 103.85718"
  AvailableLots: number;
  LotType: 'C' | 'H' | 'Y' | string; // C = Cars, H = Heavy Vehicles, Y = Motorcycles
  Agency: 'LTA' | 'HDB' | 'URA' | string;
}

export type AvailabilityStatus = 'abundant' | 'moderate' | 'limited' | 'full';

export interface CarparkRates {
  weekdayDay: string;
  weekdayEvening: string;
  weekend: string;
  gracePeriod: string;
  heightLimit?: string;
}

export interface Carpark {
  id: string;
  carparkId: string;
  name: string;
  area: string;
  region: 'Central' | 'Orchard' | 'Marina' | 'East' | 'West' | 'North' | 'North-East' | 'Sentosa';
  agency: 'LTA' | 'HDB' | 'URA';
  lotType: 'C' | 'H' | 'Y';
  availableLots: number;
  totalCapacity: number;
  lat: number;
  lng: number;
  lotTrend: number; // positive = lots freed up, negative = lots filled, 0 = unchanged
  status: AvailabilityStatus;
  rates: CarparkRates;
  distanceKm?: number;
  isFavorite?: boolean;
  lastUpdated: string;
  hourlyTrends?: number[]; // 24-hour occupancy percentages (0 to 100)
}

export type DataSource = 'serverless_api' | 'workshop_simulation' | 'custom_proxy' | 'lta_direct';

export interface APIConfig {
  source: DataSource;
  accountKey: string;
  proxyUrl: string;
  refreshIntervalSeconds: number;
  autoRefresh: boolean;
  simulateFluctuation: boolean;
}

export type VehicleFilter = 'ALL' | 'C' | 'H' | 'Y';
export type AgencyFilter = 'ALL' | 'LTA' | 'HDB' | 'URA';
export type StatusFilter = 'ALL' | 'abundant' | 'moderate' | 'limited' | 'full';
export type SortOption = 'lots_desc' | 'lots_asc' | 'distance_asc' | 'name_asc';
