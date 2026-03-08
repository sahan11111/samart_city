/**
 * Reusable status badge component.
 */
const variants = {
  // Congestion levels
  low:       'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  medium:    'bg-yellow-100  dark:bg-yellow-900/30  text-yellow-700  dark:text-yellow-400',
  high:      'bg-orange-100  dark:bg-orange-900/30  text-orange-700  dark:text-orange-400',
  critical:  'bg-red-100     dark:bg-red-900/30     text-red-700     dark:text-red-400',
  // Collection status
  pending:   'bg-yellow-100  dark:bg-yellow-900/30  text-yellow-700  dark:text-yellow-400',
  collected: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  overdue:   'bg-red-100     dark:bg-red-900/30     text-red-700     dark:text-red-400',
  // Generic
  active:    'bg-blue-100    dark:bg-blue-900/30    text-blue-700    dark:text-blue-400',
  inactive:  'bg-slate-100   dark:bg-slate-700      text-slate-600   dark:text-slate-400',
}

export default function StatusBadge({ status, label }) {
  const cls = variants[status?.toLowerCase()] ?? variants.inactive
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label ?? status}
    </span>
  )
}