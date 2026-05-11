import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,           // sends the httpOnly refresh-token cookie
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor — attach access token ─────────────────────────────
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor — auto-refresh on 401 ───────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/login/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('seafarer_refresh')
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/token/refresh/`,
          { refresh: refreshToken }
        )
        sessionStorage.setItem('access_token', data.access)
        if (data.refresh) localStorage.setItem('seafarer_refresh', data.refresh)
        processQueue(null, data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        sessionStorage.removeItem('access_token')
        localStorage.removeItem('seafarer_refresh')
        localStorage.removeItem('seafarer_user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
