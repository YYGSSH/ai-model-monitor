/**
 * AI Model Performance Data Simulation Service
 *
 * Generates realistic model performance metrics using statistical models
 * with mean reversion and trend behavior, simulating real ML model monitoring.
 * Updated with latest 2025-2026 generation models.
 */

const MODELS = {
  GPT5:    { name: 'GPT-5',               category: 'LLM',        baseMetric: 95.2, volatility: 0.006, meanReversion: 0.03 },
  OPUS48:  { name: 'Claude Opus 4.8',     category: 'LLM',        baseMetric: 95.8, volatility: 0.005, meanReversion: 0.025 },
  SONNET5: { name: 'Claude Sonnet 5',     category: 'LLM',        baseMetric: 94.5, volatility: 0.007, meanReversion: 0.028 },
  LLAMA4:  { name: 'Llama 4 Maverick',    category: 'LLM',        baseMetric: 91.2, volatility: 0.010, meanReversion: 0.02 },
  GEMINI:  { name: 'Gemini 2.5 Pro',      category: 'LLM',        baseMetric: 94.0, volatility: 0.006, meanReversion: 0.028 },
  DEEPV4:  { name: 'DeepSeek V4 Pro',     category: 'LLM',        baseMetric: 93.5, volatility: 0.008, meanReversion: 0.025 },
  QWEN:    { name: 'Qwen3-235B',          category: 'LLM',        baseMetric: 92.8, volatility: 0.009, meanReversion: 0.022 },
  GLM:     { name: 'GLM-5-Plus',          category: 'LLM',        baseMetric: 91.5, volatility: 0.010, meanReversion: 0.02 },
  MISTRAL: { name: 'Mistral Large 2',     category: 'LLM',        baseMetric: 92.0, volatility: 0.009, meanReversion: 0.022 },
  SDXL:    { name: 'FLUX.1 Pro',          category: 'Image',      baseMetric: 89.5, volatility: 0.012, meanReversion: 0.018 },
  DALL_E:  { name: 'DALL-E 4',            category: 'Image',      baseMetric: 92.5, volatility: 0.008, meanReversion: 0.025 },
  WHISPER: { name: 'Whisper Large v3',    category: 'Audio',      baseMetric: 94.0, volatility: 0.005, meanReversion: 0.03 },
  TTS:     { name: 'ElevenLabs TTS v2',   category: 'Audio',      baseMetric: 88.4, volatility: 0.011, meanReversion: 0.02 },
  RERANK:  { name: 'Cohere Rerank 3.5',   category: 'Search',     baseMetric: 92.0, volatility: 0.008, meanReversion: 0.022 },
  EMBED:   { name: 'Voyage Embedding 3',  category: 'Search',     baseMetric: 89.8, volatility: 0.010, meanReversion: 0.02 },
}

function gaussianRandom() {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

function generateDataPoint(prevValue, config, timestamp) {
  const { baseMetric, volatility, meanReversion } = config
  const reversion = meanReversion * (baseMetric - prevValue)
  const drift = reversion / baseMetric
  const returns = drift + volatility * gaussianRandom()
  const value = Math.min(100, Math.max(0, prevValue * (1 + returns)))

  // Simulate latency (in ms) — inversely correlated with performance
  const latency = 50 + Math.random() * 450 + (100 - value) * 5
  // Simulate throughput (requests/min)
  const throughput = Math.floor(200 + Math.random() * 800 + (value - 80) * 20)
  // Error rate (%)
  const errorRate = Math.max(0, 0.5 + gaussianRandom() * 0.5 + (95 - value) * 0.02)

  return {
    timestamp,
    accuracy: Math.round(value * 10) / 10,
    latency: Math.round(latency * 10) / 10,
    throughput,
    errorRate: Math.round(errorRate * 100) / 100,
    totalCalls: Math.floor(Math.random() * 50000 + 10000),
    costEstimate: Math.round((Math.random() * 0.5 + 0.1) * 100) / 100,
  }
}

export function generateHistoricalData(modelId, periods = 200, interval = '1h') {
  const config = MODELS[modelId]
  if (!config) throw new Error(`Unknown model: ${modelId}`)

  const intervalMs = {
    '1m': 60000,
    '5m': 300000,
    '15m': 900000,
    '1h': 3600000,
    '4h': 14400000,
    '1d': 86400000,
  '1w': 604800000,
  }

  const ms = intervalMs[interval] || 3600000
  const now = Date.now()
  const dataPoints = []
  let prevValue = config.baseMetric * (0.95 + Math.random() * 0.1)

  for (let i = periods - 1; i >= 0; i--) {
    const timestamp = now - i * ms
    const point = generateDataPoint(prevValue, config, timestamp)
    dataPoints.push(point)
    prevValue = point.accuracy
  }

  return dataPoints
}

export function generateTick(modelId, lastAccuracy) {
  const config = MODELS[modelId]
  if (!config) return null

  const tickVol = config.volatility * 0.1
  const reversion = config.meanReversion * 0.05 * (config.baseMetric - lastAccuracy)
  const drift = reversion / config.baseMetric
  const change = drift + tickVol * gaussianRandom()
  const newAccuracy = Math.min(100, Math.max(0, lastAccuracy * (1 + change)))

  return {
    modelId,
    accuracy: Math.round(newAccuracy * 10) / 10,
    change: Math.round((newAccuracy - lastAccuracy) * 10) / 10,
    changePercent: Math.round(((newAccuracy - lastAccuracy) / lastAccuracy) * 1000) / 10,
    latency: Math.round((50 + Math.random() * 450 + (100 - newAccuracy) * 5) * 10) / 10,
    timestamp: Date.now(),
    throughput: Math.floor(200 + Math.random() * 800 + (newAccuracy - 80) * 20),
    errorRate: Math.round(Math.max(0, 0.5 + gaussianRandom() * 0.5 + (95 - newAccuracy) * 0.02) * 100) / 100,
  }
}

export function getModels() {
  return Object.entries(MODELS).map(([id, config]) => ({
    id,
    name: config.name,
    category: config.category,
    baseMetric: config.baseMetric,
  }))
}

export function getModelConfig(modelId) {
  return MODELS[modelId] || null
}

export { MODELS }
