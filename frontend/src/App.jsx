import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth
import LoginPage           from './pages/auth/LoginPage';
import RegisterPage        from './pages/auth/RegisterPage';
import OtpVerificationPage from './pages/auth/OtpVerificationPage';

// Admin
import AdminDashboardPage       from './pages/admin/AdminDashboardPage';
import UserManagementPage       from './pages/admin/UserManagementPage';
import DepartmentManagementPage from './pages/admin/DepartmentManagementPage';
import ResourceManagementPage   from './pages/admin/ResourceManagementPage';
import AdminApprovalPage        from './pages/admin/AdminApprovalPage';

// HOD
import HodApprovalPage from './pages/hod/ApprovalPage';

// Bookings
import BookingFormPage from './pages/booking/BookingFormPage';
import MyBookingsPage  from './pages/booking/MyBookingsPage';

import { getDashboardPath } from './utils/roleUtils';
import { Box, Typography, Button } from '@mui/material';

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated
    ? <Navigate to={getDashboardPath(user?.role)} replace />
    : <Navigate to="/login" replace />;
}

function PlaceholderDashboard() {
  const { user, logout } = useAuth();
  return (
    <Box sx={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F0F4FF' }}>
      <Box sx={{ textAlign:'center' }}>
        <Typography variant="h4" fontWeight={800} color="primary.main" mb={1}>
          Welcome, {user?.fullName?.split(' ')[0]}
        </Typography>
        <Typography color="text.secondary" mb={4}>
          {user?.role} Dashboard — coming in the next module
        </Typography>
        <Button variant="outlined" color="primary" onClick={logout}>
          Logout
        </Button>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/"            element={<RootRedirect />} />

      {/* Public */}
      <Route path="/login"       element={<LoginPage />} />
      <Route path="/register"    element={<RegisterPage />} />
      <Route path="/verify-otp"  element={<OtpVerificationPage />} />

      {/* Student */}
      <Route path="/student/dashboard" element={
        <ProtectedRoute allowedRoles={['STUDENT']}><PlaceholderDashboard /></ProtectedRoute>
      } />

      {/* Faculty */}
      <Route path="/faculty/dashboard" element={
        <ProtectedRoute allowedRoles={['FACULTY']}><PlaceholderDashboard /></ProtectedRoute>
      } />

      {/* HOD */}
      <Route path="/hod/dashboard" element={
        <ProtectedRoute allowedRoles={['HOD']}><PlaceholderDashboard /></ProtectedRoute>
      } />
      <Route path="/hod/approvals" element={
        <ProtectedRoute allowedRoles={['HOD']}><HodApprovalPage /></ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><UserManagementPage /></ProtectedRoute>
      } />
      <Route path="/admin/departments" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><DepartmentManagementPage /></ProtectedRoute>
      } />
      <Route path="/admin/resources" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><ResourceManagementPage /></ProtectedRoute>
      } />
      <Route path="/admin/approvals" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminApprovalPage /></ProtectedRoute>
      } />

      {/* Bookings — all authenticated roles */}
      <Route path="/bookings/new" element={
        <ProtectedRoute allowedRoles={['STUDENT','FACULTY','HOD','ADMIN']}>
          <BookingFormPage />
        </ProtectedRoute>
      } />
      <Route path="/bookings/my" element={
        <ProtectedRoute allowedRoles={['STUDENT','FACULTY','HOD','ADMIN']}>
          <MyBookingsPage />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
