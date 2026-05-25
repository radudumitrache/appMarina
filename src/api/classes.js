import api from './axios'

export const getClasses          = ()               => api.get('/classes/')
export const joinClass           = (code)           => api.post('/classes/join/', { code })
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

export const getClassTests       = (id)             => api.get(`/classes/${id}/assignments/`)
export const getClassAssignments = getClassTests

export const getAnnouncements    = (id)             => api.get(`/classes/${id}/announcements/`)
export const createAnnouncement  = (id, data)       => api.post(`/classes/${id}/announcements/`, data)
export const updateAnnouncement  = (id, aid, data)  => api.patch(`/classes/${id}/announcements/${aid}/`, data)
export const deleteAnnouncement  = (id, aid)        => api.delete(`/classes/${id}/announcements/${aid}/`)

export const getClassCourseProgress = (id, cid)     => api.get(`/classes/${id}/courses/${cid}/progress/`)

export const getMyDiplomas       = ()               => api.get('/classes/my-diplomas/')
export const getDiplomas         = (id)             => api.get(`/classes/${id}/diplomas/`)
export const createDiploma       = (id, data)       => api.post(`/classes/${id}/diplomas/`, data)
export const updateDiploma       = (id, did, data)  => api.patch(`/classes/${id}/diplomas/${did}/`, data)
export const deleteDiploma       = (id, did)        => api.delete(`/classes/${id}/diplomas/${did}/`)
export const awardDiploma        = (id, did, data)  => api.post(`/classes/${id}/diplomas/${did}/award/`, data)
export const revokeDiploma       = (id, did, uid)   => api.delete(`/classes/${id}/diplomas/${did}/award/${uid}/`)

// Course-level diplomas (admin)
export const getCourseDiplomas   = (cid)            => api.get(`/courses/${cid}/diplomas/`)
export const createCourseDiploma = (cid, data)      => api.post(`/courses/${cid}/diplomas/`, data)
export const updateCourseDiploma = (cid, did, data) => api.patch(`/courses/${cid}/diplomas/${did}/`, data)
export const deleteCourseDiploma = (cid, did)       => api.delete(`/courses/${cid}/diplomas/${did}/`)
export const awardCourseDiploma  = (cid, did, data) => api.post(`/courses/${cid}/diplomas/${did}/award/`, data)
export const revokeCourseDiploma = (cid, did, uid)  => api.delete(`/courses/${cid}/diplomas/${did}/award/${uid}/`)
