import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AddRounded,
  EditOutlined,
  PowerSettingsNewRounded,
  SearchRounded,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';

const emptyForm = { name: '', code: '', description: '', hodName: '', hodEmail: '' };

export default function DepartmentManagementPage() {
  const [departments, setDepartments] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  const fetchDepts = () => {
    setLoading(true);
    adminApi.getAllDepartments({ search: search || undefined, page: page - 1, size: 10 })
      .then(({ data }) => {
        if (data.success) {
          setDepartments(data.data.content);
          setTotalPages(data.data.totalPages);
        }
      })
      .catch(() => toast.error('Failed to load departments.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDepts(); }, [page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchDepts(); };

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setFormErrors({}); setDialogOpen(true); };
  const openEdit = (dept) => {
    setEditTarget(dept);
    setForm({ name: dept.name, code: dept.code, description: dept.description || '', hodName: dept.hodName || '', hodEmail: dept.hodEmail || '' });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === 'code' ? value.toUpperCase() : value }));
    setFormErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim() || form.name.length < 3) errors.name = 'Name must be at least 3 characters.';
    if (!form.code.trim() || form.code.length < 2) errors.code = 'Code is required (min 2 chars).';
    if (!/^[A-Z0-9_-]+$/.test(form.code)) errors.code = 'Code must be uppercase alphanumeric.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setFormLoading(true);
    try {
      let result;
      if (editTarget) {
        result = await adminApi.updateDepartment(editTarget.id, form);
        toast.success('Department updated.');
      } else {
        result = await adminApi.createDepartment(form);
        toast.success('Department created.');
      }
      setDialogOpen(false);
      fetchDepts();
    } catch (err) {
      const apiErr = err.response?.data;
      if (apiErr?.data) setFormErrors(apiErr.data);
      else toast.error(apiErr?.message || 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminApi.toggleDepartmentStatus(id);
      toast.success('Department status updated.');
      fetchDepts();
    } catch {
      toast.error('Failed to toggle status.');
    }
  };

  return (
    <AdminLayout title="Department Management">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Departments</Typography>
          <Typography variant="body2" color="text.secondary">Manage campus departments</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} onClick={openCreate}>Add Department</Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search by name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
          />
          <Button type="submit" variant="outlined" size="small">Search</Button>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAFF' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', display: { xs: 'none', sm: 'table-cell' } }}>HOD</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', display: { xs: 'none', md: 'table-cell' } }}>Resources / Users</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : departments.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><Typography variant="body2" color="text.secondary">No departments found.</Typography></TableCell></TableRow>
              ) : departments.map((dept) => (
                <TableRow key={dept.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{dept.name}</Typography>
                    {dept.description && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dept.description}</Typography>}
                  </TableCell>
                  <TableCell>
                    <Chip label={dept.code} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.72rem' }} />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography variant="body2">{dept.hodName || '—'}</Typography>
                    {dept.hodEmail && <Typography variant="caption" color="text.secondary">{dept.hodEmail}</Typography>}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="caption" color="text.secondary">
                      {dept.resourceCount} resources · {dept.userCount} users
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={dept.isActive ? 'Active' : 'Inactive'} size="small" color={dept.isActive ? 'success' : 'default'} variant="outlined" sx={{ height: 20, fontSize: '0.68rem' }} />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => openEdit(dept)}>
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={dept.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton size="small" color={dept.isActive ? 'warning' : 'success'} onClick={() => handleToggle(dept.id)}>
                          <PowerSettingsNewRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" size="small" />
          </Box>
        )}
      </Paper>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editTarget ? 'Edit Department' : 'Add Department'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label="Department Name" name="name" value={form.name} onChange={handleFormChange} error={!!formErrors.name} helperText={formErrors.name} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Code" name="code" value={form.code} onChange={handleFormChange} error={!!formErrors.code} helperText={formErrors.code || 'e.g. CSE'} inputProps={{ style: { textTransform: 'uppercase' } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description (Optional)" name="description" value={form.description} onChange={handleFormChange} multiline rows={2} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="HOD Name (Optional)" name="hodName" value={form.hodName} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="HOD Email (Optional)" name="hodEmail" type="email" value={form.hodEmail} onChange={handleFormChange} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={formLoading}>
            {formLoading ? <CircularProgress size={20} color="inherit" /> : editTarget ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
