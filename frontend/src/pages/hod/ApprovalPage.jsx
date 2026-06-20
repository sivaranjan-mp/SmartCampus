import {
  Box, Button, Card, CardContent, CircularProgress, Divider,
  FormControl, Grid, InputLabel, MenuItem, Paper, Select,
  Tab, Tabs, Typography,
} from '@mui/material';
import {
  CheckCircleOutlineRounded, GavelRounded, HistoryRounded,
  PendingActionsRounded, RefreshRounded, SchoolRounded,
} from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { approvalApi } from '../../api/approvalApi';
import { APPROVAL_STATUS_COLORS, APPROVAL_STATUS_LABELS } from '../../utils/approvalConstants';
import ApprovalQueueTable from '../../components/approval/ApprovalQueueTable';
import Navbar from '../../components/Navbar';

// ─── Stat card ─────────────────────────────────────────────────────────────────
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

export default function HodApprovalPage() {
  const { user } = useAuth();

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
    approvalApi.getHodQueue({ page: page - 1, size: 10 })
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      {/* Page header */}
      <Box sx={{ pt: { xs: 9, sm: 10 }, px: { xs: 2, sm: 3, md: 4 }, pb: 0, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GavelRounded sx={{ color: '#E65100', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Approval Queue
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user?.departmentName || 'Department'} — HOD Review
              </Typography>
            </Box>
          </Box>
          <Button variant="outlined" startIcon={<RefreshRounded />} size="small" onClick={handleRefresh}>
            Refresh
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <StatCard label="Pending Review"  value={stats?.pendingHod}      icon={<PendingActionsRounded />}    color="#E65100" loading={statsLoad} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="High Priority"   value={stats?.highPriorityPending} icon={<GavelRounded />}         color="#C62828" loading={statsLoad} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Total Pending"   value={stats?.totalPending}    icon={<SchoolRounded />}            color="#1565C0" loading={statsLoad} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Approved Today"  value={stats?.approvedToday}   icon={<CheckCircleOutlineRounded />} color="#2E7D32" loading={statsLoad} />
          </Grid>
        </Grid>

        {/* Approval authority note */}
        <Paper elevation={0} sx={{ p: 2, mb: 2.5, border: '1px solid', borderColor: 'warning.light', bgcolor: '#FFF8E1', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <GavelRounded sx={{ color: '#E65100', fontSize: 18, flexShrink: 0, mt: 0.1 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#E65100' }}>
                HOD Approval Scope
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                You are reviewing bookings for <strong>department-owned resources</strong> in{' '}
                <strong>{user?.departmentName}</strong>. Faculty bookings carry HIGH priority and
                appear at the top of the queue. Run the validation report before deciding.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 2.5 }}>
          <Tab label={`Pending${stats?.pendingHod > 0 ? ` (${stats.pendingHod})` : ''}`}
            icon={<PendingActionsRounded sx={{ fontSize: 18 }} />} iconPosition="start" sx={{ fontWeight: 600, minHeight: 44 }} />
          <Tab label="Review History" icon={<HistoryRounded sx={{ fontSize: 18 }} />}
            iconPosition="start" sx={{ fontWeight: 600, minHeight: 44 }} />
        </Tabs>

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
                Filter by outcome:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Status</InputLabel>
                <Select value={histStatus} label="Status"
                  onChange={(e) => { setHistStatus(e.target.value); setHistPage(1); }}>
                  <MenuItem value="">All</MenuItem>
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

        <Box sx={{ pb: 4 }} />
      </Box>
    </Box>
  );
}
