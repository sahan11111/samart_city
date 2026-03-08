/**
 * Loading skeleton components for dashboard placeholders.
 */

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28" />
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-36" />
        </div>
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
      </div>
    </div>
  )
}

export function ChartSkeleton({ height = 'h-64' }) {
  return (
    <div className={`card animate-pulse ${height}`}>
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-4" />
      <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-xl" />
    </div>
  )
}

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height="h-72" />
        <ChartSkeleton height="h-72" />
      </div>
    </div>
  )
}