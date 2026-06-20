import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import {
  ApartmentOutlined,
  GroupOutlined,
  MeetingRoomOutlined,
  BuildOutlined,
  PersonOutlined,
  SchoolOutlined,
  SupervisorAccountOutlined,
  AdminPanelSettingsOutlined,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import toast from 'react-hot-toast';

function StatCard({ label, value, icon, color, sub }) {
  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 28px rgba(21,101,192,0.12)' },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5, lineHeight: 1 }}>
              {value ?? <CircularProgress size={20} />}
            </Typography>
            {sub && (
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                {sub}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              backgroundColor: `${color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboardStats()
      .then(({ data }) => { if (data.success) setStats(data.data); })
      .catch(() => toast.error('Failed to load dashboard stats.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {/* Welcome Banner */}
      <Box
        sx={{
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1565C0 0%, #003C8F 100%)',
          p: { xs: 3, sm: 4 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'relative' }}>
          <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 2 }}>
            Admin Panel
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mt: 0.5 }}>
            System Overview
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            SmartCampus — Centralized Resource & Lab Booking Portal
          </Typography>
        </Box>
      </Box>

      {/* Users Section */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
        Users
      </Typography>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Students" value={stats?.totalStudents} icon={<SchoolOutlined />} color="#1565C0" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Faculty" value={stats?.totalFaculty} icon={<PersonOutlined />} color="#0097A7" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="HODs" value={stats?.totalHods} icon={<SupervisorAccountOutlined />} color="#F57C00" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Admins" value={stats?.totalAdmins} icon={<AdminPanelSettingsOutlined />} color="#D32F2F" />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Departments & Resources */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
        Infrastructure
      </Typography>
      <Grid container spacing={2.5}>
        <Grid item xs={6} sm={4}>
          <StatCard
            label="Departments"
            value={stats?.totalDepartments}
            icon={<ApartmentOutlined />}
            color="#5E35B1"
            sub={`${stats?.activeDepartments ?? '—'} active`}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <StatCard
            label="Resources"
            value={stats?.totalResources}
            icon={<MeetingRoomOutlined />}
            color="#1565C0"
            sub={`${stats?.activeResources ?? '—'} active`}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <StatCard
            label="Under Maintenance"
            value={stats?.resourcesUnderMaintenance}
            icon={<BuildOutlined />}
            color="#E53935"
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <StatCard
            label="Common Resources"
            value={stats?.commonResources}
            icon={<GroupOutlined />}
            color="#388E3C"
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <StatCard
            label="Dept. Resources"
            value={stats?.departmentResources}
            icon={<ApartmentOutlined />}
            color="#0097A7"
          />
        </Grid>
      </Grid>
    </AdminLayout>
  );
}
