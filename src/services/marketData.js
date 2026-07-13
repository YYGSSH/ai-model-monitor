/**
 * AI Model Performance Data Simulation Service
 *
 * Generates realistic model performance metrics using statistical models
 * with mean reversion and trend behavior, simulating real ML model monitoring.
 */

const MODELS = {
  GPT4:    { name: 'GPT-4 Turbo',         category: 'LLM',        baseMetric: 92.5, volatility: 0.008, meanReversion: 0.03 },
  CLAUDE:  { name: 'Claude 3.5 Sonnet',    category: 'LLM',        baseMetric: 94.1, volatility: 0.006, meanReversion: 0.025 },
  LLAMA:   { name: 'Llama 3 70B',          category: 'LLM',        baseMetric: 88.7, volatility: 0.012, meanReversion: 0.02 },
  MISTRAL: { name: 'Mistral Large',        category: 'LLM',        baseMetric: 90.3, volatility: 0.010, meanReversion: 0.022 },
  GEMINI:  { name: 'Gemini Ultra',         category: 'LLM',        baseMetric: 91.8, volatility: 0.007, meanReversion: 0.028 },
  DEEPSEEK:{ name: 'DeepSeek V3',          category: 'LLM',        baseMetric: 89.5, volatility: 0.011, meanReversion: 0.02 },
  SDXL:    { name: 'Stable Diffusion XL',  category: 'Image',      baseMetric: 85.2, volatility: 0.015, meanReversion: 0.015 },
  DALL_E:  { name: 'DALL-E 3',             category: 'Image',      baseMetric: 90.1, volatility: 0.009, meanReversion: 0.025 },
  WHISPER: { name: 'Whisper Large',        category: 'Audio',      baseMetric: 93.0, volatility: 0.005, meanReversion: 0.03 },
  TTS:     { name: 'Neural TTS',           category: 'Audio',      baseMetric: 87.6, volatility: 0.013, meanReversion: 0.018 },
  RERANK:  { name: 'Rerank Model v2',      category: 'NLP',        baseMetric: 91.2, volatility: 0.009, meanReversion: 0.022 },
  EMBED:   { name: 'Embedding v3',         category: 'NLP',        baseMetric: 86.8, volatility: 0.014, meanReversion: 0.016 },
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
