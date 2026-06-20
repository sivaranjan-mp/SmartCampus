import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Pagination,
  Paper, Select, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, Tooltip, Typography,
} from '@mui/material';
import {
  AddRounded, BuildOutlined, DeleteOutlineRounded, EditOutlined,
  FilterListRounded, PowerSettingsNewRounded, RefreshRounded,
} from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import ResourceFormDialog from '../../components/admin/ResourceFormDialog';
import ResourceStatsCards from '../../components/admin/ResourceStatsCards';
import { resourceApi } from '../../api/resourceApi';
import { adminApi } from '../../api/adminApi';
import {
  APPROVAL_COLORS, APPROVAL_LABELS, CATEGORY_COLORS, CATEGORY_LABELS,
  RESOURCE_CATEGORIES, SCOPE_COLORS, SCOPE_LABELS,
} from '../../utils/resourceConstants';
import useDebounce from '../../hooks/useDebounce';

function StatusChip({ isActive, isUnderMaintenance }) {
  if (isUnderMaintenance) return <Chip label="Maintenance" size="small" color="error"   sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }} />;
  if (isActive)           return <Chip label="Active"      size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }} />;
  return                         <Chip label="Inactive"    size="small" color="default" variant="outlined" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }} />;
}

function CategoryChip({ category }) {
  const c = CATEGORY_COLORS[category] || CATEGORY_COLORS.OTHER;
  return <Chip label={CATEGORY_LABELS[category] || category} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: c.bg, color: c.text, border: 'none' }} />;
}

function ApprovalChip({ authority }) {
  const c = APPROVAL_COLORS[authority] || {};
  return <Chip label={APPROVAL_LABELS[authority] || authority} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: c.bg, color: c.text, border: 'none' }} />;
}

function ScopeBadge({ scope }) {
  const c = SCOPE_COLORS[scope] || {};
  return <Typography variant="caption" sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: c.bg, color: c.text, fontWeight: 700, fontSize: '0.68rem', whiteSpace: 'nowrap' }}>{SCOPE_LABELS[scope] || scope}</Typography>;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function ResourceManagementPage() {
  const [resources,    setResources]    = useState([]);
  const [stats,        setStats]        = useState(null);
  const [departments,  setDepartments]  = useState([]);
  const [totalPages,   setTotalPages]   = useState(0);
  const [totalItems,   setTotalItems]   = useState(0);
  const [loading,      setLoading]      = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchInput,  setSearchInput]  = useState('');
  const [filters, setFilters] = useState({ category: '', scope: '', approvalAuthority: '', departmentId: '', isActive: '' });
  const [page,    setPage]    = useState(1);
  const [size,    setSize]    = useState(10);
  const [sortBy,  setSortBy]  = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [showFilters,   setShowFilters]   = useState(false);
  const [formOpen,      setFormOpen]      = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    loadStats();
    adminApi.getActiveDepartments().then(({ data }) => { if (data.success) setDepartments(data.data); }).catch(() => {});
  }, []);

  useEffect(() => { loadResources(); }, [debouncedSearch, filters, page, size, sortBy, sortDir]);

  const loadStats = () => {
    setStatsLoading(true);
    resourceApi.getStats().then(({ data }) => { if (data.success) setStats(data.data); }).catch(() => {}).finally(() => setStatsLoading(false));
  };

  const loadResources = useCallback(() => {
    setLoading(true);
    const params = {
      search: debouncedSearch || undefined,
      category: filters.category || undefined,
      scope: filters.scope || undefined,
      approvalAuthority: filters.approvalAuthority || undefined,
      departmentId: filters.departmentId || undefined,
      isActive: filters.isActive !== '' ? filters.isActive === 'true' : undefined,
      page: page - 1, size, sortBy, sortDir,
    };
    resourceApi.search(params)
      .then(({ data }) => { if (data.success) { setResources(data.data.content); setTotalPages(data.data.totalPages); setTotalItems(data.data.totalElements); } })
      .catch(() => toast.error('Failed to load resources.'))
      .finally(() => setLoading(false));
  }, [debouncedSearch, filters, page, size, sortBy, sortDir]);

  const handleFilterChange = (e) => { setFilters((p) => ({ ...p, [e.target.name]: e.target.value })); setPage(1); };
  const handleClearFilters = () => { setSearchInput(''); setFilters({ category: '', scope: '', approvalAuthority: '', departmentId: '', isActive: '' }); setPage(1); };
  const activeFilterCount = Object.values(filters).filter(Boolean).length + (searchInput ? 1 : 0);
  const handleSort = (field) => { if (sortBy === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(field); setSortDir('asc'); } };

  const handleFormSuccess = (resource, mode) => { toast.success('Resource ' + mode + ' successfully.'); loadResources(); loadStats(); };

  const handleToggleActive = async (r) => {
    try { await resourceApi.toggleActive(r.id); toast.success('Resource ' + (r.isActive ? 'deactivated' : 'activated') + '.'); loadResources(); loadStats(); }
    catch { toast.error('Failed to update status.'); }
  };
  const handleToggleMaintenance = async (r) => {
    try { await resourceApi.toggleMaintenance(r.id); toast.success('Maintenance status updated for ' + r.name + '.'); loadResources(); loadStats(); }
    catch { toast.error('Failed to update maintenance status.'); }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try { await resourceApi.delete(deleteTarget.id); toast.success('"' + deleteTarget.name + '" deleted.'); setDeleteTarget(null); loadResources(); loadStats(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete.'); }
    finally { setDeleteLoading(false); }
  };

  const TH = ({ field, label, sx }) => (
    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary', whiteSpace: 'nowrap', ...sx }}>
      {field ? <TableSortLabel active={sortBy === field} direction={sortBy === field ? sortDir : 'asc'} onClick={() => handleSort(field)}>{label}</TableSortLabel> : label}
    </TableCell>
  );

  return (
    <AdminLayout title="Resource Management">
      <ResourceStatsCards stats={stats} loading={statsLoading} />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Resources</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {totalItems > 0 ? totalItems + ' resource' + (totalItems !== 1 ? 's' : '') + ' found' : 'Manage campus labs, classrooms and equipment'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Refresh">
            <IconButton onClick={() => { loadResources(); loadStats(); }} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
              <RefreshRounded fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" startIcon={<FilterListRounded />} onClick={() => setShowFilters((p) => !p)} size="small"
            color={activeFilterCount > 0 ? 'primary' : 'inherit'} sx={{ borderColor: activeFilterCount > 0 ? 'primary.main' : 'divider' }}>
            Filters {activeFilterCount > 0 && '(' + activeFilterCount + ')'}
          </Button>
          <Button variant="contained" startIcon={<AddRounded />} onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            Add Resource
          </Button>
        </Stack>
      </Box>

      {(showFilters || activeFilterCount > 0) && (
        <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box component="input" placeholder="Search name, code, location..." value={searchInput} onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
              sx={{ flex: '1 1 200px', height: 40, px: 2, border: '1px solid', borderColor: 'divider', borderRadius: '10px', bgcolor: '#F8FAFF', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', '&:focus': { borderColor: '#1565C0' } }} />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select name="category" value={filters.category} label="Category" onChange={handleFilterChange}>
                <MenuItem value="">All Categories</MenuItem>
                {RESOURCE_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{CATEGORY_LABELS[c]}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Scope</InputLabel>
              <Select name="scope" value={filters.scope} label="Scope" onChange={handleFilterChange}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="COMMON">Common</MenuItem>
                <MenuItem value="DEPARTMENT">Department</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 155 }}>
              <InputLabel>Approval</InputLabel>
              <Select name="approvalAuthority" value={filters.approvalAuthority} label="Approval" onChange={handleFilterChange}>
                <MenuItem value="">All</MenuItem>
                {Object.entries(APPROVAL_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>Department</InputLabel>
              <Select name="departmentId" value={filters.departmentId} label="Department" onChange={handleFilterChange}>
                <MenuItem value="">All Departments</MenuItem>
                {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Status</InputLabel>
              <Select name="isActive" value={filters.isActive} label="Status" onChange={handleFilterChange}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
            {activeFilterCount > 0 && <Button size="small" onClick={handleClearFilters} sx={{ color: 'text.secondary' }}>Clear all</Button>}
          </Box>
        </Paper>
      )}

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFF' }}>
                <TH field="name"     label="Resource"  sx={{ pl: 2.5, minWidth: 200 }} />
                <TH field="category" label="Category"  sx={{ minWidth: 130 }} />
                <TH field="scope"    label="Scope"     sx={{ display: { xs: 'none', md: 'table-cell' } }} />
                <TH field={null}     label="Dept Owner" sx={{ display: { xs: 'none', lg: 'table-cell' } }} />
                <TH field={null}     label="Approval"  sx={{ display: { xs: 'none', md: 'table-cell' } }} />
                <TH field="capacity" label="Cap."      sx={{ display: { xs: 'none', sm: 'table-cell' }, textAlign: 'center' }} />
                <TH field={null}     label="Buffer"    sx={{ display: { xs: 'none', lg: 'table-cell' } }} />
                <TH field={null}     label="Status"    sx={{}} />
                <TH field={null}     label="Actions"   sx={{ pr: 2.5, textAlign: 'right' }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 7 }}><CircularProgress size={28} /><Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>Loading resources...</Typography></TableCell></TableRow>
              ) : resources.length === 0 ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 7 }}><Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{activeFilterCount > 0 ? 'No resources match the current filters.' : 'No resources found. Click "Add Resource" to get started.'}</Typography></TableCell></TableRow>
              ) : resources.map((r) => (
                <TableRow key={r.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFF' } }}>
                  <TableCell sx={{ pl: 2.5, py: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{r.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.7rem' }}>{r.resourceCode}</Typography>
                    {(r.buildingName || r.floorNumber || r.location) && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.68rem' }}>
                        {[r.buildingName, r.floorNumber && 'Floor ' + r.floorNumber, r.location].filter(Boolean).join(' · ')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}><CategoryChip category={r.category} /></TableCell>
                  <TableCell sx={{ py: 1.5, display: { xs: 'none', md: 'table-cell' } }}><ScopeBadge scope={r.scope} /></TableCell>
                  <TableCell sx={{ py: 1.5, display: { xs: 'none', lg: 'table-cell' } }}>
                    <Typography variant="caption" sx={{ color: r.departmentOwnerName ? 'text.primary' : 'text.disabled', fontWeight: r.departmentOwnerName ? 500 : 400 }}>{r.departmentOwnerName ?? '—'}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, display: { xs: 'none', md: 'table-cell' } }}><ApprovalChip authority={r.approvalAuthority} /></TableCell>
                  <TableCell sx={{ py: 1.5, display: { xs: 'none', sm: 'table-cell' }, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: r.capacity ? 'text.primary' : 'text.disabled' }}>{r.capacity ?? '—'}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, display: { xs: 'none', lg: 'table-cell' } }}>
                    {(r.bufferDaysBefore > 0 || r.bufferDaysAfter > 0)
                      ? <Typography variant="caption" sx={{ color: 'text.secondary' }}>{r.bufferDaysBefore}d before · {r.bufferDaysAfter}d after</Typography>
                      : <Typography variant="caption" sx={{ color: 'text.disabled' }}>None</Typography>}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}><StatusChip isActive={r.isActive} isUnderMaintenance={r.isUnderMaintenance} /></TableCell>
                  <TableCell sx={{ py: 1.5, pr: 2.5 }} align="right">
                    <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                      <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => { setEditTarget(r); setFormOpen(true); }}><EditOutlined sx={{ fontSize: 17 }} /></IconButton></Tooltip>
                      <Tooltip title={r.isUnderMaintenance ? 'Remove Maintenance' : 'Set Maintenance'}><IconButton size="small" color={r.isUnderMaintenance ? 'success' : 'warning'} onClick={() => handleToggleMaintenance(r)}><BuildOutlined sx={{ fontSize: 17 }} /></IconButton></Tooltip>
                      <Tooltip title={r.isActive ? 'Deactivate' : 'Activate'}><IconButton size="small" color={r.isActive ? 'default' : 'success'} onClick={() => handleToggleActive(r)}><PowerSettingsNewRounded sx={{ fontSize: 17 }} /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(r)}><DeleteOutlineRounded sx={{ fontSize: 17 }} /></IconButton></Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {totalPages > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Rows per page:</Typography>
              <FormControl size="small"><Select value={size} onChange={(e) => { setSize(e.target.value); setPage(1); }} sx={{ fontSize: '0.8rem', height: 32 }}>{PAGE_SIZE_OPTIONS.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}</Select></FormControl>
              <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{Math.min((page - 1) * size + 1, totalItems)}-{Math.min(page * size, totalItems)} of {totalItems}</Typography>
            </Box>
            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" size="small" shape="rounded" />
          </Box>
        )}
      </Paper>

      <ResourceFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSuccess={handleFormSuccess} editTarget={editTarget} />

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleteLoading && setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main', pb: 1 }}>Delete Resource</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>Are you sure you want to permanently delete <strong>"{deleteTarget?.name}"</strong>?</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Code: <strong>{deleteTarget?.resourceCode}</strong></Typography>
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#FFF5F5', borderRadius: 2, border: '1px solid', borderColor: 'error.light' }}>
            <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>Warning: This action cannot be undone.</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" disabled={deleteLoading}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={deleteLoading} sx={{ minWidth: 100 }}>
            {deleteLoading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}