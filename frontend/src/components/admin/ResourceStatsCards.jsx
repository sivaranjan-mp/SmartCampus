import { Box, Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material';
import {
  BuildOutlined,
  CheckCircleOutlined,
  MeetingRoomOutlined,
  GroupsOutlined,
  ApartmentOutlined,
  CategoryOutlined,
} from '@mui/icons-material';

const CARD_DEFS = [
  { key: 'totalResources',     label: 'Total Resources',    icon: <MeetingRoomOutlined />, color: '#1565C0' },
  { key: 'activeResources',    label: 'Active',             icon: <CheckCircleOutlined />, color: '#2E7D32' },
  { key: 'underMaintenance',   label: 'Under Maintenance',  icon: <BuildOutlined />,       color: '#C62828' },
  { key: 'commonResources',    label: 'Common Resources',   icon: <GroupsOutlined />,      color: '#0097A7' },
  { key: 'departmentResources',label: 'Dept. Resources',    icon: <ApartmentOutlined />,   color: '#6A1B9A' },
];

export default function ResourceStatsCards({ stats, loading }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {CARD_DEFS.map(({ key, label, icon, color }) => (
        <Grid item xs={6} sm={4} md key={key}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid', borderColor: 'divider', height: '100%',
              transition: 'transform 0.18s, box-shadow 0.18s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 24px rgba(21,101,192,0.11)' },
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.68rem', display: 'block' }}
                  >
                    {label}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5, lineHeight: 1 }}>
                    {loading ? <CircularProgress size={18} /> : (stats?.[key] ?? '—')}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 40, height: 40, borderRadius: 2.5, flexShrink: 0,
                    backgroundColor: `${color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: color,
                  }}
                >
                  {icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
