import api from './axios'

export const getProgress        = ()       => api.get('/progress/')
export const getActivity        = ()       => api.get('/progress/activity/')
export const getTestResults     = ()       => api.get('/progress/test-results/')
export const getTeacherProgress = (params) => api.get('/teacher/progress/', { params })
export const getAchievements    = ()       => api.get('/achievements/')
export const getCertifications  = ()       => api.get('/certifications/')
