import api from './axios'

export const getClasses          = ()               => api.get('/classes/')
export const createClass         = (data)           => api.post('/classes/', data)
export const getClass            = (id)             => api.get(`/classes/${id}/`)
export const updateClass         = (id, data)       => api.patch(`/classes/${id}/`, data)
export const deleteClass         = (id)             => api.delete(`/classes/${id}/`)

export const getClassStudents    = (id)             => api.get(`/classes/${id}/students/`)
export const enrollStudent       = (id, identifier) => api.post(`/classes/${id}/students/`, identifier)
export const removeStudent       = (id, uid)        => api.delete(`/classes/${id}/students/${uid}/`)

export const getClassLessons     = (id)             => api.get(`/classes/${id}/lessons/`)
export const assignLesson        = (id, data)       => api.post(`/classes/${id}/lessons/`, data)
export const updateClassLesson   = (id, lid, data)  => api.patch(`/classes/${id}/lessons/${lid}/`, data)
export const unassignLesson      = (id, lid)        => api.delete(`/classes/${id}/lessons/${lid}/`)

export const getClassAssignments = (id)             => api.get(`/classes/${id}/assignments/`)

export const getAnnouncements    = (id)             => api.get(`/classes/${id}/announcements/`)
export const createAnnouncement  = (id, data)       => api.post(`/classes/${id}/announcements/`, data)
export const updateAnnouncement  = (id, aid, data)  => api.patch(`/classes/${id}/announcements/${aid}/`, data)
export const deleteAnnouncement  = (id, aid)        => api.delete(`/classes/${id}/announcements/${aid}/`)
