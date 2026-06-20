import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
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
  BlockRounded,
  CheckCircleOutlineRounded,
  DeleteOutlineRounded,
  SearchRounded,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { ROLE_COLORS, ROLE_LABELS } from '../../utils/roleUtils';

const ROLE_OPTIONS = ['', 'STUDENT', 'FACULTY', 'HOD', 'ADMIN'];

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Artificial Intelligence and Data Science',
  'Biomedical Engineering',
  'Chemical Engineering',
  'Aeronautical Engineering',
];

const emptyForm = { fullName: '', email: '', role: 'FACULTY', department: '', phoneNumber: '' };

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    adminApi.getAllUsers({ search: search || undefined, role: roleFilter || undefined, page: page - 1, size: 10 })
      .then(({ data }) => {
        if (data.success) {
          setUsers(data.data.content);
          setTotalPages(data.data.totalPages);
        }
      })
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setFormErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'Required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email';
    if (!form.role) errors.role = 'Required';
    if (!form.department) errors.department = 'Required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;
    setFormLoading(true);
    try {
      const { data } = await adminApi.createManagedUser(form);
      if (data.success) {
        toast.success('User created. Credentials emailed.');
        setCreateOpen(false);
        setForm(emptyForm);
        fetchUsers();
      }
    } catch (err) {
      const apiErr = err.response?.data;
      if (apiErr?.data) setFormErrors(apiErr.data);
      else toast.error(apiErr?.message || 'Failed to create user.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminApi.updateUserStatus(user.id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}.`);
      fetchUsers();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteUser(deleteTarget.id);
      toast.success('User deleted.');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const avatarColor = (role) => ({ STUDENT: '#1565C0', FACULTY: '#0097A7', HOD: '#F57C00', ADMIN: '#D32F2F' }[role] || '#777');

  return (
    <AdminLayout title="User Management">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Users</Typography>
          <Typography variant="body2" color="text.secondary">Manage faculty and HOD accounts</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} onClick={() => setCreateOpen(true)}>
          Add User
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by name, email, register no."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 220 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Role</InputLabel>
            <Select value={roleFilter} label="Role" onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
              {ROLE_OPTIONS.map((r) => <MenuItem key={r} value={r}>{r || 'All Roles'}</MenuItem>)}
            </Select>
          </FormControl>
          <Button type="submit" variant="outlined" size="small">Search</Button>
        </Box>
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAFF' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', display: { xs: 'none', md: 'table-cell' } }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">No users found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: avatarColor(user.role), fontSize: '0.8rem', fontWeight: 700 }}>
                          {user.fullName?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{user.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={ROLE_LABELS[user.role] || user.role} size="small" color={ROLE_COLORS[user.role] || 'default'} sx={{ height: 22, fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="caption" color="text.secondary">{user.department || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Chip label={user.isActive ? 'Active' : 'Inactive'} size="small" color={user.isActive ? 'success' : 'default'} variant="outlined" sx={{ height: 20, fontSize: '0.68rem' }} />
                        {user.isVerified && <Chip label="Verified" size="small" color="info" variant="outlined" sx={{ height: 20, fontSize: '0.68rem' }} />}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                          <IconButton size="small" onClick={() => handleToggleStatus(user)} color={user.isActive ? 'warning' : 'success'}>
                            {user.isActive ? <BlockRounded fontSize="small" /> : <CheckCircleOutlineRounded fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        {user.role !== 'ADMIN' && (
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeleteTarget(user)}>
                              <DeleteOutlineRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" size="small" />
          </Box>
        )}
      </Paper>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New User</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2.5, mt: 1 }}>
            A temporary password will be emailed to the user. Only Faculty and HOD roles can be created here.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Full Name" name="fullName" value={form.fullName} onChange={handleFormChange} error={!!formErrors.fullName} helperText={formErrors.fullName} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleFormChange} error={!!formErrors.email} helperText={formErrors.email} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.role}>
                <InputLabel>Role</InputLabel>
                <Select name="role" value={form.role} label="Role" onChange={handleFormChange}>
                  <MenuItem value="FACULTY">Faculty</MenuItem>
                  <MenuItem value="HOD">Head of Department</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.department}>
                <InputLabel>Department</InputLabel>
                <Select name="department" value={form.department} label="Department" onChange={handleFormChange}>
                  {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Phone (Optional)" name="phoneNumber" value={form.phoneNumber} onChange={handleFormChange} inputProps={{ maxLength: 10 }} error={!!formErrors.phoneNumber} helperText={formErrors.phoneNumber} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setCreateOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained" disabled={formLoading}>
            {formLoading ? <CircularProgress size={20} color="inherit" /> : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Delete User</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleteTarget?.fullName}</strong>? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined">Cancel</Button>
          <Button onClick={handleDeleteUser} variant="contained" color="error" disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
