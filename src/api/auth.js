import api from './axios'

export const login          = (username, password) => api.post('/auth/login/', { username, password })
export const logout         = ()                   => api.post('/auth/logout/')
export const changePassword = (current, next)      => api.post('/auth/change-password/', { current, new: next })
