 
/**
 * AuthContext - Global authentication state management.
 * Stores user info, token, and provides login/logout functions.
 */
import { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Restore user from localStorage on page refresh
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  const login = useCallback(async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    const { access_token, role, username: uname } = response.data

    const userData = { username: uname, role }
    setToken(access_token)
    setUser(userData)

    // Persist to localStorage
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(userData))

    return userData
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
  }, [])

  const isAdmin = user?.role === 'admin'
  const isCitizen = user?.role === 'citizen'

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isCitizen }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}