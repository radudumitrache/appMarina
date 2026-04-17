import api from './axios'

export const getTests         = (params)        => api.get('/tests/', { params })
export const createTest       = (data)          => api.post('/tests/', data)
export const getTest          = (id)            => api.get(`/tests/${id}/`)
export const updateTest       = (id, data)      => api.patch(`/tests/${id}/`, data)
export const deleteTest       = (id)            => api.delete(`/tests/${id}/`)
export const publishTest      = (id)            => api.post(`/tests/${id}/publish/`)

export const getQuestions     = (id)            => api.get(`/tests/${id}/questions/`)
export const addQuestion      = (id, data)      => api.post(`/tests/${id}/questions/`, data)
export const updateQuestion   = (id, qid, data) => api.patch(`/tests/${id}/questions/${qid}/`, data)
export const deleteQuestion   = (id, qid)       => api.delete(`/tests/${id}/questions/${qid}/`)

export const submitTest       = (id, answers)   => api.post(`/tests/${id}/submit/`, { answers })
export const getMySubmission  = (id)            => api.get(`/tests/${id}/submission/`)
export const getAllSubmissions = (id)            => api.get(`/tests/${id}/submissions/`)
export const gradeSubmission  = (id, sid, data) => api.patch(`/tests/${id}/submissions/${sid}/`, data)
