import api from './axios'

export const getUsers     = (params) => api.get('/admin/users/', { params })
export const createUser   = (data)   => api.post('/admin/users/', data)
export const updateUser   = (id, d)  => api.patch(`/admin/users/${id}/`, d)
export const deleteUser   = (id)     => api.delete(`/admin/users/${id}/`)
export const getAnalytics = ()       => api.get('/admin/analytics/')
