import {
  Alert, Box, Button, CircularProgress, Collapse, FormControl,
  FormHelperText, Grid, IconButton, InputAdornment, InputLabel,
  LinearProgress, MenuItem, Paper, Select, Step, StepLabel,
  Stepper, TextField, Typography,
} from '@mui/material';
import {
  BadgeOutlined, CheckCircleRounded, EmailOutlined, InfoOutlined,
  LockOutlined, PersonOutlined, PhoneOutlined, SchoolRounded,
  Visibility, VisibilityOff,
} from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../layouts/AuthLayout';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENTS, YEAR_OF_STUDY_OPTIONS } from '../../utils/roleUtils';
import { calculateGraduationYear } from '../../utils/dateUtils';
import { getPasswordStrength, validatePassword, validateRegisterNumberFormat } from '../../utils/validationUtils';
import useDebounce from '../../hooks/useDebounce';

const STEPS = ['Personal Info', 'Academic Details', 'Set Password'];

const INITIAL_FORM = {
  fullName: '', email: '', phoneNumber: '',
  role: 'STUDENT', departmentName: '', registerNumber: '', yearOfStudy: '',
  password: '', confirmPassword: '',
};

export default function RegisterPage() {
  const navigate  = useNavigate();
  const { saveSession } = useAuth();

  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState(INITIAL_FORM);
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [apiError, setApiError]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showCpw, setShowCpw]     = useState(false);

  // Register-number live validation state
  const [rnStatus, setRnStatus]   = useState(null); // { valid, available, message, joinYear }
  const [rnChecking, setRnChecking] = useState(false);
  const debouncedRn = useDebounce(form.registerNumber, 600);

  // Computed graduation year preview
  const graduationYear = form.role === 'STUDENT' && form.yearOfStudy
    ? calculateGraduationYear(Number(form.yearOfStudy))
    : null;

  // ── Live register-number check ───────────────────────────────────────────
  useEffect(() => {
    if (form.role !== 'STUDENT' || !debouncedRn) { setRnStatus(null); return; }
    const fmtError = validateRegisterNumberFormat(debouncedRn);
    if (fmtError) { setRnStatus({ valid: false, message: fmtError }); return; }

    setRnChecking(true);
    authApi.validateRegisterNumber(debouncedRn)
      .then(({ data }) => {
        if (data.success) setRnStatus(data.data);
      })
      .catch(() => {})
      .finally(() => setRnChecking(false));
  }, [debouncedRn, form.role]);

  // ── Field change ──────────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
    if (apiError) setApiError('');
  }, [apiError]);

  // ── Per-step validation ───────────────────────────────────────────────────
  const validateStep = () => {
    const errs = {};

    if (step === 0) {
      if (!form.fullName.trim() || form.fullName.length < 2) errs.fullName = 'Full name must be at least 2 characters.';
      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
      if (form.phoneNumber && !/^[0-9]{10}$/.test(form.phoneNumber)) errs.phoneNumber = 'Must be exactly 10 digits.';
    }

    if (step === 1) {
      if (!form.departmentName) errs.departmentName = 'Please select your department.';
      if (form.role === 'STUDENT') {
        if (!form.registerNumber.trim()) errs.registerNumber = 'Register number is required.';
        else if (rnStatus && !rnStatus.valid) errs.registerNumber = rnStatus.message;
        else if (rnStatus && !rnStatus.available) errs.registerNumber = 'This register number is already in use.';
        if (!form.yearOfStudy) errs.yearOfStudy = 'Please select your year of study.';
      }
    }

    if (step === 2) {
      const pwErr = validatePassword(form.password);
      if (pwErr) errs.password = pwErr;
      if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
      else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep((s) => s + 1); };
  const handleBack = () => { setStep((s) => s - 1); setApiError(''); };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setApiError('');

    const payload = {
      fullName:      form.fullName.trim(),
      email:         form.email.trim().toLowerCase(),
      phoneNumber:   form.phoneNumber || undefined,
      role:          form.role,
      departmentName: form.departmentName,
      registerNumber: form.role === 'STUDENT' ? form.registerNumber.toUpperCase().trim() : undefined,
      yearOfStudy:   form.role === 'STUDENT' ? Number(form.yearOfStudy) : undefined,
      password:      form.password,
    };

    try {
      const { data } = await authApi.register(payload);
      if (data.success) {
        toast.success('Registration successful! Please check your email for the OTP.');
        navigate('/verify-otp', { state: { email: payload.email } });
      }
    } catch (err) {
      const apiErr = err.response?.data;
      if (apiErr?.data && typeof apiErr.data === 'object') {
        setErrors(apiErr.data);
        // Jump to the first step that has errors
        const firstErrField = Object.keys(apiErr.data)[0];
        const step0Fields = ['fullName','email','phoneNumber'];
        const step1Fields = ['role','departmentName','registerNumber','yearOfStudy'];
        if (step0Fields.includes(firstErrField)) setStep(0);
        else if (step1Fields.includes(firstErrField)) setStep(1);
      } else {
        setApiError(apiErr?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Password strength ─────────────────────────────────────────────────────
  const pwStrength = getPasswordStrength(form.password);

  // ── Step content ──────────────────────────────────────────────────────────
  const stepContent = [
    /* STEP 0 – Personal Info */
    <Grid container spacing={2.5} key="step0">
      <Grid item xs={12}>
        <TextField fullWidth label="Full Name" name="fullName" value={form.fullName}
          onChange={handleChange} error={!!errors.fullName} helperText={errors.fullName}
          autoFocus placeholder="e.g. Arjun Ramesh Kumar"
          InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined sx={{ color:'text.secondary', fontSize:20 }} /></InputAdornment> }} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth label="Email Address" name="email" type="email" value={form.email}
          onChange={handleChange} error={!!errors.email} helperText={errors.email}
          placeholder="your.email@college.edu"
          InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color:'text.secondary', fontSize:20 }} /></InputAdornment> }} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth label="Phone Number (Optional)" name="phoneNumber" value={form.phoneNumber}
          onChange={handleChange} error={!!errors.phoneNumber}
          helperText={errors.phoneNumber || '10-digit mobile number'}
          inputProps={{ maxLength: 10 }} placeholder="9876543210"
          InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlined sx={{ color:'text.secondary', fontSize:20 }} /></InputAdornment> }} />
      </Grid>
    </Grid>,

    /* STEP 1 – Academic Details */
    <Grid container spacing={2.5} key="step1">
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>I am a</InputLabel>
          <Select name="role" value={form.role} label="I am a" onChange={handleChange}>
            <MenuItem value="STUDENT">Student</MenuItem>
            <MenuItem value="FACULTY">Faculty</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.departmentName}>
          <InputLabel>Department</InputLabel>
          <Select name="departmentName" value={form.departmentName} label="Department" onChange={handleChange}>
            {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
          {errors.departmentName && <FormHelperText>{errors.departmentName}</FormHelperText>}
        </FormControl>
      </Grid>

      {form.role === 'STUDENT' && (
        <>
          <Grid item xs={12} sm={7}>
            <TextField
              fullWidth label="Register Number" name="registerNumber"
              value={form.registerNumber} onChange={handleChange}
              error={!!errors.registerNumber || (rnStatus && !rnStatus.valid)}
              helperText={
                errors.registerNumber ||
                (rnChecking ? 'Checking…' : null) ||
                (rnStatus && !rnStatus.valid ? rnStatus.message : null) ||
                (rnStatus?.valid && rnStatus?.available ? null : null) ||
                'e.g. 22CSE001, 23AIDS045'
              }
              placeholder="22CSE001"
              inputProps={{ style: { textTransform: 'uppercase' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlined sx={{ color:'text.secondary', fontSize:20 }} />
                  </InputAdornment>
                ),
                endAdornment: rnChecking ? (
                  <InputAdornment position="end">
                    <CircularProgress size={16} />
                  </InputAdornment>
                ) : rnStatus?.valid && rnStatus?.available ? (
                  <InputAdornment position="end">
                    <CheckCircleRounded sx={{ color:'success.main', fontSize:20 }} />
                  </InputAdornment>
                ) : null,
              }}
            />
            {/* Available confirmation */}
            {rnStatus?.valid && rnStatus?.available && !rnChecking && (
              <Typography variant="caption" sx={{ color:'success.main', fontWeight:600, mt:0.5, display:'block' }}>
                ✓ Register number is valid and available
              </Typography>
            )}
            {rnStatus?.valid && !rnStatus?.available && !rnChecking && (
              <Typography variant="caption" sx={{ color:'error.main', fontWeight:600, mt:0.5, display:'block' }}>
                ✗ This register number is already registered
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={5}>
            <FormControl fullWidth error={!!errors.yearOfStudy}>
              <InputLabel>Year of Study</InputLabel>
              <Select name="yearOfStudy" value={form.yearOfStudy} label="Year of Study" onChange={handleChange}>
                {YEAR_OF_STUDY_OPTIONS.map((y) => (
                  <MenuItem key={y.value} value={y.value}>{y.label}</MenuItem>
                ))}
              </Select>
              {errors.yearOfStudy && <FormHelperText>{errors.yearOfStudy}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Graduation Year Preview */}
          <Collapse in={Boolean(graduationYear)} style={{ width: '100%' }}>
            <Grid item xs={12} sx={{ px: 1 }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:1.5, px:2, py:1.5, borderRadius:2, backgroundColor:'primary.50', border:'1px solid', borderColor:'primary.100', bgcolor:'#EFF4FF' }}>
                <InfoOutlined sx={{ color:'primary.main', fontSize:18, flexShrink:0 }} />
                <Box>
                  <Typography variant="caption" sx={{ color:'text.secondary', display:'block' }}>
                    Expected Graduation Year
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color:'primary.main', fontWeight:700 }}>
                    Class of {graduationYear}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Collapse>
        </>
      )}
    </Grid>,

    /* STEP 2 – Password */
    <Grid container spacing={2.5} key="step2">
      <Grid item xs={12}>
        <TextField
          fullWidth label="Password" name="password"
          type={showPw ? 'text' : 'password'}
          value={form.password} onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password || 'Min 8 chars with uppercase, lowercase, number & special character'}
          InputProps={{
            startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color:'text.secondary', fontSize:20 }} /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPw((p) => !p)} edge="end" size="small">
                  {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {/* Password strength bar */}
        {form.password && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={(pwStrength.score / 5) * 100}
              sx={{ '& .MuiLinearProgress-bar': { bgcolor: pwStrength.color || '#ccc' } }}
            />
            {pwStrength.label && (
              <Typography variant="caption" sx={{ color: pwStrength.color, fontWeight: 600, mt: 0.5, display: 'block' }}>
                Password strength: {pwStrength.label}
              </Typography>
            )}
          </Box>
        )}
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth label="Confirm Password" name="confirmPassword"
          type={showCpw ? 'text' : 'password'}
          value={form.confirmPassword} onChange={handleChange}
          error={!!errors.confirmPassword} helperText={errors.confirmPassword}
          InputProps={{
            startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color:'text.secondary', fontSize:20 }} /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowCpw((p) => !p)} edge="end" size="small">
                  {showCpw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </Grid>,
  ];

  return (
    <AuthLayout>
      <Paper
        elevation={0}
        sx={{
          width: '100%', maxWidth: 480,
          p: { xs: 3, sm: 4 },
          border: '1px solid', borderColor: 'divider',
          boxShadow: '0 8px 40px rgba(21,101,192,0.10)',
        }}
      >
        {/* Header */}
        <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:3.5 }}>
          <Box sx={{ width:40, height:40, borderRadius:2, background:'linear-gradient(135deg,#1565C0,#0D47A1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <SchoolRounded sx={{ color:'white', fontSize:22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight:800, color:'primary.main', lineHeight:1.2 }}>Create Account</Typography>
            <Typography variant="caption" sx={{ color:'text.secondary' }}>SmartCampus Registration</Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 3.5 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': { fontSize:'0.72rem', fontWeight:500 },
                  '& .MuiStepLabel-label.Mui-active': { fontWeight:700 },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* API Error */}
        {apiError && (
          <Alert severity="error" sx={{ mb: 2.5 }}>{apiError}</Alert>
        )}

        {/* Step content */}
        <Box sx={{ mb: 3 }}>{stepContent[step]}</Box>

        {/* Navigation */}
        <Box sx={{ display:'flex', gap:1.5 }}>
          {step > 0 && (
            <Button variant="outlined" onClick={handleBack} disabled={loading} sx={{ flex:1 }}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button variant="contained" onClick={handleNext} sx={{ flex:1 }}>
              Continue
            </Button>
          ) : (
            <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={{ flex:1 }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
            </Button>
          )}
        </Box>

        <Typography variant="body2" sx={{ mt: 3, textAlign:'center', color:'text.secondary' }}>
          Already have an account?{' '}
          <Box component={Link} to="/login" sx={{ color:'primary.main', fontWeight:700, textDecoration:'none', '&:hover':{ textDecoration:'underline' } }}>
            Sign in
          </Box>
        </Typography>
      </Paper>
    </AuthLayout>
  );
}
