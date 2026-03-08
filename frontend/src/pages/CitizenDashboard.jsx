/**
 * Citizen Dashboard - Read-only public view of city metrics.
 * Shows live KPIs, charts, and alerts without management controls.
 */
import { useState, useEffect, useCallback } from 'react'
import { trafficService, wasteService, energyService, alertService } from '../services/api'
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

export default function CitizenDashboard() {
  const toast = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [traffic, setTraffic] = useState([])
  const [waste, setWaste] = useState([])
  const [energy, setEnergy] = useState([])
  const [alerts, setAlerts] = useState([])
  const [kpis, setKpis] = useState({
    totalVehicles: 0,
    avgCongestion: 0,
    highFillZones: 0,
    totalEnergy: 0,
    activeAlerts: 0,
  })

  // Real-time WebSocket updates
  const handleWSMessage = useCallback((data) => {
    if (data.type === 'dashboard_update') {
      setKpis({
        totalVehicles: data.kpis.total_vehicles,
        avgCongestion: data.kpis.avg_congestion,
        totalEnergy: data.kpis.total_energy_kwh,
        activeAlerts: data.kpis.active_alerts,
        highFillZones: kpis.highFillZones,
      })
      // Merge latest traffic/waste/energy into state
      if (data.traffic?.length) setTraffic(prev => [...data.traffic, ...prev].slice(0, 100))
      if (data.waste?.length) setWaste(prev => [...data.waste, ...prev].slice(0, 100))
      if (data.energy?.length) setEnergy(prev => [...data.energy, ...prev].slice(0, 100))
      if (data.alerts?.length) {
        setAlerts(prev => [...data.alerts, ...prev].slice(0, 50))
        toast.warning(`⚠️ New city alert received`)
      }
    }
  }, [kpis.highFillZones, toast])

  const { isConnected, lastUpdate } = useWebSocket(handleWSMessage)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [tRes, wRes, eRes, aRes] = await Promise.all([
        trafficService.getAll({ limit: 80 }),
        wasteService.getAll({ limit: 80 }),
        energyService.getAll({ limit: 80 }),
        alertService.getAll({ limit: 20, resolved: false }),
      ])

      setTraffic(tRes.data)
      setWaste(wRes.data)
      setEnergy(eRes.data)
      setAlerts(aRes.data)

      const totalVehicles = tRes.data.reduce((s, d) => s + d.vehicle_count, 0)
      const avgCongestion = tRes.data.length
        ? tRes.data.reduce((s, d) => s + d.congestion_level, 0) / tRes.data.length
        : 0
      const highFillZones = wRes.data.filter(d => d.fill_percentage > 75).length
      const totalEnergy = eRes.data.reduce((s, d) => s + d.consumption_kwh, 0)

      setKpis({
        totalVehicles,
        avgCongestion: Math.round(avgCongestion),
        highFillZones,
        totalEnergy: Math.round(totalEnergy),
        activeAlerts: aRes.data.length,
      })
    } catch {
      toast.error('Failed to load city data')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar
          onMenuToggle={() => setSidebarOpen(true)}
          isConnected={isConnected}
          lastUpdate={lastUpdate}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                City Overview
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Live city infrastructure status
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadCSV(energy, ['sector', 'consumption_kwh', 'peak_load', 'timestamp'], 'energy_public')}
                className="btn-secondary text-xs py-2 px-3"
              >
                📥 Export Energy
              </button>
              <button onClick={fetchData} className="btn-primary text-xs py-2 px-4">
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* City Status Banner */}
          <div className={`rounded-2xl p-4 flex items-center gap-4 border
            ${kpis.activeAlerts > 3
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'}`}>
            <span className="text-3xl">{kpis.activeAlerts > 3 ? '⚠️' : '✅'}</span>
            <div>
              <p className={`font-bold text-sm ${kpis.activeAlerts > 3 ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {kpis.activeAlerts > 3 ? 'City Attention Required' : 'City Systems Operating Normally'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {kpis.activeAlerts} active alert{kpis.activeAlerts !== 1 ? 's' : ''} · Last updated {lastUpdate?.toLocaleTimeString() ?? '—'}
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KPICard title="Vehicles on Road" value={kpis.totalVehicles} icon="🚗" color="blue" loading={loading} />
            <KPICard title="Avg Congestion" value={kpis.avgCongestion} unit="%" icon="🚦" color="orange" loading={loading} />
            <KPICard title="Overdue Zones" value={kpis.highFillZones} icon="♻️" color="green" loading={loading} />
            <KPICard title="Energy Today" value={Math.round(kpis.totalEnergy)} unit="kWh" icon="⚡" color="purple" loading={loading} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnergyLineChart data={energy} />
            <WasteBarChart data={waste} />
          </div>

          <TrafficHeatmap data={traffic} />

          {/* Alerts */}
          <AlertPanel alerts={alerts} loading={loading} />

          {/* Public Info Footer */}
          <div className="card bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border-blue-100 dark:border-blue-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              📡 Data refreshed automatically every 5 seconds via live sensors ·
              For emergencies contact City Services: <span className="font-semibold text-slate-700 dark:text-slate-200">1-800-SMART-CITY</span>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}