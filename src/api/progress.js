import api from './axios'

export const getProgress        = ()       => api.get('/progress/')
export const getCourseProgress  = ()       => api.get('/progress/courses/')
export const getActivity        = ()       => api.get('/progress/activity/')
export const getTestResults     = ()       => api.get('/progress/test-results/')
export const getTrainerProgress = (params) => api.get('/trainer/progress/', { params })
export const getAchievements    = ()       => api.get('/achievements/')
export const getCertifications  = ()       => api.get('/certifications/')
