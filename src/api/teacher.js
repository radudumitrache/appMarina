import api from './axios'

export const getTeacherStudentProgress = (id)        => api.get(`/teacher/students/${id}/progress/`)
export const getTeacherSubmission       = (sid)       => api.get(`/teacher/submissions/${sid}/`)
export const patchTeacherSubmission     = (sid, data) => api.patch(`/teacher/submissions/${sid}/`, data)
