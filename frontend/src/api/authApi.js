import axiosInstance from './axiosInstance';

export const authApi = {
  register:               (data)  => axiosInstance.post('/auth/register', data),
  login:                  (data)  => axiosInstance.post('/auth/login', data),
  verifyOtp:              (data)  => axiosInstance.post('/auth/verify-otp', data),
  resendOtp:              (email) => axiosInstance.post('/auth/resend-otp', { email }),
  validateRegisterNumber: (value) => axiosInstance.get('/auth/validate-register-number', { params: { value } }),
  getProfile:             ()      => axiosInstance.get('/auth/me'),
};
