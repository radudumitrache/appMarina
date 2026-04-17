import api from './axios'

export const getLessons          = (params)   => api.get('/lessons/', { params })
export const createLesson        = (data)     => api.post('/lessons/', data)
export const getLesson           = (id)       => api.get(`/lessons/${id}/`)
export const updateLesson        = (id, data) => api.patch(`/lessons/${id}/`, data)
export const deleteLesson        = (id)       => api.delete(`/lessons/${id}/`)
export const completeLesson      = (id)       => api.post(`/lessons/${id}/complete/`)
export const uncompleteLesson    = (id)       => api.delete(`/lessons/${id}/complete/`)

// Panels
export const getPanels    = (lessonId)                    => api.get(`/lessons/${lessonId}/panels/`)
export const createPanel  = (lessonId, data)              => api.post(`/lessons/${lessonId}/panels/`, data)
export const updatePanel  = (lessonId, panelId, data)     => api.patch(`/lessons/${lessonId}/panels/${panelId}/`, data)
export const deletePanel  = (lessonId, panelId)           => api.delete(`/lessons/${lessonId}/panels/${panelId}/`)

// Text Anchors
export const listTextAnchors      = (lessonId, panelId)                    => api.get(`/lessons/${lessonId}/panels/${panelId}/text-anchors/`)
export const createTextAnchor     = (lessonId, panelId, data)              => api.post(`/lessons/${lessonId}/panels/${panelId}/text-anchors/`, data)
export const updateTextAnchor     = (lessonId, panelId, anchorId, data)    => api.patch(`/lessons/${lessonId}/panels/${panelId}/text-anchors/${anchorId}/`, data)
export const deleteTextAnchor     = (lessonId, panelId, anchorId)          => api.delete(`/lessons/${lessonId}/panels/${panelId}/text-anchors/${anchorId}/`)

// Navigator Anchors
export const listNavigatorAnchors   = (lessonId, panelId)                  => api.get(`/lessons/${lessonId}/panels/${panelId}/navigator-anchors/`)
export const createNavigatorAnchor  = (lessonId, panelId, data)            => api.post(`/lessons/${lessonId}/panels/${panelId}/navigator-anchors/`, data)
export const updateNavigatorAnchor  = (lessonId, panelId, anchorId, data)  => api.patch(`/lessons/${lessonId}/panels/${panelId}/navigator-anchors/${anchorId}/`, data)
export const deleteNavigatorAnchor  = (lessonId, panelId, anchorId)        => api.delete(`/lessons/${lessonId}/panels/${panelId}/navigator-anchors/${anchorId}/`)

// Polygon Anchors
export const listPolygonAnchors     = (lessonId, panelId)                    => api.get(`/lessons/${lessonId}/panels/${panelId}/polygon-anchors/`)
export const createPolygonAnchor    = (lessonId, panelId, data)              => api.post(`/lessons/${lessonId}/panels/${panelId}/polygon-anchors/`, data)
export const updatePolygonAnchor    = (lessonId, panelId, anchorId, data)    => api.patch(`/lessons/${lessonId}/panels/${panelId}/polygon-anchors/${anchorId}/`, data)
export const deletePolygonAnchor    = (lessonId, panelId, anchorId)          => api.delete(`/lessons/${lessonId}/panels/${panelId}/polygon-anchors/${anchorId}/`)

// Polygon Anchor Points
export const createPolygonPoint     = (lessonId, panelId, anchorId, data)               => api.post(`/lessons/${lessonId}/panels/${panelId}/polygon-anchors/${anchorId}/points/`, data)
export const updatePolygonPoint     = (lessonId, panelId, anchorId, pointId, data)      => api.patch(`/lessons/${lessonId}/panels/${panelId}/polygon-anchors/${anchorId}/points/${pointId}/`, data)
export const deletePolygonPoint     = (lessonId, panelId, anchorId, pointId)            => api.delete(`/lessons/${lessonId}/panels/${panelId}/polygon-anchors/${anchorId}/points/${pointId}/`)

// Courses
export const getCourses          = ()         => api.get('/courses/')
export const createCourse        = (data)     => api.post('/courses/', data)
export const getCourse           = (id)       => api.get(`/courses/${id}/`)
export const updateCourse        = (id, data) => api.patch(`/courses/${id}/`, data)
export const deleteCourse        = (id)       => api.delete(`/courses/${id}/`)
export const addCourseLesson     = (id, data) => api.post(`/courses/${id}/lessons/`, data)
export const removeCourseLesson  = (id, lid)  => api.delete(`/courses/${id}/lessons/${lid}/`)
export const reorderCourseLesson = (id, data) => api.post(`/courses/${id}/lessons/reorder/`, data)
