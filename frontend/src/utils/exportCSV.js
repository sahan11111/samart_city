/**
 * Utility for exporting dashboard data to CSV format.
 */

/**
 * Convert an array of objects to a CSV string.
 * @param {Object[]} data - Array of data records
 * @param {string[]} columns - Column keys to include
 * @returns {string} CSV string
 */
export function toCSV(data, columns) {
  if (!data || data.length === 0) return ''
  
  const header = columns.join(',')
  const rows = data.map(row =>
    columns.map(col => {
      const val = row[col] ?? ''
      // Escape values containing commas or quotes
      return typeof val === 'string' && (val.includes(',') || val.includes('"'))
        ? `"${val.replace(/"/g, '""')}"`
        : val
    }).join(',')
  )
  
  return [header, ...rows].join('\n')
}

/**
 * Trigger a CSV file download in the browser.
 * @param {Object[]} data - Data records to export
 * @param {string[]} columns - Column headers
 * @param {string} filename - Output filename (without extension)
 */
export function downloadCSV(data, columns, filename = 'export') {
  const csv = toCSV(data, columns)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}