import api from './axios'

export const getUsers        = (params) => api.get('/admin/users/', { params })
export const getTrainers     = ()       => api.get('/admin/users/', { params: { 'userprofile__role': 'trainer' } })
export const createUser      = (data)   => api.post('/admin/users/', data)
export const bulkCreateUsers = (data)   => api.post('/admin/users/bulk/', data)
export const updateUser      = (id, d)  => api.patch(`/admin/users/${id}/`, d)
export const deleteUser      = (id)     => api.delete(`/admin/users/${id}/`)
export const getAnalytics            = ()     => api.get('/admin/analytics/')
export const getCrewProgress         = (id)   => api.get(`/admin/crew/${id}/progress/`)
export const getSubmission           = (sid)        => api.get(`/admin/submissions/${sid}/`)
export const patchSubmission         = (sid, data)  => api.patch(`/admin/submissions/${sid}/`, data)
