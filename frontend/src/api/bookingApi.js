import axiosInstance from './axiosInstance';

export const bookingApi = {
  // File upload
  uploadDocument: (file, onProgress) => {
    const fd = new FormData();
    fd.append('file', file);
    return axiosInstance.post('/bookings/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    });
  },

  // Availability
  checkAvailability: (resourceId, date) =>
    axiosInstance.get('/bookings/availability', { params: { resourceId, date } }),

  // CRUD
  create:    (data)   => axiosInstance.post('/bookings', data),
  getById:   (id)     => axiosInstance.get(`/bookings/${id}`),
  getMyBookings: (params) => axiosInstance.get('/bookings/my', { params }),
  cancel:    (id, reason) => axiosInstance.patch(`/bookings/${id}/cancel`, { reason }),

  // Document download
  downloadDocument: (bookingId, documentId) =>
    axiosInstance.get(`/bookings/${bookingId}/documents/${documentId}`, { responseType: 'blob' }),

  // Resources for picker (any authenticated user — active resources only)
  getActiveResources: (params) => axiosInstance.get('/resources', {
    params: { size: 100, ...params },
  }),

  // Faculty search for supporting faculty picker
  searchFaculty: (search) => axiosInstance.get('/users/lookup', {
    params: { role: 'FACULTY', search, size: 20 },
  }),

  // Student/general search for coordinator picker
  searchUsers: (search) => axiosInstance.get('/users/lookup', {
    params: { search, size: 20 },
  }),
};
