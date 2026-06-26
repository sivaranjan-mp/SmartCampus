import axiosInstance from './axiosInstance';

export const adminApi = {
  // Dashboard
  getDashboardStats: () => axiosInstance.get('/admin/dashboard/stats'),

  // Users
  getAllUsers: (params) => axiosInstance.get('/admin/users', { params }),
  getUserById: (id) => axiosInstance.get(`/admin/users/${id}`),
  createManagedUser: (data) => axiosInstance.post('/admin/users', data),
  updateUserStatus: (id, data) => axiosInstance.patch(`/admin/users/${id}/status`, data),
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),

  // Departments
  getAllDepartments: (params) => axiosInstance.get('/admin/departments', { params }),
  getActiveDepartments: () => axiosInstance.get('/admin/departments/active'),
  getDepartmentById: (id) => axiosInstance.get(`/admin/departments/${id}`),
  createDepartment: (data) => axiosInstance.post('/admin/departments', data),
  updateDepartment: (id, data) => axiosInstance.put(`/admin/departments/${id}`, data),
  toggleDepartmentStatus: (id) => axiosInstance.patch(`/admin/departments/${id}/toggle-status`),

  // Resources
  getAllResources: (params) => axiosInstance.get('/admin/resources', { params }),
  getResourceById: (id) => axiosInstance.get(`/admin/resources/${id}`),
  createResource: (data) => axiosInstance.post('/admin/resources', data),
  updateResource: (id, data) => axiosInstance.put(`/admin/resources/${id}`, data),
  toggleMaintenance: (id) => axiosInstance.patch(`/admin/resources/${id}/toggle-maintenance`),
  toggleResourceStatus: (id) => axiosInstance.patch(`/admin/resources/${id}/toggle-active`),
  deleteResource: (id) => axiosInstance.delete(`/admin/resources/${id}`),
};
