import {
  Box, Button, Chip, CircularProgress, Divider, FormControl,
  Grid, IconButton, InputLabel, MenuItem, Pagination, Paper,
  Select, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import {
  AddRounded, CalendarMonthOutlined, CancelOutlined,
  DescriptionOutlined, RefreshRounded, VisibilityOutlined,
} from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../api/bookingApi';
import {
  BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS,
  EVENT_DOMAINS,
} from '../../utils/bookingConstants';
import { CATEGORY_LABELS } from '../../utils/resourceConstants';
import {
  Dialog, DialogActions, DialogContent, DialogTitle, TextField,
} from '@mui/material';
import Navbar from '../../components/Navbar';

// ─── Status chip ───────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const c = BOOKING_STATUS_COLORS[status] || {};
  return (
    <Chip
      label={BOOKING_STATUS_LABELS[status] || status}
      size="small"
      sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: c.bg, color: c.text, border: 'none' }}
    />
  );
}

// ─── Booking detail drawer ─────────────────────────────────────────────────────
function BookingDetailDialog({ booking, open, onClose, onCancel }) {
  if (!booking) return null;
  const canCancel = ['PENDING', 'PENDING_HOD', 'PENDING_ADMIN', 'DRAFT'].includes(booking.status);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Booking Details
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 400 }}>
          Ref: {booking.bookingReference}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {[
            { label: 'Event Name',   value: booking.eventName },
            { label: 'Domain',       value: EVENT_DOMAINS.find((d) => d.value === booking.eventDomain)?.label || booking.eventDomain },
            { label: 'Resource',     value: `${booking.resourceName} (${booking.resourceCode})` },
            { label: 'Date',         value: booking.bookingDate },
            { label: 'Time',         value: `${booking.startTime} – ${booking.endTime}` },
            { label: 'Participants', value: booking.participantsCount },
            { label: 'Priority',     value: booking.priority },
            { label: 'Status',       value: <StatusChip status={booking.status} /> },
          ].map((row) => (
            <Grid item xs={6} key={row.label}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', display: 'block' }}>
                {row.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {row.value}
              </Typography>
            </Grid>
          ))}

          {booking.rejectionReason && (
            <Grid item xs={12}>
              <Box sx={{ p: 1.5, bgcolor: '#FFF5F5', borderRadius: 2, border: '1px solid', borderColor: 'error.light' }}>
                <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700, display: 'block' }}>
                  Rejection Reason
                </Typography>
                <Typography variant="body2">{booking.rejectionReason}</Typography>
              </Box>
            </Grid>
          )}

          {booking.coordinatorCount > 0 && (
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', display: 'block' }}>
                Coordinators
              </Typography>
              <Typography variant="body2" fontWeight={600}>{booking.coordinatorCount} added</Typography>
            </Grid>
          )}
          {booking.facultySupportCount > 0 && (
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', display: 'block' }}>
                Faculty Support
              </Typography>
              <Typography variant="body2" fontWeight={600}>{booking.facultySupportCount} added</Typography>
            </Grid>
          )}
          {booking.documentCount > 0 && (
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', display: 'block' }}>
                Documents
              </Typography>
              <Typography variant="body2" fontWeight={600}>{booking.documentCount} uploaded</Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        {canCancel && (
          <Button color="error" variant="outlined" startIcon={<CancelOutlined />}
            onClick={() => { onClose(); onCancel(booking); }}>
            Cancel Booking
          </Button>
        )}
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Cancel dialog ─────────────────────────────────────────────────────────────
function CancelDialog({ booking, open, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!open) setReason(''); }, [open]);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(booking?.id, reason || 'Cancelled by requester');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Cancel Booking</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Are you sure you want to cancel{' '}
          <strong>&ldquo;{booking?.eventName}&rdquo;</strong>?
        </Typography>
        <TextField
          fullWidth multiline rows={2} size="small"
          label="Reason (Optional)" value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Briefly explain why you are cancelling this booking…"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>Keep Booking</Button>
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Yes, Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [bookings,      setBookings]      = useState([]);
  const [totalPages,    setTotalPages]    = useState(0);
  const [totalItems,    setTotalItems]    = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [page,          setPage]          = useState(1);
  const [statusFilter,  setStatusFilter]  = useState('');
  const [detailTarget,  setDetailTarget]  = useState(null);
  const [cancelTarget,  setCancelTarget]  = useState(null);

  const loadBookings = useCallback(() => {
    setLoading(true);
    bookingApi.getMyBookings({
      status: statusFilter || undefined,
      page:   page - 1,
      size:   10,
    })
      .then(({ data }) => {
        if (data.success) {
          setBookings(data.data.content);
          setTotalPages(data.data.totalPages);
          setTotalItems(data.data.totalElements);
        }
      })
      .catch(() => toast.error('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const handleCancel = async (id, reason) => {
    try {
      await bookingApi.cancel(id, reason);
      toast.success('Booking cancelled.');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const canCancel = (status) =>
    ['PENDING', 'PENDING_HOD', 'PENDING_ADMIN', 'DRAFT'].includes(status);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg,#1565C0,#0D47A1)', px: { xs: 2, sm: 4 }, py: 3, pt: { xs: 9, sm: 10 } }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'white' }}>My Bookings</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
              Track and manage all your resource booking requests
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => navigate('/bookings/new')}
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }, backdropFilter: 'blur(4px)', boxShadow: 'none' }}
          >
            New Booking
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, sm: 3 }, py: 4 }}>

        {/* Filter bar */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', flexShrink: 0 }}>
            Filter by status:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status"
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <MenuItem value="">All Statuses</MenuItem>
              {Object.entries(BOOKING_STATUS_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {totalItems} booking{totalItems !== 1 ? 's' : ''}
          </Typography>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={loadBookings} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <RefreshRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        </Paper>

        {/* Table */}
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFF' }}>
                  {['Reference', 'Event', 'Resource', 'Date & Time', 'Participants', 'Status', 'Actions'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary',
                      display: ['Participants'].includes(h) ? { xs: 'none', md: 'table-cell' } : undefined,
                      pr: h === 'Actions' ? 2.5 : undefined, pl: h === 'Reference' ? 2.5 : undefined,
                    }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={28} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                        Loading bookings…
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <CalendarMonthOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5, display: 'block', mx: 'auto' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        No bookings found.
                      </Typography>
                      <Button variant="outlined" startIcon={<AddRounded />} size="small"
                        sx={{ mt: 2 }} onClick={() => navigate('/bookings/new')}>
                        Create your first booking
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((b) => (
                    <TableRow key={b.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFF' } }}>
                      <TableCell sx={{ pl: 2.5, py: 1.5 }}>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main', fontSize: '0.78rem' }}>
                          {b.bookingReference}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>
                          {new Date(b.createdAt).toLocaleDateString('en-IN')}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{b.eventName}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {EVENT_DOMAINS.find((d) => d.value === b.eventDomain)?.label || b.eventDomain}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{b.resourceName}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                          {b.resourceCode}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{b.bookingDate}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {b.startTime} – {b.endTime}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5, display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2" fontWeight={600}>{b.participantsCount}</Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <StatusChip status={b.status} />
                      </TableCell>

                      <TableCell sx={{ py: 1.5, pr: 2.5 }} align="right">
                        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton size="small" color="primary" onClick={() => setDetailTarget(b)}>
                              <VisibilityOutlined sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                          {canCancel(b.status) && (
                            <Tooltip title="Cancel Booking">
                              <IconButton size="small" color="error" onClick={() => setCancelTarget(b)}>
                                <CancelOutlined sx={{ fontSize: 17 }} />
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
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
              <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)}
                color="primary" size="small" shape="rounded" />
            </Box>
          )}
        </Paper>
      </Box>

      {/* Dialogs */}
      <BookingDetailDialog
        booking={detailTarget} open={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        onCancel={(b) => setCancelTarget(b)}
      />
      <CancelDialog
        booking={cancelTarget} open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
      />
    </Box>
  );
}
