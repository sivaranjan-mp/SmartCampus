import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ApartmentOutlined,
  AssignmentTurnedInOutlined,
  BuildOutlined,
  CalendarMonthOutlined,
  CloseRounded,
  EventAvailableOutlined,
  InfoOutlined,
  MeetingRoomOutlined,
  PeopleOutlined,
  PlaceOutlined,
  ScheduleOutlined,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import {
  APPROVAL_LABELS,
  CATEGORY_LABELS,
  DAY_OPTIONS,
  DEFAULT_AVAILABLE_DAYS,
  RESOURCE_CATEGORIES,
  SCOPE_LABELS,
} from '../../utils/resourceConstants';
import { resourceApi } from '../../api/resourceApi';

// ─── Form default values ───────────────────────────────────────────────────────
const DEFAULTS = {
  name:              '',
  resourceCode:      '',
  category:          'LAB',
  scope:             'COMMON',
  departmentOwnerId: '',
  approvalAuthority: 'ADMIN',
  capacity:          '',
  location:          '',
  floorNumber:       '',
  buildingName:      '',
  availableFrom:     '08:00',
  availableTo:       '18:00',
  availableDays:     DEFAULT_AVAILABLE_DAYS,
  minAdvanceDays:    1,
  maxAdvanceDays:    30,
  maxBookingHours:   4,
  bufferDaysBefore:  0,
  bufferDaysAfter:   0,
  description:       '',
  amenities:         '',
  imageUrl:          '',
};

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, label }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 1 }}>
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider', ml: 1 }} />
    </Box>
  );
}

// ─── Numeric stepper field ─────────────────────────────────────────────────────
function NumericField({ label, name, value, onChange, min = 0, max = 999, helperText, error }) {
  return (
    <TextField
      fullWidth size="small" type="number" label={label} name={name}
      value={value} onChange={onChange}
      error={error} helperText={helperText}
      inputProps={{ min, max, style: { textAlign: 'center' } }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconButton size="small" onClick={() => onChange({ target: { name, value: Math.max(min, Number(value) - 1) } })}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1 }}>−</Typography>
            </IconButton>
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => onChange({ target: { name, value: Math.min(max, Number(value) + 1) } })}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1 }}>+</Typography>
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ResourceFormDialog({ open, onClose, onSuccess, editTarget }) {
  const isEdit = Boolean(editTarget);

  const [form,        setForm]        = useState(DEFAULTS);
  const [errors,      setErrors]      = useState({});
  const [apiError,    setApiError]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [departments, setDepartments] = useState([]);

  // ── Seed form when editing ───────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (editTarget) {
      setForm({
        name:              editTarget.name              ?? '',
        resourceCode:      editTarget.resourceCode      ?? '',
        category:          editTarget.category          ?? 'LAB',
        scope:             editTarget.scope             ?? 'COMMON',
        departmentOwnerId: editTarget.departmentOwnerId ?? '',
        approvalAuthority: editTarget.approvalAuthority ?? 'ADMIN',
        capacity:          editTarget.capacity          ?? '',
        location:          editTarget.location          ?? '',
        floorNumber:       editTarget.floorNumber       ?? '',
        buildingName:      editTarget.buildingName      ?? '',
        availableFrom:     editTarget.availableFrom     ?? '08:00',
        availableTo:       editTarget.availableTo       ?? '18:00',
        availableDays:     editTarget.availableDays     ?? DEFAULT_AVAILABLE_DAYS,
        minAdvanceDays:    editTarget.minAdvanceDays    ?? 1,
        maxAdvanceDays:    editTarget.maxAdvanceDays    ?? 30,
        maxBookingHours:   editTarget.maxBookingHours   ?? 4,
        bufferDaysBefore:  editTarget.bufferDaysBefore  ?? 0,
        bufferDaysAfter:   editTarget.bufferDaysAfter   ?? 0,
        description:       editTarget.description       ?? '',
        amenities:         editTarget.amenities         ?? '',
        imageUrl:          editTarget.imageUrl          ?? '',
      });
    } else {
      setForm(DEFAULTS);
    }
    setErrors({});
    setApiError('');
  }, [open, editTarget]);

  // ── Load active departments ──────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    adminApi.getActiveDepartments()
      .then(({ data }) => { if (data.success) setDepartments(data.data); })
      .catch(() => {});
  }, [open]);

  // ── Auto-set approval authority from scope ───────────────────────────────
  useEffect(() => {
    if (form.scope === 'COMMON')     setForm((p) => ({ ...p, approvalAuthority: 'ADMIN', departmentOwnerId: '' }));
    if (form.scope === 'DEPARTMENT') setForm((p) => ({ ...p, approvalAuthority: 'HOD' }));
  }, [form.scope]);

  // ── Auto-suggest resource code ───────────────────────────────────────────
  useEffect(() => {
    if (isEdit || form.resourceCode) return;
    if (form.name.trim().length < 3) return;
    const words   = form.name.trim().toUpperCase().split(/\s+/);
    const abbr    = words.map((w) => w[0]).join('').slice(0, 6);
    const randNum = String(Math.floor(Math.random() * 900) + 100);
    setForm((p) => ({ ...p, resourceCode: `${abbr}-${randNum}` }));
  }, [form.name, isEdit]);

  // ── Field handlers ───────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleDaysChange = (_, newDays) => {
    if (!newDays || newDays.length === 0) return;
    setForm((p) => ({ ...p, availableDays: newDays.join(',') }));
  };

  const selectedDays = form.availableDays ? form.availableDays.split(',').map((d) => d.trim()) : [];

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.length < 2)   errs.name         = 'Resource name must be at least 2 characters.';
    if (!form.resourceCode.trim())                    errs.resourceCode  = 'Resource code is required.';
    else if (!/^[A-Z0-9][A-Z0-9_-]{1,29}$/i.test(form.resourceCode.trim()))
      errs.resourceCode = 'Code must start with a letter/digit and contain only A-Z, 0-9, -, _.';
    if (!form.category)                               errs.category      = 'Category is required.';
    if (!form.scope)                                  errs.scope         = 'Scope is required.';
    if (form.scope === 'DEPARTMENT' && !form.departmentOwnerId)
      errs.departmentOwnerId = 'Department owner is required for department-scoped resources.';
    if (!form.approvalAuthority)                      errs.approvalAuthority = 'Approval authority is required.';
    if (form.capacity !== '' && (isNaN(form.capacity) || Number(form.capacity) < 1))
      errs.capacity = 'Capacity must be a positive number.';
    if (form.availableFrom && form.availableTo && form.availableFrom >= form.availableTo)
      errs.availableFrom = 'Available-from must be before available-to.';
    if (Number(form.minAdvanceDays) > Number(form.maxAdvanceDays))
      errs.minAdvanceDays = 'Min advance days cannot exceed max advance days.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError('');

    const payload = {
      name:              form.name.trim(),
      resourceCode:      form.resourceCode.trim().toUpperCase(),
      category:          form.category,
      scope:             form.scope,
      departmentOwnerId: form.departmentOwnerId ? Number(form.departmentOwnerId) : undefined,
      approvalAuthority: form.approvalAuthority,
      capacity:          form.capacity !== '' ? Number(form.capacity) : undefined,
      location:          form.location          || undefined,
      floorNumber:       form.floorNumber        || undefined,
      buildingName:      form.buildingName       || undefined,
      availableFrom:     form.availableFrom      || undefined,
      availableTo:       form.availableTo        || undefined,
      availableDays:     form.availableDays      || undefined,
      minAdvanceDays:    Number(form.minAdvanceDays),
      maxAdvanceDays:    Number(form.maxAdvanceDays),
      maxBookingHours:   Number(form.maxBookingHours),
      bufferDaysBefore:  Number(form.bufferDaysBefore),
      bufferDaysAfter:   Number(form.bufferDaysAfter),
      description:       form.description        || undefined,
      amenities:         form.amenities          || undefined,
      imageUrl:          form.imageUrl           || undefined,
    };

    try {
      const { data } = isEdit
        ? await resourceApi.update(editTarget.id, payload)
        : await resourceApi.create(payload);

      if (data.success) {
        onSuccess(data.data, isEdit ? 'updated' : 'created');
        onClose();
      }
    } catch (err) {
      const apiErr = err.response?.data;
      if (apiErr?.data && typeof apiErr.data === 'object') setErrors(apiErr.data);
      else setApiError(apiErr?.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, maxHeight: '92vh' } }}
    >
      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <DialogTitle
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MeetingRoomOutlined sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {isEdit ? 'Edit Resource' : 'Add New Resource'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {isEdit ? `Editing: ${editTarget?.name}` : 'Fill in the details below'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} disabled={loading} size="small" sx={{ color: 'text.secondary' }}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <DialogContent sx={{ px: 3, py: 2.5, overflowY: 'auto' }}>

        {apiError && <Alert severity="error" sx={{ mb: 2.5 }}>{apiError}</Alert>}

        {/* ── SECTION 1: Core Identity ────────────────────────────────────── */}
        <SectionHeader icon={<MeetingRoomOutlined fontSize="small" />} label="Resource Identity" />
        <Grid container spacing={2.5} sx={{ mb: 1 }}>

          {/* Resource Name */}
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth required label="Resource Name" name="name"
              value={form.name} onChange={handleChange}
              error={!!errors.name} helperText={errors.name || 'e.g. Computer Lab A, Main Auditorium'}
              placeholder="e.g. Computer Science Lab A"
            />
          </Grid>

          {/* Resource Code */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth required label="Resource Code" name="resourceCode"
              value={form.resourceCode} onChange={(e) => handleChange({ target: { name: 'resourceCode', value: e.target.value.toUpperCase() } })}
              error={!!errors.resourceCode} helperText={errors.resourceCode || 'Auto-suggested · editable'}
              placeholder="CSL-101"
              InputProps={{
                endAdornment: (
                  <Tooltip title="Unique identifier for bookings and timetables">
                    <InputAdornment position="end">
                      <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
                    </InputAdornment>
                  </Tooltip>
                ),
              }}
            />
          </Grid>

          {/* Category */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.category}>
              <InputLabel>Category</InputLabel>
              <Select name="category" value={form.category} label="Category" onChange={handleChange}>
                {RESOURCE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</MenuItem>
                ))}
              </Select>
              {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Scope */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.scope}>
              <InputLabel>Scope</InputLabel>
              <Select name="scope" value={form.scope} label="Scope" onChange={handleChange}>
                <MenuItem value="COMMON">Common (Shared Campus-wide)</MenuItem>
                <MenuItem value="DEPARTMENT">Department (Owned by a Dept.)</MenuItem>
              </Select>
              {errors.scope && <FormHelperText>{errors.scope}</FormHelperText>}
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* ── SECTION 2: Ownership & Approval ────────────────────────────── */}
        <SectionHeader icon={<AssignmentTurnedInOutlined fontSize="small" />} label="Ownership & Approval" />
        <Grid container spacing={2.5} sx={{ mb: 1 }}>

          {/* Department Owner */}
          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              required={form.scope === 'DEPARTMENT'}
              disabled={form.scope === 'COMMON'}
              error={!!errors.departmentOwnerId}
            >
              <InputLabel>Department Owner</InputLabel>
              <Select
                name="departmentOwnerId"
                value={form.departmentOwnerId}
                label="Department Owner"
                onChange={handleChange}
              >
                <MenuItem value=""><em>None (Common resource)</em></MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </Select>
              {errors.departmentOwnerId
                ? <FormHelperText>{errors.departmentOwnerId}</FormHelperText>
                : <FormHelperText>{form.scope === 'COMMON' ? 'Not applicable for common resources' : 'Select the owning department'}</FormHelperText>
              }
            </FormControl>
          </Grid>

          {/* Approval Authority */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.approvalAuthority}>
              <InputLabel>Approval Authority</InputLabel>
              <Select name="approvalAuthority" value={form.approvalAuthority} label="Approval Authority" onChange={handleChange}>
                {Object.entries(APPROVAL_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
              {errors.approvalAuthority
                ? <FormHelperText>{errors.approvalAuthority}</FormHelperText>
                : <FormHelperText>Who reviews and approves bookings for this resource</FormHelperText>
              }
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* ── SECTION 3: Location & Physical Details ──────────────────────── */}
        <SectionHeader icon={<PlaceOutlined fontSize="small" />} label="Location & Physical Details" />
        <Grid container spacing={2.5} sx={{ mb: 1 }}>

          {/* Capacity */}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth label="Capacity (seats)" name="capacity" type="number"
              value={form.capacity} onChange={handleChange}
              error={!!errors.capacity} helperText={errors.capacity || 'Max occupancy'}
              inputProps={{ min: 1, max: 5000 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><PeopleOutlined sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
              }}
            />
          </Grid>

          {/* Building */}
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth label="Building Name" name="buildingName"
              value={form.buildingName} onChange={handleChange}
              placeholder="e.g. Main Block, CSE Block"
            />
          </Grid>

          {/* Floor */}
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth label="Floor" name="floorNumber"
              value={form.floorNumber} onChange={handleChange}
              placeholder="G, 1, 2…"
            />
          </Grid>

          {/* Room / Location */}
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth label="Room No." name="location"
              value={form.location} onChange={handleChange}
              placeholder="101, A4…"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* ── SECTION 4: Availability ──────────────────────────────────────── */}
        <SectionHeader icon={<ScheduleOutlined fontSize="small" />} label="Availability" />
        <Grid container spacing={2.5} sx={{ mb: 1 }}>

          {/* Available From */}
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth label="Available From" name="availableFrom" type="time"
              value={form.availableFrom} onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.availableFrom} helperText={errors.availableFrom}
            />
          </Grid>

          {/* Available To */}
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth label="Available To" name="availableTo" type="time"
              value={form.availableTo} onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Available Days */}
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.75, fontWeight: 600 }}>
              Available Days
            </Typography>
            <ToggleButtonGroup
              value={selectedDays}
              onChange={handleDaysChange}
              aria-label="available days"
              size="small"
              sx={{ flexWrap: 'wrap', gap: 0.5 }}
            >
              {DAY_OPTIONS.map((d) => (
                <ToggleButton
                  key={d.value} value={d.value}
                  sx={{
                    borderRadius: '6px !important',
                    px: 1.5, py: 0.5,
                    fontSize: '0.72rem', fontWeight: 700,
                    border: '1px solid !important',
                    borderColor: 'divider !important',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main !important',
                      color: 'white !important',
                      borderColor: 'primary.main !important',
                    },
                  }}
                >
                  {d.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* ── SECTION 5: Booking Rules ─────────────────────────────────────── */}
        <SectionHeader icon={<CalendarMonthOutlined fontSize="small" />} label="Booking Rules" />
        <Grid container spacing={2.5} sx={{ mb: 1 }}>

          {/* Min Advance Days */}
          <Grid item xs={6} sm={2.4}>
            <NumericField
              label="Min Advance (days)" name="minAdvanceDays"
              value={form.minAdvanceDays} onChange={handleChange}
              min={0} max={90}
              error={!!errors.minAdvanceDays} helperText={errors.minAdvanceDays || 'Min days before booking'}
            />
          </Grid>

          {/* Max Advance Days */}
          <Grid item xs={6} sm={2.4}>
            <NumericField
              label="Max Advance (days)" name="maxAdvanceDays"
              value={form.maxAdvanceDays} onChange={handleChange}
              min={1} max={365}
              helperText="Max days ahead allowed"
            />
          </Grid>

          {/* Max Booking Hours */}
          <Grid item xs={6} sm={2.4}>
            <NumericField
              label="Max Hours/Booking" name="maxBookingHours"
              value={form.maxBookingHours} onChange={handleChange}
              min={1} max={24}
              helperText="Per single booking"
            />
          </Grid>

          {/* Buffer Days Before */}
          <Grid item xs={6} sm={2.4}>
            <NumericField
              label="Buffer Days Before" name="bufferDaysBefore"
              value={form.bufferDaysBefore} onChange={handleChange}
              min={0} max={30}
              helperText="Setup / preparation days"
            />
          </Grid>

          {/* Buffer Days After */}
          <Grid item xs={6} sm={2.4}>
            <NumericField
              label="Buffer Days After" name="bufferDaysAfter"
              value={form.bufferDaysAfter} onChange={handleChange}
              min={0} max={30}
              helperText="Teardown / cleaning days"
            />
          </Grid>

          {/* Buffer info callout */}
          {(Number(form.bufferDaysBefore) > 0 || Number(form.bufferDaysAfter) > 0) && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, px: 2, py: 1.5, bgcolor: '#EFF4FF', borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
                <InfoOutlined sx={{ color: 'primary.main', fontSize: 16, mt: 0.2, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: 'primary.dark', lineHeight: 1.6 }}>
                  Buffer days block adjacent dates around a booking — preventing back-to-back bookings
                  without preparation time. Before: <strong>{form.bufferDaysBefore}</strong> day(s) &nbsp;·&nbsp;
                  After: <strong>{form.bufferDaysAfter}</strong> day(s)
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* ── SECTION 6: Additional Info ───────────────────────────────────── */}
        <SectionHeader icon={<InfoOutlined fontSize="small" />} label="Additional Information" />
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <TextField
              fullWidth multiline rows={2} label="Description (Optional)"
              name="description" value={form.description} onChange={handleChange}
              placeholder="Briefly describe this resource, its purpose, and any important notes for users…"
              inputProps={{ maxLength: 1000 }}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth label="Amenities (Optional)" name="amenities"
              value={form.amenities} onChange={handleChange}
              placeholder="e.g. Projector, AC, Whiteboard, Internet"
              helperText="Comma-separated list of available amenities"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth label="Image URL (Optional)" name="imageUrl"
              value={form.imageUrl} onChange={handleChange}
              placeholder="https://…"
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <DialogActions
        sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1.5, justifyContent: 'flex-end' }}
      >
        <Button onClick={onClose} variant="outlined" disabled={loading} sx={{ minWidth: 100 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ minWidth: 140 }}
        >
          {loading
            ? <CircularProgress size={20} color="inherit" />
            : isEdit ? 'Save Changes' : 'Create Resource'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
