/**
 * Custom toast notification hook wrapping react-hot-toast.
 */
import toast from 'react-hot-toast'

export function useToast() {
  return {
    success: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    info: (msg) => toast(msg, { icon: 'ℹ️' }),
    warning: (msg) => toast(msg, { icon: '⚠️' }),
    loading: (msg) => toast.loading(msg),
    dismiss: (id) => toast.dismiss(id),
  }
}