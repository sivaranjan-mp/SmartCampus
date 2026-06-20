import axiosInstance from './axiosInstance';

export const resourceApi = {
  /* Stats */
  getStats: () =>
    axiosInstance.get('/admin/resources/stats'),

  /* Search / list */
  search: (params) =>
    axiosInstance.get('/admin/resources', { params }),

  /* Single resource */
  getById: (id) =>
    axiosInstance.get(`/admin/resources/${id}`),

  /* Create */
  create: (data) =>
    axiosInstance.post('/admin/resources', data),

  /* Update */
  update: (id, data) =>
    axiosInstance.put(`/admin/resources/${id}`, data),

  /* Delete */
  delete: (id) =>
    axiosInstance.delete(`/admin/resources/${id}`),

  /* Toggles */
  toggleActive:      (id) => axiosInstance.patch(`/admin/resources/${id}/toggle-active`),
  toggleMaintenance: (id) => axiosInstance.patch(`/admin/resources/${id}/toggle-maintenance`),
};
