import { create } from 'zustand'
import { generateHistoricalData, generateTick, getModels } from '../services/marketData'

const useModelStore = create((set, get) => ({
  selectedModel: 'GEMINI25P',
  interval: '1h',

  metrics: [],
  currentAccuracy: 0,
  currentLatency: 0,
  currentThroughput: 0,
  currentErrorRate: 0,
  previousAccuracy: 0,
  dayChange: 0,
  dayChangePercent: 0,
  dayAvgLatency: 0,
  avgErrorRate: 0,

  tickers: {},
  models: getModels(),
  watchlist: ['GEMINI25P', 'GPTO4', 'DSEEKR1', 'CLAUDE35', 'DSEEKV3', 'GEMINI20F', 'QWEN25', 'LLAMA31'],
  updateInterval: null,

  initializeModel: (modelId) => {
    const metrics = generateHistoricalData(modelId, 200, get().interval)
    const last = metrics[metrics.length - 1]
    const first = metrics[0]
    const last24 = metrics.slice(-24)

    set({
      selectedModel: modelId,
      metrics,
      currentAccuracy: last.accuracy,
      currentLatency: last.latency,
      currentThroughput: last.throughput,
      currentErrorRate: last.errorRate,
      previousAccuracy: first.accuracy,
      dayChange: last.accuracy - first.accuracy,
      dayChangePercent: ((last.accuracy - first.accuracy) / first.accuracy) * 100,
      dayAvgLatency: last24.reduce((s, m) => s + m.latency, 0) / last24.length,
      avgErrorRate: last24.reduce((s, m) => s + m.errorRate, 0) / last24.length,
    })
  },

  initializeTickers: () => {
    const tickers = {}
    const watchlist = get().watchlist
    for (const modelId of watchlist) {
      const metrics = generateHistoricalData(modelId, 50, '1h')
      const last = metrics[metrics.length - 1]
      const prev = metrics[metrics.length - 2]
      tickers[modelId] = {
        modelId,
        accuracy: last.accuracy,
        change: last.accuracy - prev.accuracy,
        changePercent: ((last.accuracy - prev.accuracy) / prev.accuracy) * 100,
        latency: last.latency,
        throughput: last.throughput,
        errorRate: last.errorRate,
        sparkline: metrics.slice(-20).map(m => m.accuracy),
      }
    }
    set({ tickers })
  },

  tick: () => {
    const state = get()
    const { selectedModel, currentAccuracy, metrics, watchlist, tickers } = state

    const tickData = generateTick(selectedModel, currentAccuracy)
    if (!tickData) return

    const newMetrics = [...metrics]
    const lastPoint = { ...newMetrics[newMetrics.length - 1] }
    lastPoint.accuracy = tickData.accuracy
    lastPoint.latency = tickData.latency
    lastPoint.throughput = tickData.throughput
    lastPoint.errorRate = tickData.errorRate
    newMetrics[newMetrics.length - 1] = lastPoint

    const newTickers = { ...tickers }
    for (const mid of watchlist) {
      if (mid === selectedModel) {
        newTickers[mid] = {
          ...newTickers[mid],
          accuracy: tickData.accuracy,
          change: tickData.change,
          changePercent: tickData.changePercent,
          latency: tickData.latency,
          throughput: tickData.throughput,
          errorRate: tickData.errorRate,
        }
      } else if (newTickers[mid]) {
        const t = generateTick(mid, newTickers[mid].accuracy)
        if (t) {
          newTickers[mid] = {
            ...newTickers[mid],
            accuracy: t.accuracy,
            change: t.change,
            changePercent: t.changePercent,
            latency: t.latency,
            throughput: t.throughput,
            errorRate: t.errorRate,
          }
        }
      }
    }

    set({
      currentAccuracy: tickData.accuracy,
      currentLatency: tickData.latency,
      currentThroughput: tickData.throughput,
      currentErrorRate: tickData.errorRate,
      dayChange: tickData.accuracy - state.previousAccuracy,
      dayChangePercent: ((tickData.accuracy - state.previousAccuracy) / state.previousAccuracy) * 100,
      metrics: newMetrics,
      tickers: newTickers,
    })
  },

  startRealtime: () => {
    const existing = get().updateInterval
    if (existing) clearInterval(existing)
    const interval = setInterval(() => { get().tick() }, 1500)
    set({ updateInterval: interval })
  },

  stopRealtime: () => {
    const interval = get().updateInterval
    if (interval) {
      clearInterval(interval)
      set({ updateInterval: null })
    }
  },

  selectModel: (modelId) => { get().initializeModel(modelId) },
  setInterval: (interval) => {
    set({ interval })
    get().initializeModel(get().selectedModel)
  },
}))

export default useModelStore
