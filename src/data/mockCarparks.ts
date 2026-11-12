import { Carpark, LTACarparkRaw } from '../types/carpark';

export const INITIAL_MOCK_RAW_DATA: LTACarparkRaw[] = [
  // Marina Area
  {
    CarParkID: "1",
    Area: "Marina",
    Development: "Suntec City Mall & Convention",
    Location: "1.29375 103.85718",
    AvailableLots: 428,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "2",
    Area: "Marina",
    Development: "Marina Bay Sands Integrated Resort",
    Location: "1.28340 103.86070",
    AvailableLots: 182,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "3",
    Area: "Marina",
    Development: "Marina Square Shopping Mall",
    Location: "1.29130 103.85760",
    AvailableLots: 310,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "4",
    Area: "Marina",
    Development: "Millenia Singapore",
    Location: "1.29280 103.85930",
    AvailableLots: 94,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "5",
    Area: "Marina",
    Development: "Singapore Flyer",
    Location: "1.28930 103.86310",
    AvailableLots: 125,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "6",
    Area: "Marina",
    Development: "Gardens by the Bay (Main Entrance)",
    Location: "1.28160 103.86360",
    AvailableLots: 56,
    LotType: "C",
    Agency: "URA"
  },

  // Orchard Road
  {
    CarParkID: "10",
    Area: "Orchard",
    Development: "ION Orchard",
    Location: "1.30400 103.83180",
    AvailableLots: 48,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "11",
    Area: "Orchard",
    Development: "Ngee Ann City (Takashimaya)",
    Location: "1.30250 103.83580",
    AvailableLots: 142,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "12",
    Area: "Orchard",
    Development: "Plaza Singapura",
    Location: "1.30070 103.84520",
    AvailableLots: 88,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "13",
    Area: "Orchard",
    Development: "Paragon Shopping Centre",
    Location: "1.30390 103.83590",
    AvailableLots: 19,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "14",
    Area: "Orchard",
    Development: "313@somerset",
    Location: "1.30090 103.83830",
    AvailableLots: 34,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "15",
    Area: "Orchard",
    Development: "The Centrepoint",
    Location: "1.30180 103.83980",
    AvailableLots: 77,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "16",
    Area: "Orchard",
    Development: "Orchard Central",
    Location: "1.30050 103.83950",
    AvailableLots: 51,
    LotType: "C",
    Agency: "LTA"
  },

  // Central / CBD / Bugis
  {
    CarParkID: "20",
    Area: "Central",
    Development: "Raffles City Shopping Centre",
    Location: "1.29390 103.85320",
    AvailableLots: 115,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "21",
    Area: "Central",
    Development: "Funan Mall",
    Location: "1.29130 103.85020",
    AvailableLots: 62,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "22",
    Area: "Central",
    Development: "National Gallery Singapore",
    Location: "1.29030 103.85190",
    AvailableLots: 85,
    LotType: "C",
    Agency: "URA"
  },
  {
    CarParkID: "23",
    Area: "Central",
    Development: "One Raffles Place (CBD)",
    Location: "1.28410 103.85150",
    AvailableLots: 22,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "24",
    Area: "Central",
    Development: "CapitaSpring Tower (CBD)",
    Location: "1.28470 103.85040",
    AvailableLots: 39,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "25",
    Area: "Central",
    Development: "Guoco Tower (Tanjong Pagar)",
    Location: "1.27640 103.84580",
    AvailableLots: 71,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "26",
    Area: "Central",
    Development: "Bugis Junction",
    Location: "1.29970 103.85530",
    AvailableLots: 64,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "27",
    Area: "Central",
    Development: "Bugis+ (Bugis Plus)",
    Location: "1.30070 103.85420",
    AvailableLots: 83,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "28",
    Area: "Central",
    Development: "Albert Centre Basement (Bugis)",
    Location: "1.30100 103.85300",
    AvailableLots: 12,
    LotType: "C",
    Agency: "HDB"
  },
  {
    CarParkID: "29",
    Area: "Central",
    Development: "Chinatown Point",
    Location: "1.28500 103.84430",
    AvailableLots: 33,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "30",
    Area: "Central",
    Development: "People's Park Complex Multi-Storey",
    Location: "1.28420 103.84270",
    AvailableLots: 96,
    LotType: "C",
    Agency: "URA"
  },

  // HarbourFront & Sentosa
  {
    CarParkID: "35",
    Area: "Central",
    Development: "VivoCity Megamall",
    Location: "1.26440 103.82220",
    AvailableLots: 540,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "36",
    Area: "Central",
    Development: "HarbourFront Centre",
    Location: "1.26400 103.82020",
    AvailableLots: 168,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "37",
    Area: "Sentosa",
    Development: "Resorts World Sentosa (B1 & B2)",
    Location: "1.25700 103.82000",
    AvailableLots: 680,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "38",
    Area: "Sentosa",
    Development: "Sentosa Beach Station Carpark",
    Location: "1.25150 103.81830",
    AvailableLots: 114,
    LotType: "C",
    Agency: "URA"
  },

  // East & Changi
  {
    CarParkID: "40",
    Area: "East",
    Development: "Jewel Changi Airport",
    Location: "1.36020 103.98970",
    AvailableLots: 450,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "41",
    Area: "East",
    Development: "Changi Airport Terminal 3 Carpark 3A",
    Location: "1.35620 103.98700",
    AvailableLots: 320,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "42",
    Area: "East",
    Development: "Tampines 1",
    Location: "1.35410 103.94520",
    AvailableLots: 86,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "43",
    Area: "East",
    Development: "Tampines Mall",
    Location: "1.35240 103.94470",
    AvailableLots: 104,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "44",
    Area: "East",
    Development: "Our Tampines Hub (Basement Carpark)",
    Location: "1.35300 103.94050",
    AvailableLots: 290,
    LotType: "C",
    Agency: "URA"
  },
  {
    CarParkID: "45",
    Area: "East",
    Development: "Century Square Tampines",
    Location: "1.35330 103.94430",
    AvailableLots: 67,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "46",
    Area: "East",
    Development: "Paya Lebar Quarter (PLQ Mall)",
    Location: "1.31740 103.89290",
    AvailableLots: 145,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "47",
    Area: "East",
    Development: "Parkway Parade Marine Parade",
    Location: "1.30150 103.90520",
    AvailableLots: 210,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "48",
    Area: "East",
    Development: "Bedok Mall",
    Location: "1.32450 103.93000",
    AvailableLots: 98,
    LotType: "C",
    Agency: "LTA"
  },

  // West
  {
    CarParkID: "50",
    Area: "West",
    Development: "Jem Shopping Mall (Jurong East)",
    Location: "1.33310 103.74360",
    AvailableLots: 120,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "51",
    Area: "West",
    Development: "Westgate (Jurong East)",
    Location: "1.33440 103.74280",
    AvailableLots: 148,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "52",
    Area: "West",
    Development: "IMM Building (Jurong East)",
    Location: "1.33530 103.74690",
    AvailableLots: 390,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "53",
    Area: "West",
    Development: "Jurong Point Shopping Centre",
    Location: "1.33970 103.70670",
    AvailableLots: 235,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "54",
    Area: "West",
    Development: "The Star Vista (Buona Vista)",
    Location: "1.30680 103.78840",
    AvailableLots: 165,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "55",
    Area: "West",
    Development: "The Clementi Mall",
    Location: "1.31520 103.76510",
    AvailableLots: 42,
    LotType: "C",
    Agency: "LTA"
  },

  // North & North-East
  {
    CarParkID: "60",
    Area: "North",
    Development: "Causeway Point (Woodlands)",
    Location: "1.43610 103.78590",
    AvailableLots: 180,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "61",
    Area: "North",
    Development: "Woodlands Civic Centre",
    Location: "1.43540 103.78700",
    AvailableLots: 68,
    LotType: "C",
    Agency: "HDB"
  },
  {
    CarParkID: "62",
    Area: "North",
    Development: "Northpoint City (Yishun)",
    Location: "1.42060 103.83620",
    AvailableLots: 215,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "63",
    Area: "North-East",
    Development: "NEX Serangoon Shopping Mall",
    Location: "1.35060 103.87230",
    AvailableLots: 130,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "64",
    Area: "North-East",
    Development: "Waterway Point (Punggol)",
    Location: "1.40670 103.90220",
    AvailableLots: 310,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "65",
    Area: "North-East",
    Development: "Compass One (Sengkang)",
    Location: "1.39240 103.89510",
    AvailableLots: 75,
    LotType: "C",
    Agency: "LTA"
  },
  {
    CarParkID: "66",
    Area: "Central",
    Development: "Toa Payoh HDB Hub Multi-Storey",
    Location: "1.33230 103.84750",
    AvailableLots: 195,
    LotType: "C",
    Agency: "HDB"
  },
  {
    CarParkID: "67",
    Area: "Central",
    Development: "Ang Mo Kio Hub (AMK Hub)",
    Location: "1.36950 103.84850",
    AvailableLots: 110,
    LotType: "C",
    Agency: "LTA"
  },

  // Motorcycle & Heavy Vehicle lots (to reflect multi-lot capabilities in LTA DataMall)
  {
    CarParkID: "80",
    Area: "Marina",
    Development: "Suntec City (Motorcycles)",
    Location: "1.29375 103.85718",
    AvailableLots: 88,
    LotType: "Y",
    Agency: "LTA"
  },
  {
    CarParkID: "81",
    Area: "Orchard",
    Development: "Plaza Singapura (Motorcycles)",
    Location: "1.30070 103.84520",
    AvailableLots: 42,
    LotType: "Y",
    Agency: "LTA"
  },
  {
    CarParkID: "82",
    Area: "Central",
    Development: "Raffles City (Motorcycles)",
    Location: "1.29390 103.85320",
    AvailableLots: 35,
    LotType: "Y",
    Agency: "LTA"
  },
  {
    CarParkID: "83",
    Area: "East",
    Development: "Jewel Changi Airport (Motorcycles)",
    Location: "1.36020 103.98970",
    AvailableLots: 110,
    LotType: "Y",
    Agency: "LTA"
  },
  {
    CarParkID: "84",
    Area: "West",
    Development: "IMM Logistics & Heavy Vehicle Deck",
    Location: "1.33530 103.74690",
    AvailableLots: 18,
    LotType: "H",
    Agency: "LTA"
  },
  {
    CarParkID: "85",
    Area: "East",
    Development: "Changi Airfreight Centre (Heavy Vehicle)",
    Location: "1.37120 103.99800",
    AvailableLots: 24,
    LotType: "H",
    Agency: "LTA"
  }
];

// Helper to deduce realistic rates based on agency & area
export function getEstimatedRates(agency: string, area: string, development: string): {
  weekdayDay: string;
  weekdayEvening: string;
  weekend: string;
  gracePeriod: string;
  heightLimit?: string;
} {
  if (agency === 'HDB' || agency === 'URA') {
    return {
      weekdayDay: '$0.60 per 30 mins (7am - 5pm)',
      weekdayEvening: '$0.60 per 30 mins (Capped at $5.00 overnight)',
      weekend: '$0.60 per 30 mins',
      gracePeriod: '15 mins',
      heightLimit: '2.1m'
    };
  }

  if (area === 'Orchard' || development.includes('ION') || development.includes('Paragon') || development.includes('Takashimaya')) {
    return {
      weekdayDay: '$3.20 1st hr, $1.60 sub 30 mins',
      weekdayEvening: '$4.50 per entry after 5pm',
      weekend: '$4.00 1st 2 hrs, $1.80 sub 30 mins',
      gracePeriod: '10 mins',
      heightLimit: '1.9m'
    };
  }

  if (area === 'Marina' || development.includes('Marina Bay') || development.includes('Suntec')) {
    return {
      weekdayDay: '$2.80 1st hr, $1.40 sub 30 mins',
      weekdayEvening: '$3.50 per entry after 5pm',
      weekend: '$3.00 for first 3 hrs, $1.20 sub 30 mins',
      gracePeriod: '15 mins',
      heightLimit: '2.0m'
    };
  }

  if (development.includes('Airport') || development.includes('Jewel')) {
    return {
      weekdayDay: '$0.04 per min ($2.40/hr)',
      weekdayEvening: '$0.04 per min ($2.40/hr)',
      weekend: '$0.04 per min ($2.40/hr)',
      gracePeriod: '10 mins',
      heightLimit: '2.0m'
    };
  }

  // Suburban malls
  return {
    weekdayDay: '$1.80 1st hr, $0.60 sub 15 mins',
    weekdayEvening: '$2.50 per entry after 6pm',
    weekend: '$2.40 1st 2 hrs, $0.60 sub 15 mins',
    gracePeriod: '15 mins',
    heightLimit: '2.0m'
  };
}

// Generate realistic simulated 24-hr occupancy trends for a carpark
export function getSimulatedHourlyTrends(carparkId: string): number[] {
  // Peak typically at 12:00-14:00 (lunch) and 18:00-20:00 (dinner)
  const baseSeed = (parseInt(carparkId, 10) || 7) % 15;
  const curve = [
    12, 10, 8, 7, 9, 15, 28, 45, 60, 68, 74, 86, 92, 88, 72, 65, 70, 84, 94, 88, 70, 52, 35, 20
  ];
  return curve.map(val => Math.min(100, Math.max(5, val + (baseSeed * 2 - 14))));
}
