import {
  Box, Button, Card, CardContent, CircularProgress, Divider,
  FormControl, Grid, InputLabel, MenuItem, Paper, Select,
  Tab, Tabs, Typography,
} from '@mui/material';
import {
  AdminPanelSettingsOutlined, CheckCircleOutlineRounded,
  GavelRounded, HistoryRounded, PendingActionsRounded, RefreshRounded,
} from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { approvalApi } from '../../api/approvalApi';
import { APPROVAL_STATUS_LABELS } from '../../utils/approvalConstants';
import ApprovalQueueTable from '../../components/approval/ApprovalQueueTable';
import AdminLayout from '../../components/admin/AdminLayout';

function StatCard({ label, value, icon, color, loading }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%',
      transition: 'transform 0.18s', '&:hover': { transform: 'translateY(-2px)' } }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.68rem', display: 'block' }}>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5, lineHeight: 1 }}>
              {loading ? <CircularProgress size={18} /> : (value ?? '—')}
            </Typography>
          </Box>
          <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AdminApprovalPage() {
  const [tab,        setTab]        = useState(0);
  const [items,      setItems]      = useState([]);
  const [histItems,  setHistItems]  = useState([]);
  const [stats,      setStats]      = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [histPages,  setHistPages]  = useState(0);
  const [page,       setPage]       = useState(1);
  const [histPage,   setHistPage]   = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [histLoad,   setHistLoad]   = useState(false);
  const [statsLoad,  setStatsLoad]  = useState(false);
  const [histStatus, setHistStatus] = useState('');

  const loadStats = useCallback(() => {
    setStatsLoad(true);
    approvalApi.getStats()
      .then(({ data }) => { if (data.success) setStats(data.data); })
      .catch(() => {})
      .finally(() => setStatsLoad(false));
  }, []);

  const loadQueue = useCallback(() => {
    setLoading(true);
    approvalApi.getAdminQueue({ page: page - 1, size: 10 })
      .then(({ data }) => {
        if (data.success) {
          setItems(data.data.content);
          setTotalPages(data.data.totalPages);
        }
      })
      .catch(() => toast.error('Failed to load approval queue.'))
      .finally(() => setLoading(false));
  }, [page]);

  const loadHistory = useCallback(() => {
    setHistLoad(true);
    approvalApi.getHistory({ status: histStatus || undefined, page: histPage - 1, size: 10 })
      .then(({ data }) => {
        if (data.success) {
          setHistItems(data.data.content);
          setHistPages(data.data.totalPages);
        }
      })
      .catch(() => {})
      .finally(() => setHistLoad(false));
  }, [histPage, histStatus]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (tab === 0) loadQueue(); }, [tab, loadQueue]);
  useEffect(() => { if (tab === 1) loadHistory(); }, [tab, loadHistory]);

  const handleRefresh = () => { loadQueue(); loadStats(); };

  return (
    <AdminLayout title="Approval Management">

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Pending — Admin"  value={stats?.pendingAdmin}     icon={<PendingActionsRounded />}       color="#1565C0" loading={statsLoad} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Pending — HOD"    value={stats?.pendingHod}       icon={<GavelRounded />}                color="#E65100" loading={statsLoad} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="High Priority"    value={stats?.highPriorityPending} icon={<AdminPanelSettingsOutlined />} color="#C62828" loading={statsLoad} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Total Pending"    value={stats?.totalPending}     icon={<CheckCircleOutlineRounded />}   color="#2E7D32" loading={statsLoad} />
        </Grid>
      </Grid>

      {/* Approval rules banner */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'primary.light', bgcolor: '#EFF4FF', borderRadius: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
          Approval Routing Rules
        </Typography>
        <Grid container spacing={2}>
          {[
            { rule: 'Department Resources', authority: 'HOD Approval', color: '#E65100', note: 'Department-owned resources → HOD of that department' },
            { rule: 'Common Resources',     authority: 'Admin Approval', color: '#1565C0', note: 'Campus-wide shared resources → Administrator' },
            { rule: 'Auto-Approved',        authority: 'No Review',      color: '#2E7D32', note: 'Resources with AUTO authority → instantly confirmed' },
            { rule: 'Priority Override',    authority: 'Faculty > Student', color: '#880E4F', note: 'HIGH priority shown first; pre-emption notices sent' },
          ].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.rule}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: item.color }}>
                  {item.rule}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                  {item.note}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', flex: 1 }}>
          <Tab
            label={`Pending Common Resources${stats?.pendingAdmin > 0 ? ` (${stats.pendingAdmin})` : ''}`}
            icon={<PendingActionsRounded sx={{ fontSize: 18 }} />} iconPosition="start"
            sx={{ fontWeight: 600, minHeight: 44 }}
          />
          <Tab
            label="Decision History"
            icon={<HistoryRounded sx={{ fontSize: 18 }} />} iconPosition="start"
            sx={{ fontWeight: 600, minHeight: 44 }}
          />
        </Tabs>
        <Button variant="outlined" startIcon={<RefreshRounded />} size="small"
          onClick={handleRefresh} sx={{ ml: 2, flexShrink: 0 }}>
          Refresh
        </Button>
      </Box>

      {/* Pending queue */}
      {tab === 0 && (
        <ApprovalQueueTable
          items={items} loading={loading}
          totalPages={totalPages} page={page}
          onPageChange={setPage} onRefresh={handleRefresh}
        />
      )}

      {/* History */}
      {tab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', flexShrink: 0 }}>
              Filter:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Outcome</InputLabel>
              <Select value={histStatus} label="Outcome"
                onChange={(e) => { setHistStatus(e.target.value); setHistPage(1); }}>
                <MenuItem value="">All Outcomes</MenuItem>
                {Object.entries(APPROVAL_STATUS_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <ApprovalQueueTable
            items={histItems} loading={histLoad}
            totalPages={histPages} page={histPage}
            onPageChange={setHistPage} onRefresh={loadHistory}
            showHistoryMode
          />
        </Box>
      )}
    </AdminLayout>
  );
}
