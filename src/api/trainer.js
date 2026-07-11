import api from './axios'

export const getTrainerCrewProgress    = (id)        => api.get(`/trainer/crew/${id}/progress/`)
export const getTrainerSubmission       = (sid)       => api.get(`/trainer/submissions/${sid}/`)
export const patchTrainerSubmission     = (sid, data) => api.patch(`/trainer/submissions/${sid}/`, data)
