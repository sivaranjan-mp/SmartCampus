import axiosInstance from './axiosInstance';

export const approvalApi = {
  getStats:       (params)        => axiosInstance.get('/approvals/stats', { params }),
  getHodQueue:    (params)        => axiosInstance.get('/approvals/hod/queue', { params }),
  getAdminQueue:  (params)        => axiosInstance.get('/approvals/admin/queue', { params }),
  validate:       (bookingId)     => axiosInstance.get(`/approvals/validate/${bookingId}`),
  decide:         (approvalId, data) => axiosInstance.post(`/approvals/${approvalId}/decision`, data),
  getHistory:     (params)        => axiosInstance.get('/approvals/history', { params }),
};
