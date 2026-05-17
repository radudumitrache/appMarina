import api from './axios'

export const getMediaFiles   = (params)    => api.get('/media/files/', { params })
export const getUploadUrl    = (data)      => api.post('/media/upload-url/', data)
export const confirmUpload   = (data)      => api.post('/media/confirm/', data)
export const renameMediaFile = (id, name)  => api.patch(`/media/files/${id}/`, { name })
export const patchMediaFile  = (id, data)  => api.patch(`/media/files/${id}/`, data)
export const deleteMediaFile = (id)        => api.delete(`/media/files/${id}/`)

export const uploadToGCS = (signedUrl, file) =>
  fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
