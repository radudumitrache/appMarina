import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

const STORAGE_KEY         = 'seafarer_user'
const REFRESH_STORAGE_KEY = 'seafarer_refresh'

export function AuthProvider({ children }) {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
  })()

  const [user, setUser]       = useState(storedUser)
  const [loading, setLoading] = useState(true)

  // On app load: restore session from stored refresh token
  useEffect(() => {
    const refreshToken = localStorage.getItem(REFRESH_STORAGE_KEY)
    if (!refreshToken) {
      localStorage.removeItem(STORAGE_KEY)
      setUser(null)
      setLoading(false)
      return
    }

    api.post('/auth/token/refresh/', { refresh: refreshToken })
      .then(({ data }) => {
        sessionStorage.setItem('access_token', data.access)
        if (data.refresh) localStorage.setItem(REFRESH_STORAGE_KEY, data.refresh)
        return api.get('/users/me/')
      })
      .then(({ data }) => {
        const u = { id: data.id, username: data.username, role: data.profile.role }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
        setUser(u)
      })
      .catch(() => {
        localStorage.removeItem(REFRESH_STORAGE_KEY)
        localStorage.removeItem(STORAGE_KEY)
        sessionStorage.removeItem('access_token')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password })
    sessionStorage.setItem('access_token', data.access)
    localStorage.setItem(REFRESH_STORAGE_KEY, data.refresh)
    const u = { id: data.user_id, username, role: data.role }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
    return data.role
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem(REFRESH_STORAGE_KEY)
    try {
      await api.post('/auth/logout/', { refresh: refreshToken })
    } catch (_) { /* ignore */ }
    sessionStorage.removeItem('access_token')
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(REFRESH_STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
