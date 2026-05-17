import api from './axios'

export const getDepartments   = ()           => api.get('/admin/departments/')
export const createDepartment = (data)       => api.post('/admin/departments/', data)
export const updateDepartment = (id, data)   => api.patch(`/admin/departments/${id}/`, data)
export const deleteDepartment = (id)         => api.delete(`/admin/departments/${id}/`)
export const getDeptMembers   = (id)         => api.get(`/admin/departments/${id}/members/`)
export const assignDeptMembers = (id, userIds) => api.post(`/admin/departments/${id}/members/`, { user_ids: userIds })
export const removeDeptMembers = (id, userIds) => api.delete(`/admin/departments/${id}/members/`, { data: { user_ids: userIds } })
