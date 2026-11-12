/**
 * Health check endpoint for the serverless API.
 * Accessible at: GET /api/health
 */

export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  ltaAccountKeyConfigured: boolean;
  message: string;
}

export default async function handler(req: any, res: any) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const isConfigured = Boolean(process.env.LTA_ACCOUNT_KEY && process.env.LTA_ACCOUNT_KEY.trim().length > 0);

  const payload: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    environment: process.env.NODE_ENV || 'development',
    ltaAccountKeyConfigured: isConfigured,
    message: isConfigured
      ? 'LTA API proxy is healthy and AccountKey is configured.'
      : 'LTA API proxy is running. AccountKey environment variable (LTA_ACCOUNT_KEY) is not yet set.',
  };

  return res.status(200).json(payload);
}
