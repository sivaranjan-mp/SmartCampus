import {
  Alert, Box, Chip, CircularProgress, FormControl, Grid,
  InputLabel, MenuItem, Paper, Select, TextField, Typography,
} from '@mui/material';
import {
  AccessTimeRounded, CalendarMonthRounded, CheckCircleOutlineRounded,
  ErrorOutlineRounded, MeetingRoomOutlined,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { bookingApi } from '../../api/bookingApi';
import { CATEGORY_LABELS } from '../../utils/resourceConstants';
import useDebounce from '../../hooks/useDebounce';

export default function ResourcePicker({ value, onChange, errors }) {
  const [resources,    setResources]    = useState([]);
  const [loadingRes,   setLoadingRes]   = useState(false);
  const [availability, setAvailability] = useState(null);
  const [checkingAvail,setCheckingAvail]= useState(false);

  const { resourceId, bookingDate, startTime, endTime } = value;

  // Debounce the availability check
  const debouncedDate = useDebounce(bookingDate, 600);

  // Load active resources on mount
  useEffect(() => {
    setLoadingRes(true);
    bookingApi.getActiveResources()
      .then(({ data }) => {
        if (data.success) setResources(data.data.content || []);
      })
      .catch(() => {})
      .finally(() => setLoadingRes(false));
  }, []);

  // Check availability when resource + date are both set
  useEffect(() => {
    if (!resourceId || !debouncedDate) { setAvailability(null); return; }
    setCheckingAvail(true);
    bookingApi.checkAvailability(resourceId, debouncedDate)
      .then(({ data }) => { if (data.success) setAvailability(data.data); })
      .catch(() => setAvailability(null))
      .finally(() => setCheckingAvail(false));
  }, [resourceId, debouncedDate]);

  const selected = resources.find((r) => r.id === resourceId);

  const handleChange = (field, val) => {
    onChange({ ...value, [field]: val });
  };

  // Earliest bookable date (today + 3 for students; server also enforces)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <Box>
      <Grid container spacing={2.5}>

        {/* Resource select */}
        <Grid item xs={12}>
          <FormControl fullWidth required error={!!errors.resourceId}>
            <InputLabel>Select Resource</InputLabel>
            <Select
              value={resourceId || ''}
              label="Select Resource"
              onChange={(e) => handleChange('resourceId', e.target.value)}
              startAdornment={
                loadingRes ? (
                  <Box sx={{ display: 'flex', ml: 1, mr: 0.5 }}>
                    <CircularProgress size={16} />
                  </Box>
                ) : (
                  <MeetingRoomOutlined sx={{ color: 'text.secondary', fontSize: 20, ml: 1, mr: 0.5 }} />
                )
              }
            >
              {resources.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {r.resourceCode}
                        {r.buildingName && ` · ${r.buildingName}`}
                        {r.capacity && ` · ${r.capacity} seats`}
                      </Typography>
                    </Box>
                    <Chip
                      label={CATEGORY_LABELS[r.category] || r.category}
                      size="small"
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.resourceId && (
              <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'block' }}>
                {errors.resourceId}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Selected resource info banner */}
        {selected && (
          <Grid item xs={12}>
            <Box sx={{ p: 2, bgcolor: '#EFF4FF', borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
              <Grid container spacing={2}>
                {[
                  { label: 'Approval',    value: selected.approvalAuthority?.replace('_', ' ') },
                  { label: 'Min Advance', value: `${selected.minAdvanceDays} day(s)` },
                  { label: 'Max Hours',   value: `${selected.maxBookingHours} hr/booking` },
                  { label: 'Buffer',      value: selected.bufferDaysBefore > 0 || selected.bufferDaysAfter > 0
                      ? `${selected.bufferDaysBefore}d before · ${selected.bufferDaysAfter}d after`
                      : 'None' },
                  selected.availableFrom && { label: 'Available', value: `${selected.availableFrom} – ${selected.availableTo}` },
                ].filter(Boolean).map((item) => (
                  <Grid item xs={6} sm={3} key={item.label}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', display: 'block' }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        )}

        {/* Date */}
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth required label="Booking Date" type="date"
            value={bookingDate || ''}
            onChange={(e) => handleChange('bookingDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: minDateStr }}
            error={!!errors.bookingDate}
            helperText={errors.bookingDate}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, display: 'flex', color: 'text.secondary' }}>
                  <CalendarMonthRounded sx={{ fontSize: 20 }} />
                </Box>
              ),
            }}
          />
        </Grid>

        {/* Start time */}
        <Grid item xs={6} sm={4}>
          <TextField
            fullWidth required label="Start Time" type="time"
            value={startTime || ''}
            onChange={(e) => handleChange('startTime', e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.startTime}
            helperText={errors.startTime}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, display: 'flex', color: 'text.secondary' }}>
                  <AccessTimeRounded sx={{ fontSize: 20 }} />
                </Box>
              ),
            }}
          />
        </Grid>

        {/* End time */}
        <Grid item xs={6} sm={4}>
          <TextField
            fullWidth required label="End Time" type="time"
            value={endTime || ''}
            onChange={(e) => handleChange('endTime', e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.endTime}
            helperText={errors.endTime || (selected && startTime && endTime
              ? (() => {
                  const [sh, sm] = startTime.split(':').map(Number);
                  const [eh, em] = endTime.split(':').map(Number);
                  const mins = (eh * 60 + em) - (sh * 60 + sm);
                  return mins > 0 ? `Duration: ${Math.floor(mins / 60)}h ${mins % 60}m` : '';
                })()
              : '')}
          />
        </Grid>

        {/* Availability status */}
        {resourceId && bookingDate && (
          <Grid item xs={12}>
            {checkingAvail ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Checking availability…
                </Typography>
              </Box>
            ) : availability ? (
              <Box>
                {availability.available ? (
                  <Alert
                    icon={<CheckCircleOutlineRounded fontSize="small" />}
                    severity="success" sx={{ py: 0.75 }}
                  >
                    Resource is available on {bookingDate}
                  </Alert>
                ) : (
                  <Alert
                    icon={<ErrorOutlineRounded fontSize="small" />}
                    severity="error" sx={{ py: 0.75 }}
                  >
                    {availability.unavailableReason || 'Resource is not available on this date.'}
                    {availability.earliestBookableDate && (
                      <> Earliest bookable: <strong>{availability.earliestBookableDate}</strong></>
                    )}
                  </Alert>
                )}

                {availability.bookedSlots?.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Already booked on this day
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
                      {availability.bookedSlots.map((slot, i) => (
                        <Chip
                          key={i}
                          label={`${slot.startTime} – ${slot.endTime}`}
                          size="small" color="error" variant="outlined"
                          sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            ) : null}
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
