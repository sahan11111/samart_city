/**
 * Admin Dashboard - Full access to all sensors, analytics, and management tools.
 */
import { useState, useEffect, useCallback } from 'react'
import { trafficService, wasteService, energyService, alertService, predictService } from '../services/api'
import { useWebSocket } from '../hooks/useWebSocket'
import { useToast } from '../hooks/useToast'
import { downloadCSV } from '../utils/exportCSV'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import KPICard from '../components/KPICard'
import AlertPanel from '../components/AlertPanel'
import EnergyLineChart from '../components/charts/EnergyLineChart'
import WasteBarChart from '../components/charts/WasteBarChart'
import TrafficHeatmap from '../components/charts/TrafficHeatmap'
import PredictionChart from '../components/charts/PredictionChart'

export default function AdminDashboard() {
  const toast = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Data state
  const [traffic, setTraffic] = useState([])
  const [waste, setWaste] = useState([])
  const [energy, setEnergy] = useState([])
  const [alerts, setAlerts] = useState([])
  const [prediction, setPrediction] = useState({ predictions: [], accuracy: 0 })
  const [kpis, setKpis] = useState({
    totalVehicles: 0,
    avgCongestion: 0,
    highFillZones: 0,
    totalEnergy: 0,
    activeAlerts: 0,
  })

  // Filters
  const [filters, setFilters] = useState({ location: '', zone: '', sector: '' })

  // WebSocket handler
  const handleWSMessage = useCallback((data) => {
    if (data.type === 'dashboard_update') {
      setKpis({
        totalVehicles: data.kpis.total_vehicles,
        avgCongestion: data.kpis.avg_congestion,
        totalEnergy: data.kpis.total_energy_kwh,
        activeAlerts: data.kpis.active_alerts,
      })
      if (data.alerts?.length > 0) {
        setAlerts(prev => [...data.alerts, ...prev].slice(0, 50))
        toast.warning(`⚠️ ${data.alerts.length} new alert(s) received`)
      }
    }
  }, [])

  const { isConnected, lastUpdate } = useWebSocket(handleWSMessage)

  // Initial data fetch
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [tRes, wRes, eRes, aRes] = await Promise.all([
        trafficService.getAll({ limit: 100, location: filters.location || undefined }),
        wasteService.getAll({ limit: 100, zone: filters.zone || undefined }),
        energyService.getAll({ limit: 100, sector: filters.sector || undefined }),
        alertService.getAll({ limit: 30, resolved: false }),
      ])
      setTraffic(tRes.data)
      setWaste(wRes.data)
      setEnergy(eRes.data)
      setAlerts(aRes.data)

      // Compute KPIs from fetched data
      const totalVehicles = tRes.data.reduce((s, d) => s + d.vehicle_count, 0)
      const avgCongestion = tRes.data.length
        ? tRes.data.reduce((s, d) => s + d.congestion_level, 0) / tRes.data.length
        : 0
      const highFillZones = wRes.data.filter(d => d.fill_percentage > 75).length
      const totalEnergy = eRes.data.reduce((s, d) => s + d.consumption_kwh, 0)
      setKpis({ totalVehicles, avgCongestion: Math.round(avgCongestion), highFillZones, totalEnergy: Math.round(totalEnergy), activeAlerts: aRes.data.length })
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch prediction separately
  const fetchPrediction = useCallback(async () => {
    try {
      const res = await predictService.getEnergyForecast()
      setPrediction({ predictions: res.data.predictions, accuracy: res.data.model_accuracy })
    } catch {
      // Silently fail if not enough data
    }
  }, [])

  useEffect(() => {
    fetchData()
    fetchPrediction()
  }, [fetchData, fetchPrediction])

  const handleExport = (type) => {
    const exportMap = {
      traffic: { data: traffic, cols: ['id', 'location', 'vehicle_count', 'congestion_level', 'speed_avg', 'timestamp'] },
      waste: { data: waste, cols: ['id', 'zone', 'fill_percentage', 'collection_status', 'weight_kg', 'timestamp'] },
      energy: { data: energy, cols: ['id', 'sector', 'consumption_kwh', 'peak_load', 'renewable_percentage', 'timestamp'] },
    }
    const { data, cols } = exportMap[type]
    downloadCSV(data, cols, `${type}_data`)
    toast.success(`${type} data exported!`)
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar
          onMenuToggle={() => setSidebarOpen(true)}
          isConnected={isConnected}
          lastUpdate={lastUpdate}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time city monitoring & analytics
              </p>
            </div>
            {/* Export Buttons */}
            <div className="flex gap-2 flex-wrap">
              {['traffic', 'waste', 'energy'].map(type => (
                <button
                  key={type}
                  onClick={() => handleExport(type)}
                  className="btn-secondary text-xs py-2 px-3 capitalize"
                >
                  📥 Export {type}
                </button>
              ))}
              <button
                onClick={fetchData}
                className="btn-primary text-xs py-2 px-4"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="card p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Location Filter</label>
                <input
                  className="input-field text-sm py-2"
                  placeholder="e.g. Downtown"
                  value={filters.location}
                  onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Zone Filter</label>
                <input
                  className="input-field text-sm py-2"
                  placeholder="e.g. Zone A"
                  value={filters.zone}
                  onChange={e => setFilters(f => ({ ...f, zone: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Sector Filter</label>
                <input
                  className="input-field text-sm py-2"
                  placeholder="e.g. Industrial"
                  value={filters.sector}
                  onChange={e => setFilters(f => ({ ...f, sector: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <button onClick={fetchData} className="btn-primary text-sm w-full">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KPICard title="Total Vehicles" value={kpis.totalVehicles} icon="🚗" color="blue" loading={loading} />
            <KPICard title="Avg Congestion" value={kpis.avgCongestion} unit="%" icon="🚦" color="orange" loading={loading} />
            <KPICard title="High Fill Zones" value={kpis.highFillZones} icon="♻️" color="green" loading={loading} />
            <KPICard title="Energy Usage" value={Math.round(kpis.totalEnergy)} unit="kWh" icon="⚡" color="purple" loading={loading} />
          </div>

          {/* Analytics Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Active Alerts', value: kpis.activeAlerts, icon: '🔔', danger: kpis.activeAlerts > 5 },
              { label: 'Data Points Collected', value: traffic.length + waste.length + energy.length, icon: '📡', danger: false },
              { label: 'Prediction Accuracy', value: `${prediction.accuracy}%`, icon: '🔮', danger: false },
            ].map((item) => (
              <div key={item.label} className={`card flex items-center gap-4 ${item.danger ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' : ''}`}>
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className={`text-xl font-bold ${item.danger ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnergyLineChart data={energy} />
            <WasteBarChart data={waste} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrafficHeatmap data={traffic} />
            <PredictionChart predictions={prediction.predictions} accuracy={prediction.accuracy} />
          </div>

          {/* Alert Panel */}
          <AlertPanel alerts={alerts} loading={loading} />
        </main>
      </div>
    </div>
  )
}