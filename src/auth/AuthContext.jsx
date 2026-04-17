import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

const STORAGE_KEY = 'seafarer_user'

export function AuthProvider({ children }) {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
  })()

  const [user, setUser]       = useState(storedUser)
  // Only show a loading spinner if there's no stored user to show immediately
  const [loading, setLoading] = useState(!storedUser)

  // On app load: try to get a fresh access token via the httpOnly refresh-token cookie
  useEffect(() => {
    api.post('/auth/token/refresh/', {}, { withCredentials: true })
      .then(({ data }) => {
        sessionStorage.setItem('access_token', data.access)
        return api.get('/users/me/')
      })
      .then(({ data }) => {
        const u = { id: data.id, username: data.username, role: data.profile.role }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
        setUser(u)
      })
      .catch(() => {
        // Refresh failed — only force logout if we had no stored session
        // (if we did have one, the axios interceptor will catch real 401s)
        if (!storedUser) {
          sessionStorage.removeItem('access_token')
          setUser(null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password })
    // data = { access, refresh, role, user_id }
    sessionStorage.setItem('access_token', data.access)
    const u = { id: data.user_id, username, role: data.role }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
    return data.role  // caller uses this to redirect to the right dashboard
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout/', {})
    } catch (_) { /* ignore */ }
    sessionStorage.removeItem('access_token')
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
