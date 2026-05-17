import api from './axios'

export const getOrganisations    = ()           => api.get('/admin/organisations/')
export const createOrganisation  = (data)       => api.post('/admin/organisations/', data)
export const updateOrganisation  = (id, data)   => api.patch(`/admin/organisations/${id}/`, data)
export const deleteOrganisation  = (id)         => api.delete(`/admin/organisations/${id}/`)
export const getOrgMembers       = (id)         => api.get(`/admin/organisations/${id}/members/`)
export const assignOrgMembers    = (id, userIds) => api.post(`/admin/organisations/${id}/members/`, { user_ids: userIds })
export const removeOrgMembers    = (id, userIds) => api.delete(`/admin/organisations/${id}/members/`, { data: { user_ids: userIds } })
