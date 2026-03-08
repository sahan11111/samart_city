/**
 * Toast notification wrapper component.
 * Used as a portal — place once in App root.
 * Actual toasts triggered via react-hot-toast or useToast hook.
 */
import { Toaster } from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'

export default function ToastProvider() {
  const { isDark } = useTheme()

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerStyle={{ top: 70 }}
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark ? '#1e293b' : '#ffffff',
          color: isDark ? '#f1f5f9' : '#0f172a',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: '12px',
          fontSize: '0.875rem',
          padding: '12px 16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
        },
      }}
    />
  )
}