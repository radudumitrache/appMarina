import api from './axios'

export const getModules          = (params)   => api.get('/modules/', { params })
export const createModule        = (data)     => api.post('/modules/', data)
export const getModule           = (id)       => api.get(`/modules/${id}/`)
export const updateModule        = (id, data) => api.patch(`/modules/${id}/`, data)
export const deleteModule        = (id)       => api.delete(`/modules/${id}/`)
export const completeModule           = (id)       => api.post(`/modules/${id}/complete/`)
export const uncompleteModule         = (id)       => api.delete(`/modules/${id}/complete/`)
export const getAnchorInteractions    = (id)       => api.get(`/modules/${id}/interactions/`)
export const recordAnchorInteraction  = (id, data) => api.post(`/modules/${id}/interactions/`, data)

// Panels
export const getPanels    = (moduleId)                    => api.get(`/modules/${moduleId}/panels/`)
export const createPanel  = (moduleId, data)              => api.post(`/modules/${moduleId}/panels/`, data)
export const updatePanel  = (moduleId, panelId, data)     => api.patch(`/modules/${moduleId}/panels/${panelId}/`, data)
export const deletePanel  = (moduleId, panelId)           => api.delete(`/modules/${moduleId}/panels/${panelId}/`)

// Text Anchors
export const listTextAnchors      = (moduleId, panelId)                    => api.get(`/modules/${moduleId}/panels/${panelId}/text-anchors/`)
export const createTextAnchor     = (moduleId, panelId, data)              => api.post(`/modules/${moduleId}/panels/${panelId}/text-anchors/`, data)
export const updateTextAnchor     = (moduleId, panelId, anchorId, data)    => api.patch(`/modules/${moduleId}/panels/${panelId}/text-anchors/${anchorId}/`, data)
export const deleteTextAnchor     = (moduleId, panelId, anchorId)          => api.delete(`/modules/${moduleId}/panels/${panelId}/text-anchors/${anchorId}/`)

// Navigator Anchors
export const listNavigatorAnchors   = (moduleId, panelId)                  => api.get(`/modules/${moduleId}/panels/${panelId}/navigator-anchors/`)
export const createNavigatorAnchor  = (moduleId, panelId, data)            => api.post(`/modules/${moduleId}/panels/${panelId}/navigator-anchors/`, data)
export const updateNavigatorAnchor  = (moduleId, panelId, anchorId, data)  => api.patch(`/modules/${moduleId}/panels/${panelId}/navigator-anchors/${anchorId}/`, data)
export const deleteNavigatorAnchor  = (moduleId, panelId, anchorId)        => api.delete(`/modules/${moduleId}/panels/${panelId}/navigator-anchors/${anchorId}/`)

// Polygon Anchors
export const listPolygonAnchors     = (moduleId, panelId)                    => api.get(`/modules/${moduleId}/panels/${panelId}/polygon-anchors/`)
export const createPolygonAnchor    = (moduleId, panelId, data)              => api.post(`/modules/${moduleId}/panels/${panelId}/polygon-anchors/`, data)
export const updatePolygonAnchor    = (moduleId, panelId, anchorId, data)    => api.patch(`/modules/${moduleId}/panels/${panelId}/polygon-anchors/${anchorId}/`, data)
export const deletePolygonAnchor    = (moduleId, panelId, anchorId)          => api.delete(`/modules/${moduleId}/panels/${panelId}/polygon-anchors/${anchorId}/`)

// Polygon Anchor Points
export const createPolygonPoint     = (moduleId, panelId, anchorId, data)               => api.post(`/modules/${moduleId}/panels/${panelId}/polygon-anchors/${anchorId}/points/`, data)
export const updatePolygonPoint     = (moduleId, panelId, anchorId, pointId, data)      => api.patch(`/modules/${moduleId}/panels/${panelId}/polygon-anchors/${anchorId}/points/${pointId}/`, data)
export const deletePolygonPoint     = (moduleId, panelId, anchorId, pointId)            => api.delete(`/modules/${moduleId}/panels/${panelId}/polygon-anchors/${anchorId}/points/${pointId}/`)

// Panel Documents (admin upload, all roles read)
export const listPanelDocuments   = (moduleId, panelId)              => api.get(`/modules/${moduleId}/panels/${panelId}/documents/`)
export const createPanelDocument  = (moduleId, panelId, data)        => api.post(`/modules/${moduleId}/panels/${panelId}/documents/`, data)
export const deletePanelDocument  = (moduleId, panelId, docId)       => api.delete(`/modules/${moduleId}/panels/${panelId}/documents/${docId}/`)

// Text Anchor Documents (admin upload, all roles read)
export const listAnchorDocuments  = (moduleId, panelId, anchorId)              => api.get(`/modules/${moduleId}/panels/${panelId}/text-anchors/${anchorId}/documents/`)
export const createAnchorDocument = (moduleId, panelId, anchorId, data)        => api.post(`/modules/${moduleId}/panels/${panelId}/text-anchors/${anchorId}/documents/`, data)
export const deleteAnchorDocument = (moduleId, panelId, anchorId, docId)       => api.delete(`/modules/${moduleId}/panels/${panelId}/text-anchors/${anchorId}/documents/${docId}/`)

// Polygon Anchor Documents (admin upload, all roles read)
export const createPolygonAnchorDocument = (moduleId, panelId, anchorId, data)       => api.post(`/modules/${moduleId}/panels/${panelId}/polygon-anchors/${anchorId}/documents/`, data)
export const deletePolygonAnchorDocument = (moduleId, panelId, anchorId, docId)      => api.delete(`/modules/${moduleId}/panels/${panelId}/polygon-anchors/${anchorId}/documents/${docId}/`)

// Courses
export const getCourses          = ()         => api.get('/courses/')
export const createCourse        = (data)     => api.post('/courses/', data)
export const getCourse           = (id)       => api.get(`/courses/${id}/`)
export const updateCourse        = (id, data) => api.patch(`/courses/${id}/`, data)
export const deleteCourse        = (id)       => api.delete(`/courses/${id}/`)
export const addCourseModule     = (id, data) => api.post(`/courses/${id}/modules/`, data)
export const removeCourseModule  = (id, mid)  => api.delete(`/courses/${id}/modules/${mid}/`)
export const reorderCourseModule = (id, data) => api.post(`/courses/${id}/modules/reorder/`, data)
