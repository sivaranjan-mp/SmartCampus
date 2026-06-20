import {
  Box, Chip, CircularProgress, IconButton, Pagination, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Typography,
} from '@mui/material';
import { GavelRounded, VisibilityOutlined } from '@mui/icons-material';
import { useState } from 'react';
import {
  APPROVAL_STATUS_COLORS, APPROVAL_STATUS_LABELS,
  PRIORITY_COLORS,
} from '../../utils/approvalConstants';
import { BOOKING_STATUS_LABELS, EVENT_DOMAINS } from '../../utils/bookingConstants';
import DecisionDialog from './DecisionDialog';
import toast from 'react-hot-toast';

function ApprovalStatusChip({ status }) {
  const c = APPROVAL_STATUS_COLORS[status] || {};
  return (
    <Chip label={APPROVAL_STATUS_LABELS[status] || status} size="small"
      sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: c.bg, color: c.text, border: 'none' }} />
  );
}

function PriorityBadge({ priority }) {
  const c = PRIORITY_COLORS[priority] || {};
  return (
    <Typography variant="caption"
      sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: c.bg, color: c.text, fontWeight: 700, fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
      {priority}
    </Typography>
  );
}

export default function ApprovalQueueTable({
  items, loading, totalPages, page, onPageChange, onRefresh, showHistoryMode = false,
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen,   setDialogOpen]   = useState(false);

  const handleDecisionMade = (result, action) => {
    toast.success(
      action === 'APPROVE'           ? 'Booking approved!' :
      action === 'REJECT'            ? 'Booking rejected.' :
      'Revision requested from organizer.'
    );
    setDialogOpen(false);
    onRefresh();
  };

  const openDecision = (item) => { setSelectedItem(item); setDialogOpen(true); };

  const COL = ({ label, sx }) => (
    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary', ...sx }}>
      {label}
    </TableCell>
  );

  return (
    <>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFF' }}>
                <COL label="Booking"      sx={{ pl: 2.5, minWidth: 200 }} />
                <COL label="Event"        sx={{ minWidth: 160 }} />
                <COL label="Resource"     sx={{ display: { xs: 'none', md: 'table-cell' } }} />
                <COL label="Date / Time"  sx={{ display: { xs: 'none', sm: 'table-cell' } }} />
                <COL label="Organizer"    sx={{ display: { xs: 'none', lg: 'table-cell' } }} />
                <COL label="Priority"     sx={{}} />
                <COL label="Status"       sx={{}} />
                <COL label="Actions"      sx={{ pr: 2.5, textAlign: 'right' }} />
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                    <CircularProgress size={28} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                      Loading queue…
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                    <GavelRounded sx={{ fontSize: 44, color: 'text.disabled', mb: 1.5, display: 'block', mx: 'auto' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      {showHistoryMode ? 'No reviewed bookings found.' : 'No pending approvals. All caught up!'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.approvalId} hover sx={{ '&:hover': { bgcolor: '#F8FAFF' } }}>
                    {/* Booking */}
                    <TableCell sx={{ pl: 2.5, py: 1.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main', fontSize: '0.78rem', display: 'block' }}>
                        {item.bookingReference}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                        {new Date(item.createdAt).toLocaleDateString('en-IN')}
                      </Typography>
                    </TableCell>

                    {/* Event */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{item.eventName}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {EVENT_DOMAINS.find((d) => d.value === item.eventDomain)?.label || item.eventDomain}
                      </Typography>
                    </TableCell>

                    {/* Resource */}
                    <TableCell sx={{ py: 1.5, display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{item.resourceName}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{item.resourceCode}</Typography>
                    </TableCell>

                    {/* Date/Time */}
                    <TableCell sx={{ py: 1.5, display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.bookingDate}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.startTime} – {item.endTime}</Typography>
                    </TableCell>

                    {/* Organizer */}
                    <TableCell sx={{ py: 1.5, display: { xs: 'none', lg: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{item.organizerName}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {item.organizerRole} {item.organizerRegisterNumber && `· ${item.organizerRegisterNumber}`}
                      </Typography>
                    </TableCell>

                    {/* Priority */}
                    <TableCell sx={{ py: 1.5 }}>
                      <PriorityBadge priority={item.priority} />
                    </TableCell>

                    {/* Status */}
                    <TableCell sx={{ py: 1.5 }}>
                      <ApprovalStatusChip status={item.approvalStatus} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ py: 1.5, pr: 2.5 }} align="right">
                      <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                        {!showHistoryMode && item.approvalStatus === 'PENDING' ? (
                          <Tooltip title="Review & Decide">
                            <IconButton size="small" color="primary" onClick={() => openDecision(item)}>
                              <GavelRounded sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="View Details">
                            <IconButton size="small" color="default" onClick={() => openDecision(item)}>
                              <VisibilityOutlined sx={{ fontSize: 17 }} />
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
            <Pagination count={totalPages} page={page}
              onChange={(_, v) => onPageChange(v)} color="primary" size="small" shape="rounded" />
          </Box>
        )}
      </Paper>

      <DecisionDialog
        item={selectedItem}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onDecisionMade={handleDecisionMade}
      />
    </>
  );
}
