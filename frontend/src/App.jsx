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
import { Box, Typography, Container, Grid, Card } from '@mui/material';
import { AddRounded, HistoryRounded, GavelRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated
    ? <Navigate to={getDashboardPath(user?.role)} replace />
    : <Navigate to="/login" replace />;
}

function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ pt: { xs: 12, sm: 14 }, pb: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" fontWeight={800} color="primary.main" mb={2}>
            Welcome, {user?.fullName?.split(' ')[0]}
          </Typography>
          <Typography color="text.secondary" variant="h6">
            SmartCampus Resource Booking Portal
          </Typography>
        </Box>
        
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 4, cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(21,101,192,0.12)' }, transition: 'all 0.2s', border: '1px solid', borderColor: 'divider', borderRadius: 3 }} onClick={() => navigate('/bookings/new')}>
              <AddRounded color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" fontWeight={700}>New Booking</Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>Request a new resource or lab</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 4, cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(21,101,192,0.12)' }, transition: 'all 0.2s', border: '1px solid', borderColor: 'divider', borderRadius: 3 }} onClick={() => navigate('/bookings/my')}>
              <HistoryRounded color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" fontWeight={700}>My Bookings</Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>View and manage your requests</Typography>
            </Card>
          </Grid>
          {user?.role === 'HOD' && (
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 4, cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(21,101,192,0.12)' }, transition: 'all 0.2s', border: '1px solid', borderColor: 'divider', borderRadius: 3 }} onClick={() => navigate('/hod/approvals')}>
                <GavelRounded color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" fontWeight={700}>Approvals</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>Review pending requests</Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
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
        <ProtectedRoute allowedRoles={['STUDENT']}><UserDashboard /></ProtectedRoute>
      } />

      {/* Faculty */}
      <Route path="/faculty/dashboard" element={
        <ProtectedRoute allowedRoles={['FACULTY']}><UserDashboard /></ProtectedRoute>
      } />

      {/* HOD */}
      <Route path="/hod/dashboard" element={
        <ProtectedRoute allowedRoles={['HOD']}><UserDashboard /></ProtectedRoute>
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
