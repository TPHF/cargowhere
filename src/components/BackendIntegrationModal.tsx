import React, { useState } from 'react';
import { APIConfig, DataSource } from '../types/carpark';
import { X, Check, Copy, Terminal, Server, Key, RefreshCw, AlertCircle, PlayCircle } from 'lucide-react';

interface BackendIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: APIConfig;
  onSaveConfig: (newConfig: APIConfig) => void;
  onTestConnection: () => Promise<{ success: boolean; message: string; count?: number }>;
}

export const BackendIntegrationModal: React.FC<BackendIntegrationModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTestConnection,
}) => {
  const [localConfig, setLocalConfig] = useState<APIConfig>(config);
  const [activeTab, setActiveTab] = useState<'settings' | 'express' | 'python' | 'specs'>('settings');
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string; count?: number } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    onSaveConfig(localConfig);
    const res = await onTestConnection();
    setTestResult(res);
    setIsTesting(false);
  };

  const handleSaveAndClose = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  const expressCode = `// server.js - Node.js + Express Proxy for Singapore LTA DataMall API
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your React frontend
app.use(cors());

// Your LTA DataMall Account Key from https://datamall.lta.gov.sg
const LTA_ACCOUNT_KEY = process.env.LTA_ACCOUNT_KEY || 'YOUR_LTA_ACCOUNT_KEY';

app.get('/api/carparks', async (req, res) => {
  try {
    const response = await fetch('https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2', {
      method: 'GET',
      headers: {
        'AccountKey': LTA_ACCOUNT_KEY,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch from LTA DataMall' });
    }

    const data = await response.json();
    // Returns { "odata.metadata": "...", "value": [ ...carparks ] }
    res.json(data);
  } catch (error) {
    console.error('LTA Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(\`Singapore Carpark Proxy Server running on http://localhost:\${PORT}\`);
});`;

  const pythonCode = `# main.py - Python FastAPI Proxy for LTA DataMall API
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI(title="SG Carpark Proxy")

# Configure CORS so your frontend can call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LTA_ACCOUNT_KEY = os.getenv("LTA_ACCOUNT_KEY", "YOUR_LTA_ACCOUNT_KEY")
LTA_API_URL = "https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2"

@app.get("/api/carparks")
async def get_carpark_availability():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                LTA_API_URL,
                headers={"AccountKey": LTA_ACCOUNT_KEY, "accept": "application/json"},
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"LTA DataMall error: {str(exc)}")

# Run with: uvicorn main:app --reload --port 8000`;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Workshop API &amp; Backend Hub
              </h2>
              <p className="text-xs text-slate-500">
                Connect LTA DataMall live feed or copy starter backend code
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 px-5 bg-slate-50 text-xs">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 px-3 font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'settings'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            API Settings &amp; Source
          </button>
          <button
            onClick={() => setActiveTab('express')}
            className={`py-2.5 px-3 font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'express'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Express.js Starter
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`py-2.5 px-3 font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'python'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            FastAPI Starter
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`py-2.5 px-3 font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'specs'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            LTA API Specs
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Data Source Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Data Source</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div
                    onClick={() => setLocalConfig({ ...localConfig, source: 'serverless_api' })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      localConfig.source === 'serverless_api'
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900">Serverless API Route</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">/api/carparkavailability</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Direct serverless connection using LTA endpoint with caching and CORS.
                    </div>
                  </div>

                  <div
                    onClick={() => setLocalConfig({ ...localConfig, source: 'workshop_simulation' })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      localConfig.source === 'workshop_simulation'
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-900">Workshop Simulation</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      65+ real SG carparks with live simulated lot fluctuations.
                    </div>
                  </div>

                  <div
                    onClick={() => setLocalConfig({ ...localConfig, source: 'custom_proxy' })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      localConfig.source === 'custom_proxy'
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-900">Custom Backend Proxy</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Points to your custom external proxy URL.
                    </div>
                  </div>

                  <div
                    onClick={() => setLocalConfig({ ...localConfig, source: 'lta_direct' })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      localConfig.source === 'lta_direct'
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-900">Direct Browser Request</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Direct client fetch (requires CORS extension).
                    </div>
                  </div>
                </div>
              </div>

              {/* LTA Account Key Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>LTA DataMall AccountKey</span>
                  <a
                    href="https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 hover:underline font-normal"
                  >
                    Request free key →
                  </a>
                </label>
                <input
                  type="password"
                  value={localConfig.accountKey}
                  onChange={(e) => setLocalConfig({ ...localConfig, accountKey: e.target.value })}
                  placeholder="Paste your LTA AccountKey here..."
                  className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Custom Proxy URL Input */}
              {localConfig.source === 'custom_proxy' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Backend Proxy Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={localConfig.proxyUrl}
                    onChange={(e) => setLocalConfig({ ...localConfig, proxyUrl: e.target.value })}
                    placeholder="e.g. http://localhost:3001/api/carparks or https://my-app.run.app/api/carparks"
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              )}

              {/* Refresh Interval & Simulation controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Auto-Refresh Cadence
                  </label>
                  <select
                    value={localConfig.refreshIntervalSeconds}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, refreshIntervalSeconds: parseInt(e.target.value, 10) })
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value={15}>Every 15 seconds (High real-time frequency)</option>
                    <option value={30}>Every 30 seconds (Recommended)</option>
                    <option value={60}>Every 60 seconds (Standard LTA rate)</option>
                    <option value={120}>Every 2 minutes</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={localConfig.autoRefresh}
                      onChange={(e) => setLocalConfig({ ...localConfig, autoRefresh: e.target.checked })}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="font-medium">Enable Background Auto-Polling</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={localConfig.simulateFluctuation}
                      onChange={(e) => setLocalConfig({ ...localConfig, simulateFluctuation: e.target.checked })}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="font-medium">Simulate Vehicle Movements in Workshop Mode</span>
                  </label>
                </div>
              </div>

              {/* Connection Test Output */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={isTesting}
                  className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing Endpoint...' : 'Test Connection Now'}</span>
                </button>

                {testResult && (
                  <div
                    className={`mt-2 p-3 rounded-lg text-xs flex items-start gap-2 border ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {testResult.success ? (
                      <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    )}
                    <div>
                      <div className="font-semibold">{testResult.message}</div>
                      {testResult.count !== undefined && (
                        <div className="mt-0.5 font-mono">Payload received: {testResult.count} carparks</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'express' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Ready-to-use Express backend proxy script. Handles CORS and forwards your LTA AccountKey securely.
                </p>
                <button
                  onClick={() => handleCopy(expressCode, 'express')}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                >
                  {copiedCode === 'express' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'express' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                {expressCode}
              </pre>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Quick Setup Instructions:</div>
                <div>1. Run <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">npm install express cors</code></div>
                <div>2. Save above snippet as <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">server.js</code></div>
                <div>3. Set your <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">LTA_ACCOUNT_KEY</code> and run <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">node server.js</code></div>
                <div>4. In this app, select "Custom Backend Proxy" and enter <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">http://localhost:3001/api/carparks</code></div>
              </div>
            </div>
          )}

          {activeTab === 'python' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  FastAPI backend proxy script with async HTTP client (<code className="font-mono">httpx</code>).
                </p>
                <button
                  onClick={() => handleCopy(pythonCode, 'python')}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                >
                  {copiedCode === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'python' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                {pythonCode}
              </pre>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Quick Setup Instructions:</div>
                <div>1. Run <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">pip install fastapi uvicorn httpx</code></div>
                <div>2. Save above snippet as <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">main.py</code></div>
                <div>3. Run <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">uvicorn main:app --port 8000 --reload</code></div>
                <div>4. In this app, select "Custom Backend Proxy" and enter <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">http://localhost:8000/api/carparks</code></div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="font-semibold text-slate-900">Official LTA DataMall Specification</div>
                <div><span className="font-medium text-slate-600">Endpoint:</span> <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2</code></div>
                <div><span className="font-medium text-slate-600">HTTP Method:</span> <code className="font-mono">GET</code></div>
                <div><span className="font-medium text-slate-600">Header:</span> <code className="font-mono">AccountKey: YOUR_KEY</code></div>
                <div><span className="font-medium text-slate-600">Update Frequency:</span> Every 1 minute from Land Transport Authority sensors.</div>
              </div>

              <div className="space-y-1.5">
                <div className="font-semibold text-slate-900">Schema Attributes:</div>
                <ul className="space-y-1 list-disc list-inside text-slate-600">
                  <li><code className="font-mono text-slate-900 font-semibold">CarParkID</code>: Unique identifier string assigned by LTA/HDB/URA.</li>
                  <li><code className="font-mono text-slate-900 font-semibold">Area</code>: General region (e.g., Marina, Orchard, Jurong, etc.).</li>
                  <li><code className="font-mono text-slate-900 font-semibold">Development</code>: Name of shopping mall, commercial building, or housing hub.</li>
                  <li><code className="font-mono text-slate-900 font-semibold">Location</code>: String of latitude and longitude separated by space (e.g. <code className="font-mono">"1.29375 103.85718"</code>).</li>
                  <li><code className="font-mono text-slate-900 font-semibold">AvailableLots</code>: Real-time count of free parking lots available now.</li>
                  <li><code className="font-mono text-slate-900 font-semibold">LotType</code>: <code className="font-mono">C</code> (Cars), <code className="font-mono">Y</code> (Motorcycles), <code className="font-mono">H</code> (Heavy Vehicles).</li>
                  <li><code className="font-mono text-slate-900 font-semibold">Agency</code>: <code className="font-mono">LTA</code>, <code className="font-mono">HDB</code>, or <code className="font-mono">URA</code>.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Source: <span className="font-semibold text-slate-700 capitalize">{localConfig.source.replace('_', ' ')}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
