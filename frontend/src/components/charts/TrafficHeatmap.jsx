/**
 * Traffic congestion heatmap by location.
 */
import Plot from 'react-plotly.js'
import { useTheme } from '../../context/ThemeContext'

export default function TrafficHeatmap({ data = [] }) {
  const { isDark } = useTheme()
  const bgColor = isDark ? '#1e293b' : '#ffffff'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  // Group by location and hour
  const locationMap = {}
  data.forEach(d => {
    const hour = new Date(d.timestamp).getHours()
    if (!locationMap[d.location]) locationMap[d.location] = {}
    if (!locationMap[d.location][hour]) locationMap[d.location][hour] = []
    locationMap[d.location][hour].push(d.congestion_level)
  })

  const locations = Object.keys(locationMap).slice(0, 6)
  const hours = [...Array(24).keys()]

  const zMatrix = locations.map(loc =>
    hours.map(h => {
      const arr = locationMap[loc]?.[h] || []
      return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
    })
  )

  const traces = [{
    z: zMatrix,
    x: hours.map(h => `${h}:00`),
    y: locations,
    type: 'heatmap',
    colorscale: [
      [0, '#10b981'],
      [0.5, '#eab308'],
      [0.8, '#f97316'],
      [1, '#ef4444'],
    ],
    showscale: true,
    colorbar: {
      title: 'Congestion %',
      titlefont: { color: textColor, size: 11 },
      tickfont: { color: textColor, size: 10 },
      len: 0.8,
    },
  }]

  const layout = {
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    margin: { t: 20, r: 80, b: 50, l: 120 },
    xaxis: { tickfont: { color: textColor, size: 10 }, title: { text: 'Hour of Day', font: { color: textColor } } },
    yaxis: { tickfont: { color: textColor, size: 10 } },
    autosize: true,
  }

  return (
    <div className="card">
      <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        🚦 Traffic Congestion Heatmap
      </h3>
      <Plot
        data={traces}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '280px' }}
        useResizeHandler
      />
    </div>
  )
}