/**
 * Serverless endpoint to pull live carpark lot availability from Singapore LTA DataMall.
 * Accessible at: GET /api/carparkavailability
 *
 * Upstream LTA Endpoint:
 * https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
 * Required Header: AccountKey: <LTA_ACCOUNT_KEY>
 */

interface CacheEntry {
  timestamp: number;
  data: any;
}

// In-memory cache to prevent hitting LTA rate limits (data updates every ~60s on LTA side)
let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

export default async function handler(req: any, res: any) {
  // CORS configuration for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only GET requests are supported.',
    });
  }

  // Retrieve AccountKey from environment variable or request header (do not hardcode keys)
  const headerKey = req.headers ? (req.headers['accountkey'] || req.headers['AccountKey']) : null;
  const accountKey = (process.env.LTA_ACCOUNT_KEY || headerKey || '').trim();

  if (!accountKey) {
    return res.status(401).json({
      error: 'LTA_ACCOUNT_KEY_MISSING',
      message:
        'LTA DataMall AccountKey is not configured. Please set the LTA_ACCOUNT_KEY environment variable or pass the AccountKey request header.',
      requestForApiUrl: 'https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html',
    });
  }

  // Check cache validity (unless client requests fresh cache bypass)
  const now = Date.now();
  const bypassCache = req.query?.fresh === 'true';

  if (!bypassCache && cache && now - cache.timestamp < CACHE_TTL_MS) {
    res.setHeader('X-Cache-Status', 'HIT');
    res.setHeader('X-Cache-Age-Seconds', Math.floor((now - cache.timestamp) / 1000));
    return res.status(200).json(cache.data);
  }

  try {
    const ltaEndpoint = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

    // Support optional $skip query parameter for pagination if requested
    const url = new URL(ltaEndpoint);
    if (req.query?.$skip) {
      url.searchParams.set('$skip', String(req.query.$skip));
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'AccountKey': accountKey,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'UPSTREAM_LTA_ERROR',
        status: response.status,
        statusText: response.statusText,
        details: errorText || 'Failed to fetch data from LTA DataMall',
      });
    }

    const data = await response.json();

    // Store in cache
    cache = {
      timestamp: now,
      data,
    };

    res.setHeader('X-Cache-Status', 'MISS');
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching LTA DataMall CarParkAvailabilityv2:', error);
    return res.status(502).json({
      error: 'BAD_GATEWAY',
      message: error.message || 'Failed to connect to LTA DataMall API server.',
    });
  }
}
