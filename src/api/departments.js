import api from './axios'

export const getDepartments          = ()               => api.get('/departments/')
export const joinClass           = (code)           => api.post('/departments/join/', { code })
export const createDepartment        = (data)           => api.post('/departments/', data)
export const getDepartment           = (id)             => api.get(`/departments/${id}/`)
export const updateDepartment        = (id, data)       => api.patch(`/departments/${id}/`, data)
export const deleteDepartment        = (id)             => api.delete(`/departments/${id}/`)

export const getClassCrew        = (id)             => api.get(`/departments/${id}/crew/`)
export const enrollCrew          = (id, identifier) => api.post(`/departments/${id}/crew/`, identifier)
export const removeCrew          = (id, uid)        => api.delete(`/departments/${id}/crew/${uid}/`)

export const getClassModules     = (id)             => api.get(`/departments/${id}/modules/`)
export const assignModule        = (id, data)       => api.post(`/departments/${id}/modules/`, data)
export const updateClassModule   = (id, lid, data)  => api.patch(`/departments/${id}/modules/${lid}/`, data)
export const unassignModule      = (id, lid)        => api.delete(`/departments/${id}/modules/${lid}/`)

export const getClassTests       = (id)             => api.get(`/departments/${id}/assignments/`)
export const getClassAssignments = getClassTests

export const getAnnouncements    = (id)             => api.get(`/departments/${id}/announcements/`)
export const createAnnouncement  = (id, data)       => api.post(`/departments/${id}/announcements/`, data)
export const updateAnnouncement  = (id, aid, data)  => api.patch(`/departments/${id}/announcements/${aid}/`, data)
export const deleteAnnouncement  = (id, aid)        => api.delete(`/departments/${id}/announcements/${aid}/`)

export const getClassCourseProgress = (id, cid)     => api.get(`/departments/${id}/courses/${cid}/progress/`)

export const getMyDiplomas       = ()               => api.get('/departments/my-diplomas/')
export const getDiplomas         = (id)             => api.get(`/departments/${id}/diplomas/`)
export const createDiploma       = (id, data)       => api.post(`/departments/${id}/diplomas/`, data)
export const updateDiploma       = (id, did, data)  => api.patch(`/departments/${id}/diplomas/${did}/`, data)
export const deleteDiploma       = (id, did)        => api.delete(`/departments/${id}/diplomas/${did}/`)
export const awardDiploma        = (id, did, data)  => api.post(`/departments/${id}/diplomas/${did}/award/`, data)
export const revokeDiploma       = (id, did, uid)   => api.delete(`/departments/${id}/diplomas/${did}/award/${uid}/`)

// Course-level diplomas (admin)
export const getCourseDiplomas   = (cid)            => api.get(`/courses/${cid}/diplomas/`)
export const createCourseDiploma = (cid, data)      => api.post(`/courses/${cid}/diplomas/`, data)
export const updateCourseDiploma = (cid, did, data) => api.patch(`/courses/${cid}/diplomas/${did}/`, data)
export const deleteCourseDiploma = (cid, did)       => api.delete(`/courses/${cid}/diplomas/${did}/`)
export const awardCourseDiploma  = (cid, did, data) => api.post(`/courses/${cid}/diplomas/${did}/award/`, data)
export const revokeCourseDiploma = (cid, did, uid)  => api.delete(`/courses/${cid}/diplomas/${did}/award/${uid}/`)
