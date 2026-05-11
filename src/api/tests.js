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

// Panels
export const getTestPanels   = (tid)            => api.get(`/tests/${tid}/panels/`)
export const createTestPanel = (tid, data)      => api.post(`/tests/${tid}/panels/`, data)
export const updateTestPanel = (tid, pid, data) => api.patch(`/tests/${tid}/panels/${pid}/`, data)
export const deleteTestPanel = (tid, pid)       => api.delete(`/tests/${tid}/panels/${pid}/`)

// Exercises (inside exercise panels)
export const createExercise = (tid, pid, data)      => api.post(`/tests/${tid}/panels/${pid}/exercises/`, data)
export const updateExercise = (tid, pid, eid, data) => api.patch(`/tests/${tid}/panels/${pid}/exercises/${eid}/`, data)
export const deleteExercise = (tid, pid, eid)       => api.delete(`/tests/${tid}/panels/${pid}/exercises/${eid}/`)

// MCQ exercise options
export const createExerciseOption = (tid, pid, eid, data)      => api.post(`/tests/${tid}/panels/${pid}/exercises/${eid}/options/`, data)
export const updateExerciseOption = (tid, pid, eid, oid, data) => api.patch(`/tests/${tid}/panels/${pid}/exercises/${eid}/options/${oid}/`, data)
export const deleteExerciseOption = (tid, pid, eid, oid)       => api.delete(`/tests/${tid}/panels/${pid}/exercises/${eid}/options/${oid}/`)

// Arrange items
export const createArrangeItem = (tid, pid, eid, data)       => api.post(`/tests/${tid}/panels/${pid}/exercises/${eid}/items/`, data)
export const updateArrangeItem = (tid, pid, eid, iid, data)  => api.patch(`/tests/${tid}/panels/${pid}/exercises/${eid}/items/${iid}/`, data)
export const deleteArrangeItem = (tid, pid, eid, iid)        => api.delete(`/tests/${tid}/panels/${pid}/exercises/${eid}/items/${iid}/`)

// VR anchors — MCQ
export const createMCQAnchor = (tid, pid, data)      => api.post(`/tests/${tid}/panels/${pid}/vr/mcq-anchors/`, data)
export const updateMCQAnchor = (tid, pid, aid, data) => api.patch(`/tests/${tid}/panels/${pid}/vr/mcq-anchors/${aid}/`, data)
export const deleteMCQAnchor = (tid, pid, aid)       => api.delete(`/tests/${tid}/panels/${pid}/vr/mcq-anchors/${aid}/`)

export const createMCQAnchorOption = (tid, pid, aid, data)      => api.post(`/tests/${tid}/panels/${pid}/vr/mcq-anchors/${aid}/options/`, data)
export const updateMCQAnchorOption = (tid, pid, aid, oid, data) => api.patch(`/tests/${tid}/panels/${pid}/vr/mcq-anchors/${aid}/options/${oid}/`, data)
export const deleteMCQAnchorOption = (tid, pid, aid, oid)       => api.delete(`/tests/${tid}/panels/${pid}/vr/mcq-anchors/${aid}/options/${oid}/`)

// VR anchors — Word Completion
export const createWordCompletionAnchor = (tid, pid, data)      => api.post(`/tests/${tid}/panels/${pid}/vr/word-completion-anchors/`, data)
export const updateWordCompletionAnchor = (tid, pid, aid, data) => api.patch(`/tests/${tid}/panels/${pid}/vr/word-completion-anchors/${aid}/`, data)
export const deleteWordCompletionAnchor = (tid, pid, aid)       => api.delete(`/tests/${tid}/panels/${pid}/vr/word-completion-anchors/${aid}/`)

// VR anchors — Localization
export const createLocalizationAnchor = (tid, pid, data)      => api.post(`/tests/${tid}/panels/${pid}/vr/localization-anchors/`, data)
export const updateLocalizationAnchor = (tid, pid, aid, data) => api.patch(`/tests/${tid}/panels/${pid}/vr/localization-anchors/${aid}/`, data)
export const deleteLocalizationAnchor = (tid, pid, aid)       => api.delete(`/tests/${tid}/panels/${pid}/vr/localization-anchors/${aid}/`)

export const createLocalizationPoint = (tid, pid, aid, data)       => api.post(`/tests/${tid}/panels/${pid}/vr/localization-anchors/${aid}/points/`, data)
export const updateLocalizationPoint = (tid, pid, aid, ptid, data) => api.patch(`/tests/${tid}/panels/${pid}/vr/localization-anchors/${aid}/points/${ptid}/`, data)
export const deleteLocalizationPoint = (tid, pid, aid, ptid)       => api.delete(`/tests/${tid}/panels/${pid}/vr/localization-anchors/${aid}/points/${ptid}/`)

// Submissions
export const submitTest       = (id, answers)   => api.post(`/tests/${id}/submit/`, { answers })
export const getMySubmission  = (id)            => api.get(`/tests/${id}/submission/`)
export const getAllSubmissions = (id)            => api.get(`/tests/${id}/submissions/`)
export const gradeSubmission  = (id, sid, data) => api.patch(`/tests/${id}/submissions/${sid}/`, data)
