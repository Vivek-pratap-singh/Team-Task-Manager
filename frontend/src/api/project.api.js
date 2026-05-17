import api from './axios'

export const projectApi = {
  getAll:       (params) => api.get('/projects', { params }),
  getById:      (id)     => api.get(`/projects/${id}`),
  create:       (data)   => api.post('/projects', data),
  update:       (id, data) => api.put(`/projects/${id}`, data),
  delete:       (id)     => api.delete(`/projects/${id}`),
  addMember:    (id, userId) => api.post(`/projects/${id}/members`, { userId }),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
  getAllUsers:  ()        => api.get('/projects/users'),
}
