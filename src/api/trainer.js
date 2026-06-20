import api from './axios'

export const getTrainerStudentProgress = (id)        => api.get(`/trainer/students/${id}/progress/`)
export const getTrainerSubmission       = (sid)       => api.get(`/trainer/submissions/${sid}/`)
export const patchTrainerSubmission     = (sid, data) => api.patch(`/trainer/submissions/${sid}/`, data)
