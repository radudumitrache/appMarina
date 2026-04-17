import api from './axios'

export const getTickets   = (params) => api.get('/support/tickets/', { params })
export const createTicket = (data)   => api.post('/support/tickets/', data)
export const getTicket    = (id)     => api.get(`/support/tickets/${id}/`)
export const updateTicket = (id, d)  => api.patch(`/support/tickets/${id}/`, d)
