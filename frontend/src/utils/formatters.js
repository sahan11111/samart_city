/**
 * Formatting utility functions for display values.
 */
import { format, formatDistanceToNow } from 'date-fns'

/**
 * Format a timestamp to human-readable local time.
 * @param {string|Date} ts
 * @returns {string}
 */
export function formatTime(ts) {
  if (!ts) return '—'
  return format(new Date(ts), 'HH:mm:ss')
}

/**
 * Format a timestamp to a full date string.
 * @param {string|Date} ts
 * @returns {string}
 */
export function formatDate(ts) {
  if (!ts) return '—'
  return format(new Date(ts), 'MMM dd, yyyy HH:mm')
}

/**
 * Format a timestamp as relative time (e.g. "5 minutes ago").
 * @param {string|Date} ts
 * @returns {string}
 */
export function timeAgo(ts) {
  if (!ts) return '—'
  return formatDistanceToNow(new Date(ts), { addSuffix: true })
}

/**
 * Format a number to a fixed decimal string.
 * @param {number} val
 * @param {number} decimals
 * @returns {string}
 */
export function toFixed(val, decimals = 1) {
  if (val == null || isNaN(val)) return '—'
  return Number(val).toFixed(decimals)
}

/**
 * Format bytes to human-readable KB/MB/GB.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

/**
 * Determine congestion severity label.
 * @param {number} level - 0-100
 * @returns {string}
 */
export function congestionLabel(level) {
  if (level >= 80) return 'Critical'
  if (level >= 60) return 'High'
  if (level >= 40) return 'Medium'
  return 'Low'
}

/**
 * Map congestion level to a color token.
 * @param {number} level
 * @returns {string}
 */
export function congestionColor(level) {
  if (level >= 80) return 'critical'
  if (level >= 60) return 'high'
  if (level >= 40) return 'medium'
  return 'low'
}