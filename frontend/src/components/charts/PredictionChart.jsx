/**
 * 24-hour energy consumption prediction chart.
 */
import Plot from 'react-plotly.js'
import { useTheme } from '../../context/ThemeContext'

export default function PredictionChart({ predictions = [], accuracy = 0 }) {
  const { isDark } = useTheme()
  const bgColor = isDark ? '#1e293b' : '#ffffff'
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  const traces = [
    {
      x: predictions.map(p => `Hour +${p.hour}`),
      y: predictions.map(p => p.predicted_kwh),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Predicted kWh',
      line: { color: '#8b5cf6', width: 2.5, shape: 'spline' },
      marker: { size: 6, color: '#8b5cf6', symbol: 'diamond' },
      fill: 'tozeroy',
      fillcolor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)',
    },
  ]

  const layout = {
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    margin: { t: 20, r: 20, b: 50, l: 50 },
    xaxis: { tickfont: { color: textColor, size: 9 }, gridcolor: gridColor, tickangle: -30 },
    yaxis: {
      tickfont: { color: textColor, size: 11 },
      gridcolor: gridColor,
      title: { text: 'kWh', font: { color: textColor, size: 11 } },
    },
    autosize: true,
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          🔮 24-Hour Energy Forecast
        </h3>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full
          ${accuracy > 70
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
          {accuracy}% accuracy
        </span>
      </div>
      {predictions.length > 0 ? (
        <Plot
          data={traces}
          layout={layout}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: '100%', height: '260px' }}
          useResizeHandler
        />
      ) : (
        <div className="flex items-center justify-center h-48 text-slate-400">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm">Not enough data for prediction</p>
          </div>
        </div>
      )}
    </div>
  )
}