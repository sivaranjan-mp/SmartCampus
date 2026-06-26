import {
  Alert, Box, Button, Chip, CircularProgress, Divider, FormControl,
  Grid, InputAdornment, InputLabel, MenuItem, Paper, Select, Step,
  StepLabel, Stepper, TextField, Typography,
} from '@mui/material';
import {
  AssignmentOutlined, CalendarMonthOutlined, CheckCircleRounded,
  GroupsOutlined, PeopleAltOutlined, SchoolRounded, UploadFileOutlined,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../api/bookingApi';
import { BOOKING_STEPS, EVENT_DOMAINS } from '../../utils/bookingConstants';
import { getDashboardPath, ROLE_LABELS } from '../../utils/roleUtils';
import ResourcePicker from '../../components/booking/ResourcePicker';
import DynamicListField from '../../components/booking/DynamicListField';
import PeoplePicker from '../../components/booking/PeoplePicker';
import FileUploadField from '../../components/booking/FileUploadField';
import Navbar from '../../components/Navbar';

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, label }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, mt: 0.5 }}>
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', fontSize: '0.75rem', color: 'text.secondary' }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider', ml: 1 }} />
    </Box>
  );
}

// ─── Initial form state ────────────────────────────────────────────────────────
const INIT = {
  // Step 1 – Resource & Schedule
  resourceId:   null,
  bookingDate:  '',
  startTime:    '',
  endTime:      '',

  // Step 2 – Event Details
  eventName:         '',
  eventDomain:       '',
  participantsCount: '',
  objectives:        ['', '', ''],
  outcomes:          ['', '', ''],
  remarks:           '',

  // Step 3 – Team
  coordinators:    [],
  supportingFaculty: [],

  // Step 4 – Documents
  permissionLetterFileId:    '',
  permissionLetterFileName:  '',
  facultySupportLetterFileId:'',
  facultySupportLetterFileName:'',
  posterFileId:              '',
  posterFileName:            '',
};

export default function BookingFormPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [step,      setStep]      = useState(0);
  const [form,      setForm]      = useState(INIT);
  const [errors,    setErrors]    = useState({});
  const [apiError,  setApiError]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(null); // BookingResponse

  // ── Field helpers ───────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleResourceChange = (val) => {
    setForm((p) => ({ ...p, ...val }));
    setErrors((p) => ({ ...p, resourceId: '', bookingDate: '', startTime: '', endTime: '' }));
  };

  // ── Per-step validation ─────────────────────────────────────────────────
  const validateStep = () => {
    const errs = {};

    if (step === 0) {
      if (!form.resourceId)   errs.resourceId  = 'Please select a resource.';
      if (!form.bookingDate)  errs.bookingDate  = 'Booking date is required.';
      else {
        const today   = new Date(); today.setHours(0,0,0,0);
        const picked  = new Date(form.bookingDate);
        const minDays = user?.role === 'STUDENT' ? 3 : 1;
        const minDate = new Date(today); minDate.setDate(today.getDate() + minDays);
        if (picked < minDate)
          errs.bookingDate = `Booking must be at least ${minDays} day(s) in advance (earliest: ${minDate.toLocaleDateString('en-IN')}).`;
      }
      if (!form.startTime)    errs.startTime   = 'Start time is required.';
      if (!form.endTime)      errs.endTime     = 'End time is required.';
      if (form.startTime && form.endTime && form.startTime >= form.endTime)
        errs.endTime = 'End time must be after start time.';
    }

    if (step === 1) {
      if (!form.eventName.trim() || form.eventName.length < 3)
        errs.eventName = 'Event name must be at least 3 characters.';
      if (!form.eventDomain)
        errs.eventDomain = 'Event domain is required.';
      if (!form.participantsCount || Number(form.participantsCount) < 1)
        errs.participantsCount = 'Participants count must be at least 1.';

      const filledObj = form.objectives.filter((o) => o.trim().length >= 10);
      if (filledObj.length < 3)
        errs.objectives = 'Please enter at least 3 objectives (min 10 characters each).';

      const filledOut = form.outcomes.filter((o) => o.trim().length >= 10);
      if (filledOut.length < 3)
        errs.outcomes = 'Please enter at least 3 outcomes (min 10 characters each).';
    }

    if (step === 2) {
      if (form.coordinators.length < 2)
        errs.coordinators = 'Please add at least 2 coordinators.';
      if (form.supportingFaculty.length < 1)
        errs.supportingFaculty = 'Please add at least 1 supporting faculty member.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep((s) => s + 1); };
  const handleBack = () => { setStep((s) => s - 1); setApiError(''); };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setApiError('');

    const payload = {
      resourceId:        Number(form.resourceId),
      bookingDate:       form.bookingDate,
      startTime:         form.startTime + ':00',
      endTime:           form.endTime   + ':00',
      eventName:         form.eventName.trim(),
      eventDomain:       form.eventDomain,
      participantsCount: Number(form.participantsCount),
      remarks:           form.remarks || undefined,
      objectives:        form.objectives.filter((o) => o.trim()).map((d) => ({ description: d.trim() })),
      outcomes:          form.outcomes.filter((o) => o.trim()).map((d) => ({ description: d.trim() })),
      coordinators:      form.coordinators,
      supportingFaculty: form.supportingFaculty,
      permissionLetterFileId:     form.permissionLetterFileId     || undefined,
      facultySupportLetterFileId: form.facultySupportLetterFileId || undefined,
      posterFileId:               form.posterFileId               || undefined,
    };

    try {
      const { data } = await bookingApi.create(payload);
      if (data.success) {
        setSubmitted(data.data);
        toast.success('Booking submitted successfully!');
      }
    } catch (err) {
      const apiErr = err.response?.data;
      if (apiErr?.data && typeof apiErr.data === 'object') {
        setErrors(apiErr.data);
        // Jump to first step with error
        const step1Fields = ['resourceId','bookingDate','startTime','endTime'];
        const step2Fields = ['eventName','eventDomain','participantsCount','objectives','outcomes'];
        const step3Fields = ['coordinators','supportingFaculty'];
        const first = Object.keys(apiErr.data)[0];
        if (step1Fields.includes(first)) setStep(0);
        else if (step2Fields.includes(first)) setStep(1);
        else if (step3Fields.includes(first)) setStep(2);
      } else {
        setApiError(apiErr?.message || 'Submission failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
        <Paper elevation={0} sx={{ maxWidth: 520, width: '100%', p: 4, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#E8F5E9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
            <CheckCircleRounded sx={{ fontSize: 44, color: 'success.main' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Booking Submitted!</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Your booking request has been submitted and is pending approval.
          </Typography>

          <Box sx={{ bgcolor: '#F8FAFF', borderRadius: 2, p: 2.5, mb: 3, textAlign: 'left' }}>
            <Grid container spacing={1.5}>
              {[
                { label: 'Reference',  value: submitted.bookingReference },
                { label: 'Event',      value: submitted.eventName },
                { label: 'Resource',   value: submitted.resourceName },
                { label: 'Date',       value: submitted.bookingDate },
                { label: 'Time',       value: `${submitted.startTime} – ${submitted.endTime}` },
                { label: 'Status',     value: submitted.status?.replace('_', ' ') },
              ].map((row) => (
                <Grid item xs={6} key={row.label}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block' }}>
                    {row.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.value}</Typography>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={() => navigate(getDashboardPath(user?.role))}>
              Go to Dashboard
            </Button>
            <Button variant="contained" onClick={() => navigate('/bookings/my')}>
              My Bookings
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // ── Step content ────────────────────────────────────────────────────────
  const stepContent = [
    /* Step 0: Resource & Schedule */
    <Box key="step0">
      <SectionHeader icon={<CalendarMonthOutlined />} label="Resource & Schedule" />
      <ResourcePicker
        value={{ resourceId: form.resourceId, bookingDate: form.bookingDate, startTime: form.startTime, endTime: form.endTime }}
        onChange={handleResourceChange}
        errors={errors}
      />
    </Box>,

    /* Step 1: Event Details */
    <Box key="step1">
      <SectionHeader icon={<AssignmentOutlined />} label="Event Details" />
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={8}>
          <TextField fullWidth required label="Event Name" name="eventName"
            value={form.eventName} onChange={handleChange}
            error={!!errors.eventName} helperText={errors.eventName}
            placeholder="e.g. Annual Tech Symposium 2025" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required error={!!errors.eventDomain}>
            <InputLabel>Event Domain</InputLabel>
            <Select name="eventDomain" value={form.eventDomain} label="Event Domain" onChange={handleChange}>
              {EVENT_DOMAINS.map((d) => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
            </Select>
            {errors.eventDomain && (
              <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'block' }}>
                {errors.eventDomain}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth required label="Expected Participants" name="participantsCount"
            type="number" value={form.participantsCount} onChange={handleChange}
            error={!!errors.participantsCount} helperText={errors.participantsCount || 'Total head count'}
            inputProps={{ min: 1, max: 5000 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><PeopleAltOutlined sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment> }} />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DynamicListField
            label="Objectives"
            items={form.objectives}
            onChange={(val) => { setForm((p) => ({ ...p, objectives: val })); setErrors((p) => ({ ...p, objectives: '' })); }}
            min={3} max={5}
            placeholder="Enter an objective"
            error={!!errors.objectives}
            helperText={errors.objectives}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DynamicListField
            label="Outcomes"
            items={form.outcomes}
            onChange={(val) => { setForm((p) => ({ ...p, outcomes: val })); setErrors((p) => ({ ...p, outcomes: '' })); }}
            min={3} max={5}
            placeholder="Enter an expected outcome"
            error={!!errors.outcomes}
            helperText={errors.outcomes}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth multiline rows={3} label="Remarks (Optional)" name="remarks"
            value={form.remarks} onChange={handleChange}
            placeholder="Any additional notes or special requirements…"
            inputProps={{ maxLength: 1000 }}
            helperText={`${form.remarks.length} / 1000`} />
        </Grid>
      </Grid>
    </Box>,

    /* Step 2: Team */
    <Box key="step2">
      <SectionHeader icon={<GroupsOutlined />} label="Event Team" />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PeoplePicker
            label="Coordinators"
            people={form.coordinators}
            onChange={(val) => { setForm((p) => ({ ...p, coordinators: val })); setErrors((p) => ({ ...p, coordinators: '' })); }}
            min={2} max={8}
            mode="coordinator"
            error={!!errors.coordinators}
            helperText={errors.coordinators}
          />
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <PeoplePicker
            label="Supporting Faculty"
            people={form.supportingFaculty}
            onChange={(val) => { setForm((p) => ({ ...p, supportingFaculty: val })); setErrors((p) => ({ ...p, supportingFaculty: '' })); }}
            min={1} max={4}
            mode="faculty"
            error={!!errors.supportingFaculty}
            helperText={errors.supportingFaculty}
          />
        </Grid>
      </Grid>
    </Box>,

    /* Step 3: Documents & Review */
    <Box key="step3">
      <SectionHeader icon={<UploadFileOutlined />} label="Supporting Documents" />
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <FileUploadField
            label="Permission Letter"
            required
            fileId={form.permissionLetterFileId}
            fileName={form.permissionLetterFileName}
            onUploadComplete={(id, name) => setForm((p) => ({ ...p, permissionLetterFileId: id, permissionLetterFileName: name }))}
            onRemove={() => setForm((p) => ({ ...p, permissionLetterFileId: '', permissionLetterFileName: '' }))}
            error={!!errors.permissionLetterFileId}
            helperText={errors.permissionLetterFileId}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FileUploadField
            label="Faculty Support Letter"
            required
            fileId={form.facultySupportLetterFileId}
            fileName={form.facultySupportLetterFileName}
            onUploadComplete={(id, name) => setForm((p) => ({ ...p, facultySupportLetterFileId: id, facultySupportLetterFileName: name }))}
            onRemove={() => setForm((p) => ({ ...p, facultySupportLetterFileId: '', facultySupportLetterFileName: '' }))}
            error={!!errors.facultySupportLetterFileId}
            helperText={errors.facultySupportLetterFileId}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FileUploadField
            label="Event Poster"
            fileId={form.posterFileId}
            fileName={form.posterFileName}
            onUploadComplete={(id, name) => setForm((p) => ({ ...p, posterFileId: id, posterFileName: name }))}
            onRemove={() => setForm((p) => ({ ...p, posterFileId: '', posterFileName: '' }))}
          />
        </Grid>
      </Grid>

      {/* Booking Summary Review */}
      <SectionHeader icon={<AssignmentOutlined />} label="Review Your Booking" />
      <Box sx={{ bgcolor: '#F8FAFF', borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 2.5 }}>
        <Grid container spacing={2}>
          {[
            { label: 'Event Name',    value: form.eventName      || '—' },
            { label: 'Domain',        value: EVENT_DOMAINS.find((d) => d.value === form.eventDomain)?.label || '—' },
            { label: 'Booking Date',  value: form.bookingDate    || '—' },
            { label: 'Time',          value: form.startTime && form.endTime ? `${form.startTime} – ${form.endTime}` : '—' },
            { label: 'Participants',  value: form.participantsCount || '—' },
            { label: 'Organizer',     value: user?.fullName      || '—' },
            { label: 'Role',          value: ROLE_LABELS[user?.role] || user?.role },
            { label: 'Department',    value: user?.departmentName || '—' },
            { label: 'Coordinators',  value: `${form.coordinators.length} added` },
            { label: 'Fac. Support',  value: `${form.supportingFaculty.length} added` },
            { label: 'Objectives',    value: `${form.objectives.filter((o) => o.trim()).length} entered` },
            { label: 'Outcomes',      value: `${form.outcomes.filter((o) => o.trim()).length} entered` },
          ].map((row) => (
            <Grid item xs={6} sm={4} key={row.label}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', display: 'block' }}>
                {row.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {row.value}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>,
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      {/* Top banner */}
      <Box sx={{ background: 'linear-gradient(135deg,#1565C0,#0D47A1)', px: { xs: 2, sm: 4 }, pt: { xs: 10, sm: 12 }, pb: 3 }}>
        <Box sx={{ maxWidth: 860, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <SchoolRounded sx={{ color: 'white', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>SmartCampus</Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'white' }}>
            New Booking Request
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
            Fill in all required details to submit your resource booking request
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 860, mx: 'auto', px: { xs: 2, sm: 3 }, py: 4 }}>
        {/* Stepper */}
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
          {BOOKING_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.75rem', fontWeight: 500 }, '& .MuiStepLabel-label.Mui-active': { fontWeight: 700 } }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Organizer info banner */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#EFF4FF', borderRadius: 2, border: '1px solid', borderColor: 'primary.light', mb: 3 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>
              {user?.fullName?.[0]?.toUpperCase()}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {user?.fullName}
              <Chip label={ROLE_LABELS[user?.role] || user?.role} size="small"
                color="primary" sx={{ ml: 1, height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user?.email} {user?.departmentName && `· ${user.departmentName}`}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', display: 'block' }}>
              Organizer
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>Auto-filled</Typography>
          </Box>
        </Box>

        {/* API Error */}
        {apiError && <Alert severity="error" sx={{ mb: 2.5 }}>{apiError}</Alert>}

        {/* Form content */}
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, border: '1px solid', borderColor: 'divider', mb: 3 }}>
          {stepContent[step]}
        </Paper>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button variant="outlined" onClick={handleBack} disabled={step === 0 || loading} sx={{ minWidth: 100 }}>
            Back
          </Button>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Step {step + 1} of {BOOKING_STEPS.length}
          </Typography>
          {step < BOOKING_STEPS.length - 1 ? (
            <Button variant="contained" onClick={handleNext} sx={{ minWidth: 130 }}>
              Continue
            </Button>
          ) : (
            <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={{ minWidth: 160 }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Submit Booking'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
