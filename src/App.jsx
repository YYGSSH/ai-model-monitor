import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Activity, Zap, AlertTriangle, Brain, TrendingUp, TrendingDown, Gauge, RefreshCw, Menu, X } from 'lucide-react'
import useModelStore from './stores/marketStore'
import { getModels } from './services/marketData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar, Legend } from 'recharts'

function App() {
  const store = useModelStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    store.initializeModel('GEMINI25P')
    store.initializeTickers()
    store.startRealtime()
    return () => store.stopRealtime()
  }, [])

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-1.5 hover:bg-surface-alt rounded-lg">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Brain className="text-accent" size={24} />
          <h1 className="text-lg font-bold">AI Model Monitor <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded ml-1 font-normal">模拟数据</span></h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-text-secondary">每1.5秒模拟更新</span>
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </div>
      </header>

      <div className="flex h-[calc(100vh-53px)]">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-56' : 'w-0'} ${mobileOpen ? 'fixed inset-0 z-50 w-72' : 'hidden'} lg:block bg-surface border-r border-border overflow-y-auto transition-all duration-300`}>
          {sidebarOpen && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Models</h2>
                <button onClick={() => setSidebarOpen(false)} className="hidden lg:block p-1 hover:bg-surface-alt rounded text-text-muted">
                  <Menu size={14} />
                </button>
              </div>
              {getModels().map(model => (
                <button
                  key={model.id}
                  onClick={() => { store.selectModel(model.id); setMobileOpen(false) }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                    store.selectedModel === model.id
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'hover:bg-surface-alt text-text-secondary'
                  }`}
                >
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-text-muted mt-0.5">{model.category}</div>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto space-y-5">

            {/* Model Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{getModels().find(m => m.id === store.selectedModel)?.name || store.selectedModel}</h2>
                <span className="text-sm text-text-muted">{getModels().find(m => m.id === store.selectedModel)?.category}</span>
              </div>
              <div className="flex gap-2">
                {['5m', '15m', '1h', '4h', '1d', '1w'].map(i => (
                  <button key={i} onClick={() => store.setInterval(i)}
                    className={`px-3 py-1.5 text-xs rounded-lg ${store.interval === i ? 'bg-accent text-white' : 'bg-surface-alt text-text-secondary hover:bg-border'}`}>
                    {i}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Accuracy', value: `${store.currentAccuracy?.toFixed(1) || '0'}%`, icon: <Activity size={18} />, change: store.dayChange, color: 'from-violet-500 to-purple-600' },
                { label: 'Latency', value: `${store.currentLatency?.toFixed(0) || '0'}ms`, icon: <Zap size={18} />, change: -store.currentLatency, color: 'from-cyan-500 to-blue-600' },
                { label: 'Throughput', value: `${((store.currentThroughput || 0) / 1000).toFixed(1)}k/min`, icon: <BarChart3 size={18} />, change: null, color: 'from-emerald-500 to-green-600' },
                { label: 'Error Rate', value: `${store.currentErrorRate?.toFixed(2) || '0'}%`, icon: <AlertTriangle size={18} />, change: null, color: 'from-rose-500 to-red-600' },
              ].map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-surface rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-text-muted">{m.label}</span>
                    <span className={`bg-gradient-to-br ${m.color} p-1.5 rounded-lg text-white`}>{m.icon}</span>
                  </div>
                  <div className="text-xl font-bold">{m.value}</div>
                  {m.change !== null && (
                    <div className={`flex items-center gap-1 text-xs mt-1 ${m.change >= 0 ? 'text-success' : 'text-danger'}`}>
                      {m.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span>{m.change >= 0 ? '+' : ''}{m.change.toFixed(2)}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="text-xs text-text-muted mb-1 mt-1">* 基于 LMSYS Chatbot Arena Elo 公开基准值模拟生成，非实时 API 数据</div>`n{/* Main Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-surface rounded-xl p-4 border border-border">
              <h3 className="text-sm font-semibold mb-4">Accuracy Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={store.metrics.slice(-100)}>
                    <defs>
                      <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2250" />
                    <XAxis dataKey="timestamp" tick={false} axisLine={false} />
                    <YAxis domain={[70, 100]} tick={{ fill: '#7c7ab8', fontSize: 11 }} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#141028', border: '1px solid #2a2250', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="accuracy" stroke="#7c3aed" fill="url(#accGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Secondary Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="bg-surface rounded-xl p-4 border border-border">
                <h3 className="text-sm font-semibold mb-4">Latency (ms)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={store.metrics.slice(-80)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2250" />
                      <XAxis dataKey="timestamp" tick={false} axisLine={false} />
                      <YAxis tick={{ fill: '#7c7ab8', fontSize: 11 }} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#141028', border: '1px solid #2a2250', borderRadius: 8 }} />
                      <Line type="monotone" dataKey="latency" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="bg-surface rounded-xl p-4 border border-border">
                <h3 className="text-sm font-semibold mb-4">Throughput & Error Rate</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={store.metrics.slice(-80)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2250" />
                      <XAxis dataKey="timestamp" tick={false} axisLine={false} />
                      <YAxis yAxisId="left" tick={{ fill: '#7c7ab8', fontSize: 11 }} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: '#7c7ab8', fontSize: 11 }} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#141028', border: '1px solid #2a2250', borderRadius: 8 }} />
                      <Bar yAxisId="left" dataKey="throughput" fill="#10b98180" radius={[2, 2, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="errorRate" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
