import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Grid, TextField, Typography,
} from '@mui/material';
import {
  CheckCircleOutlineRounded, CancelOutlined, EditNoteRounded,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { DECISION_OPTIONS } from '../../utils/approvalConstants';
import ValidationReportCard from './ValidationReportCard';
import { approvalApi } from '../../api/approvalApi';

const ACTION_ICONS = {
  APPROVE:          <CheckCircleOutlineRounded />,
  REJECT:           <CancelOutlined />,
  REQUEST_REVISION: <EditNoteRounded />,
};

export default function DecisionDialog({ item, open, onClose, onDecisionMade }) {
  const [action,    setAction]    = useState('');
  const [remarks,   setRemarks]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [report,    setReport]    = useState(null);
  const [loadingRpt,setLoadingRpt]= useState(false);

  // Load validation report when dialog opens
  useEffect(() => {
    if (!open || !item) return;
    setAction('');
    setRemarks('');
    setError('');
    setReport(null);
    setLoadingRpt(true);
    approvalApi.validate(item.bookingId)
      .then(({ data }) => { if (data.success) setReport(data.data); })
      .catch(() => {})
      .finally(() => setLoadingRpt(false));
  }, [open, item]);

  const handleSubmit = async () => {
    if (!action) { setError('Please select a decision.'); return; }
    if ((action === 'REJECT' || action === 'REQUEST_REVISION') && !remarks.trim()) {
      setError('Remarks are required for rejection or revision requests.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await approvalApi.decide(item.approvalId, { action, remarks });
      if (data.success) {
        onDecisionMade(data.data, action);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Decision failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  const selectedOption = DECISION_OPTIONS.find((o) => o.value === action);

  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined}
      maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box>
          Review Booking Request
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 400, mt: 0.25 }}>
            {item.bookingReference} · {item.eventName}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, pb: 1 }}>
        {/* Booking summary */}
        <Box sx={{ bgcolor: '#F8FAFF', borderRadius: 2, p: 2, border: '1px solid', borderColor: 'divider', mb: 2.5 }}>
          <Grid container spacing={1.5}>
            {[
              { label: 'Event',        value: item.eventName },
              { label: 'Domain',       value: item.eventDomain?.replace('_', ' ') },
              { label: 'Resource',     value: `${item.resourceName} (${item.resourceCode})` },
              { label: 'Date',         value: item.bookingDate },
              { label: 'Time',         value: `${item.startTime} – ${item.endTime}` },
              { label: 'Participants', value: item.participantsCount },
              { label: 'Organizer',    value: item.organizerName },
              { label: 'Role',         value: item.organizerRole },
              { label: 'Department',   value: item.organizerDepartment || '—' },
              { label: 'Priority',     value: (
                <Chip label={item.priority} size="small"
                  sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700,
                    bgcolor: item.priority === 'HIGH' ? '#FCE4EC' : '#E3F2FD',
                    color:   item.priority === 'HIGH' ? '#880E4F' : '#1565C0', border: 'none' }} />
              )},
            ].map((row) => (
              <Grid item xs={6} sm={4} key={row.label}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', display: 'block' }}>
                  {row.label}
                </Typography>
                {typeof row.value === 'string' || typeof row.value === 'number'
                  ? <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.value}</Typography>
                  : row.value}
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Validation report */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          Validation Report
        </Typography>
        <ValidationReportCard report={report} loading={loadingRpt} />

        <Divider sx={{ my: 2.5 }} />

        {/* Decision selection */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          Your Decision
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
          {DECISION_OPTIONS.map((opt) => (
            <Box
              key={opt.value}
              onClick={() => { setAction(opt.value); setError(''); }}
              sx={{
                flex: '1 1 140px',
                p: 1.5, borderRadius: 2, cursor: 'pointer',
                border: '2px solid',
                borderColor: action === opt.value
                  ? (opt.color === 'success' ? 'success.main' : opt.color === 'error' ? 'error.main' : 'primary.main')
                  : 'divider',
                bgcolor: action === opt.value
                  ? (opt.color === 'success' ? '#E8F5E9' : opt.color === 'error' ? '#FFF5F5' : '#EFF4FF')
                  : '#FAFAFA',
                transition: 'all 0.15s',
                '&:hover': { borderColor: 'primary.main', bgcolor: '#EFF4FF' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5,
                color: action === opt.value
                  ? (opt.color === 'success' ? 'success.main' : opt.color === 'error' ? 'error.main' : 'primary.main')
                  : 'text.secondary' }}>
                {ACTION_ICONS[opt.value]}
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{opt.label}</Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4, display: 'block' }}>
                {opt.description}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Remarks */}
        <TextField
          fullWidth multiline rows={3} label="Remarks"
          required={action === 'REJECT' || action === 'REQUEST_REVISION'}
          value={remarks}
          onChange={(e) => { setRemarks(e.target.value); setError(''); }}
          placeholder={
            action === 'APPROVE'           ? 'Optional comments for the organizer…' :
            action === 'REJECT'            ? 'Required: Explain why this booking is being rejected…' :
            action === 'REQUEST_REVISION'  ? 'Required: Describe what changes are needed…' :
            'Select a decision above, then add remarks if needed…'
          }
          inputProps={{ maxLength: 1000 }}
          helperText={`${remarks.length} / 1000`}
          disabled={!action}
        />

        {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}

        {/* Validation warning if report has failures */}
        {report && !report.passed && action === 'APPROVE' && (
          <Alert severity="warning" sx={{ mt: 1.5 }}>
            One or more validation checks have failed. Approving despite failures is possible
            but requires administrator discretion.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1.5 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !action}
          color={
            selectedOption?.color === 'error'   ? 'error'   :
            selectedOption?.color === 'success' ? 'success' : 'primary'
          }
          sx={{ minWidth: 160 }}
        >
          {loading
            ? <CircularProgress size={20} color="inherit" />
            : selectedOption ? `Confirm: ${selectedOption.label}` : 'Select a Decision'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
