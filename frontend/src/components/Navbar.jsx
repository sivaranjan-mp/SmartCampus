import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Container,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccountCircleOutlined,
  KeyboardArrowDownRounded,
  LogoutRounded,
  SchoolRounded,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_COLORS, ROLE_LABELS } from '../utils/roleUtils';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const avatarColors = {
    STUDENT: '#1565C0',
    FACULTY: '#0097A7',
    HOD: '#F57C00',
    ADMIN: '#D32F2F',
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              textDecoration: 'none',
            }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #1565C0, #0D47A1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SchoolRounded sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: 'primary.main',
                  lineHeight: 1.1,
                  fontSize: '1rem',
                }}
              >
                SmartCampus
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', lineHeight: 1, fontSize: '0.65rem' }}
              >
                Resource Portal
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* User Menu */}
          <Tooltip title="Account options">
            <Box
              onClick={handleOpenMenu}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': { backgroundColor: 'background.default' },
                transition: 'all 0.2s',
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: avatarColors[user?.role] || '#1565C0',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                {getInitials(user?.fullName)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                  {user?.fullName?.split(' ')[0] || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                  {ROLE_LABELS[user?.role] || user?.role}
                </Typography>
              </Box>
              <KeyboardArrowDownRounded sx={{ color: 'text.secondary', fontSize: 18 }} />
            </Box>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 220,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 8px 32px rgba(21, 101, 192, 0.12)',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user?.email}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={ROLE_LABELS[user?.role] || user?.role}
                  size="small"
                  color={ROLE_COLORS[user?.role] || 'default'}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              </Box>
            </Box>

            <Divider />

            <MenuItem
              onClick={() => {
                handleCloseMenu();
                navigate('/profile');
              }}
              sx={{ py: 1.2 }}
            >
              <ListItemIcon>
                <AccountCircleOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <Typography variant="body2" fontWeight={500}>My Profile</Typography>
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: 'error.main' }}>
              <ListItemIcon>
                <LogoutRounded fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <Typography variant="body2" fontWeight={500} color="error.main">Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
