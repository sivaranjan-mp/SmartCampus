import { Box, IconButton, Toolbar, AppBar, Typography } from '@mui/material';
import { MenuRounded } from '@mui/icons-material';
import { useState } from 'react';
import AdminSidebar, { ADMIN_SIDEBAR_WIDTH } from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Chip,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  AccountCircleOutlined,
  KeyboardArrowDownRounded,
  LogoutRounded,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function AdminLayout({ children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out.');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${ADMIN_SIDEBAR_WIDTH}px)` },
          ml: { md: `${ADMIN_SIDEBAR_WIDTH}px` },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top AppBar */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${ADMIN_SIDEBAR_WIDTH}px)` },
            ml: { md: `${ADMIN_SIDEBAR_WIDTH}px` },
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              <MenuRounded />
            </IconButton>

            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: 'text.primary', flex: 1 }}
            >
              {title}
            </Typography>

            {/* User chip */}
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: '5px 12px',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': { backgroundColor: 'background.default' },
              }}
            >
              <Avatar sx={{ width: 28, height: 28, bgcolor: '#D32F2F', fontSize: '0.75rem', fontWeight: 700 }}>
                {user?.fullName?.[0]?.toUpperCase() || 'A'}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>
                {user?.fullName?.split(' ')[0]}
              </Typography>
              <KeyboardArrowDownRounded sx={{ color: 'text.secondary', fontSize: 18 }} />
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1, minWidth: 200, borderRadius: 2,
                  border: '1px solid', borderColor: 'divider',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2">{user?.fullName}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user?.email}</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label="Administrator" size="small" color="error" sx={{ height: 18, fontSize: '0.62rem' }} />
                </Box>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }} sx={{ py: 1.2 }}>
                <ListItemIcon><AccountCircleOutlined fontSize="small" /></ListItemIcon>
                <Typography variant="body2" fontWeight={500}>Profile</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: 'error.main' }}>
                <ListItemIcon><LogoutRounded fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                <Typography variant="body2" fontWeight={500} color="error.main">Logout</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flex: 1, pt: { xs: 8, sm: 9 }, px: { xs: 2, sm: 3, md: 4 }, pb: 4 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
