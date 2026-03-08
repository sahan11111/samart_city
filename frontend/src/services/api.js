/**
 * Axios API service with auth interceptors.
 * Automatically attaches JWT token and handles 401 errors.
 */
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle global auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── API Service Functions ────────────────────────────────────────────────────

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

export const trafficService = {
  getAll: (params) => api.get('/traffic', { params }),
  create: (data) => api.post('/traffic', data),
}

export const wasteService = {
  getAll: (params) => api.get('/waste', { params }),
  create: (data) => api.post('/waste', data),
}

export const energyService = {
  getAll: (params) => api.get('/energy', { params }),
  create: (data) => api.post('/energy', data),
}

export const alertService = {
  getAll: (params) => api.get('/alerts', { params }),
}

export const predictService = {
  getEnergyForecast: () => api.get('/predict/energy'),
}

export default api