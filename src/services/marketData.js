/**
 * AI Model Performance Data Simulation Service
 *
 * Benchmark data sourced from Artificial Analysis Intelligence Index (July 2026).
 * Real-time metric simulation uses mean-reversion + Gaussian noise around
 * each model's actual benchmark score.
 *
 * Data source: https://artificialanalysis.ai/leaderboards/models
 */

const MODELS = {
  // === LLM — Data: Artificial Analysis Intelligence Index ===
  CLAUDE5:  { name: 'Claude Fable 5',       category: 'LLM',  baseMetric: 97.5, volatility: 0.004, meanReversion: 0.035, realScore: 60, source: 'Artificial Analysis' },
  GPT56S:   { name: 'GPT-5.6 Sol',           category: 'LLM',  baseMetric: 97.1, volatility: 0.005, meanReversion: 0.030, realScore: 59, source: 'Artificial Analysis' },
  OPUS48:   { name: 'Claude Opus 4.8',       category: 'LLM',  baseMetric: 95.9, volatility: 0.006, meanReversion: 0.028, realScore: 56, source: 'Artificial Analysis' },
  GPT55:    { name: 'GPT-5.5',               category: 'LLM',  baseMetric: 95.5, volatility: 0.007, meanReversion: 0.028, realScore: 55, source: 'Artificial Analysis' },
  GROK45:   { name: 'Grok 4.5',              category: 'LLM',  baseMetric: 95.0, volatility: 0.008, meanReversion: 0.025, realScore: 54, source: 'Artificial Analysis' },
  SONNET5:  { name: 'Claude Sonnet 5',       category: 'LLM',  baseMetric: 94.6, volatility: 0.007, meanReversion: 0.025, realScore: 53, source: 'Artificial Analysis' },
  GLM52:    { name: 'GLM-5.2',               category: 'LLM',  baseMetric: 93.8, volatility: 0.009, meanReversion: 0.022, realScore: 51, source: 'Artificial Analysis' },
  GEMINI35: { name: 'Gemini 3.5 Flash',      category: 'LLM',  baseMetric: 93.4, volatility: 0.008, meanReversion: 0.025, realScore: 50, source: 'Artificial Analysis' },
  QWEN37:   { name: 'Qwen3.7 Max',           category: 'LLM',  baseMetric: 92.1, volatility: 0.009, meanReversion: 0.022, realScore: 46, source: 'Artificial Analysis' },
  DEEPV4:   { name: 'DeepSeek V4 Pro',       category: 'LLM',  baseMetric: 91.3, volatility: 0.010, meanReversion: 0.020, realScore: 44, source: 'Artificial Analysis' },
  LLAMA4:   { name: 'Llama 4 Maverick',      category: 'LLM',  baseMetric: 85.0, volatility: 0.013, meanReversion: 0.018, realScore: 24, source: 'Artificial Analysis' },

  // === Image — Industry benchmark estimates ===
  FLUX:     { name: 'FLUX.1 Pro',            category: 'Image', baseMetric: 91.8, volatility: 0.010, meanReversion: 0.020, realScore: null, source: 'Estimated (HPSv2 / GenEval)' },
  DALLE4:   { name: 'DALL-E 4',              category: 'Image', baseMetric: 92.5, volatility: 0.008, meanReversion: 0.022, realScore: null, source: 'Estimated (HPSv2 / GenEval)' },

  // === Audio — Industry benchmark estimates ===
  WHISPER:  { name: 'Whisper Large v3',      category: 'Audio', baseMetric: 94.0, volatility: 0.005, meanReversion: 0.030, realScore: null, source: 'Estimated (WER / RealText)' },
  ELEVEN:   { name: 'ElevenLabs TTS v2',     category: 'Audio', baseMetric: 90.2, volatility: 0.009, meanReversion: 0.022, realScore: null, source: 'Estimated (MOS / UTMOS)' },

  // === Search / RAG — Industry benchmark estimates ===
  RERANK:   { name: 'Cohere Rerank 3.5',     category: 'Search', baseMetric: 92.0, volatility: 0.007, meanReversion: 0.025, realScore: null, source: 'Estimated (NDCG / MRR)' },
  VOYAGE:   { name: 'Voyage Embedding 3',    category: 'Search', baseMetric: 91.5, volatility: 0.008, meanReversion: 0.022, realScore: null, source: 'Estimated (MTEB)' },
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

  const latency = 50 + Math.random() * 450 + (100 - value) * 5
  const throughput = Math.floor(200 + Math.random() * 800 + (value - 80) * 20)
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
    '1m': 60000, '5m': 300000, '15m': 900000,
    '1h': 3600000, '4h': 14400000, '1d': 86400000, '1w': 604800000,
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
    realScore: config.realScore,
    source: config.source,
  }))
}

export function getModelConfig(modelId) {
  return MODELS[modelId] || null
}

export { MODELS }
