/**
 * Waste fill level bar chart grouped by zone.
 */
import Plot from 'react-plotly.js'
import { useTheme } from '../../context/ThemeContext'

export default function WasteBarChart({ data = [] }) {
  const { isDark } = useTheme()
  const bgColor = isDark ? '#1e293b' : '#ffffff'
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  // Average fill per zone
  const zoneMap = {}
  data.forEach(d => {
    if (!zoneMap[d.zone]) zoneMap[d.zone] = []
    zoneMap[d.zone].push(d.fill_percentage)
  })
  const zones = Object.keys(zoneMap)
  const avgFills = zones.map(z => {
    const arr = zoneMap[z]
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
  })

  const barColors = avgFills.map(f => {
    if (f > 90) return '#ef4444'
    if (f > 70) return '#f97316'
    if (f > 50) return '#eab308'
    return '#10b981'
  })

  const traces = [{
    x: zones,
    y: avgFills,
    type: 'bar',
    marker: {
      color: barColors,
      line: { color: barColors, width: 1 },
    },
    text: avgFills.map(v => `${v}%`),
    textposition: 'outside',
    textfont: { color: textColor, size: 11 },
  }]

  const layout = {
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    margin: { t: 20, r: 20, b: 50, l: 50 },
    xaxis: { tickfont: { color: textColor, size: 11 }, gridcolor: gridColor },
    yaxis: {
      tickfont: { color: textColor, size: 11 },
      gridcolor: gridColor,
      range: [0, 115],
      title: { text: 'Fill Level (%)', font: { color: textColor, size: 11 } },
    },
    autosize: true,
  }

  return (
    <div className="card">
      <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        ♻️ Waste Fill by Zone
      </h3>
      <Plot
        data={traces}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '260px' }}
        useResizeHandler
      />
    </div>
  )
}