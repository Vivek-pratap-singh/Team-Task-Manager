import api from './axios'

export const taskApi = {
  getAll:       (params) => api.get('/tasks', { params }),
  getById:      (id)     => api.get(`/tasks/${id}`),
  create:       (data)   => api.post('/tasks', data),
  update:       (id, data) => api.put(`/tasks/${id}`, data),
  delete:       (id)     => api.delete(`/tasks/${id}`),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  addComment:   (id, content) => api.post(`/tasks/${id}/comments`, { content }),
}
