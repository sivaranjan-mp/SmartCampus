import {
  Alert, Box, Button, CircularProgress, Divider,
  IconButton, InputAdornment, Paper, TextField, Typography,
} from '@mui/material';
import { EmailOutlined, LockOutlined, SchoolRounded, Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../layouts/AuthLayout';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/roleUtils';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveSession } = useAuth();

  const [form, setForm]               = useState({ email: '', password: '' });
  const [showPassword, setShowPw]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const from = location.state?.from?.pathname;

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) { setError('Please fill in all fields.'); return; }

    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.login(form);
      if (data.success) {
        saveSession(data.data);
        toast.success(`Welcome back, ${data.data.fullName.split(' ')[0]}!`);
        navigate(from || getDashboardPath(data.data.role), { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Paper
        elevation={0}
        sx={{
          width: '100%', maxWidth: 440,
          p: { xs: 3, sm: 4 },
          border: '1px solid', borderColor: 'divider',
          boxShadow: '0 8px 40px rgba(21,101,192,0.10)',
        }}
      >
        {/* Mobile logo */}
        <Box sx={{ display: { md: 'none' }, mb: 3, textAlign: 'center' }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg,#1565C0,#0D47A1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
            <SchoolRounded sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>SmartCampus</Typography>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          Sign in
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Enter your credentials to access your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth label="Email Address" name="email" type="email"
            value={form.email} onChange={handleChange}
            autoComplete="email" autoFocus sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth label="Password" name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password} onChange={handleChange}
            autoComplete="current-password" sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPw((p) => !p)} edge="end" size="small">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mb: 2 }}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
          </Button>
        </Box>

        <Divider sx={{ my: 2.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', px: 1 }}>
            New to SmartCampus?
          </Typography>
        </Divider>

        <Button component={Link} to="/register" variant="outlined" fullWidth size="large">
          Create an Account
        </Button>

        <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            By signing in you agree to the SmartCampus{' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}>
              Terms of Use
            </Box>
          </Typography>
        </Box>
      </Paper>
    </AuthLayout>
  );
}
