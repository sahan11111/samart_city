/**
 * Alert notification panel showing real-time system alerts.
 */

const severityConfig = {
  critical: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-400', badge: 'bg-red-500', icon: '🚨' },
  high: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-400', badge: 'bg-orange-500', icon: '⚠️' },
  medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-400', badge: 'bg-yellow-500', icon: '⚡' },
  low: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-400', badge: 'bg-blue-500', icon: 'ℹ️' },
}

const typeIcon = { traffic: '🚦', waste: '♻️', energy: '⚡' }

export default function AlertPanel({ alerts = [], loading }) {
  if (loading) {
    return (
      <div className="card">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          🔔 Live Alerts
        </h3>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse h-16 bg-slate-100 dark:bg-slate-700 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          🔔 Live Alerts
          {alerts.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
              {alerts.length}
            </span>
          )}
        </h3>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm">All systems normal</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity] || severityConfig.medium
            return (
              <div
                key={alert.id}
                className={`flex gap-3 p-3 rounded-xl border ${config.bg} ${config.border} animate-fade-in`}
              >
                <span className="text-lg flex-shrink-0">{typeIcon[alert.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold uppercase ${config.text}`}>{alert.severity}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-tight">{alert.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}