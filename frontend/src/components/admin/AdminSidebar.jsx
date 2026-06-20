import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ApartmentOutlined,
  DashboardOutlined,
  GroupOutlined,
  MeetingRoomOutlined,
  SchoolRounded,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

export const ADMIN_SIDEBAR_WIDTH = 240;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardOutlined />, path: '/admin/dashboard' },
  { label: 'Users', icon: <GroupOutlined />, path: '/admin/users' },
  { label: 'Departments', icon: <ApartmentOutlined />, path: '/admin/departments' },
  { label: 'Resources', icon: <MeetingRoomOutlined />, path: '/admin/resources' },
];

function SidebarContent() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            background: 'linear-gradient(135deg, #1565C0, #0D47A1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <SchoolRounded sx={{ color: 'white', fontSize: 18 }} />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.1 }}>
            SmartCampus
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem' }}>
            Admin Panel
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      <List sx={{ px: 1.5, pt: 1.5, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Tooltip key={item.path} title="" placement="right">
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1,
                  backgroundColor: active ? 'primary.main' : 'transparent',
                  color: active ? 'white' : 'text.secondary',
                  '&:hover': {
                    backgroundColor: active ? 'primary.dark' : 'action.hover',
                  },
                  transition: 'all 0.15s',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: active ? 'white' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 700 : 500 }}
                />
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: '#F0F4FF',
            border: '1px solid',
            borderColor: 'primary.light',
          }}
        >
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, display: 'block' }}>
            Administrator
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
            Full system access
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function AdminSidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: ADMIN_SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: '4px 0 24px rgba(21,101,192,0.1)',
          },
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Permanent desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: ADMIN_SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </>
  );
}
