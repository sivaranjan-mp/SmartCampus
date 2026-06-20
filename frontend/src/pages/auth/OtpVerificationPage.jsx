import {
  Alert, Box, Button, CircularProgress, Paper, Typography,
} from '@mui/material';
import { CheckCircleRounded, EmailRounded, SchoolRounded } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../layouts/AuthLayout';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/roleUtils';

const OTP_LEN       = 6;
const RESEND_DELAY  = 60;

export default function OtpVerificationPage() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const { saveSession } = useAuth();

  const email = location.state?.email || '';

  const [digits, setDigits]       = useState(Array(OTP_LEN).fill(''));
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]         = useState('');
  const [countdown, setCountdown] = useState(RESEND_DELAY);
  const [verified, setVerified]   = useState(false);

  const refs = useRef([]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate('/register', { replace: true });
    else refs.current[0]?.focus();
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError('');
    if (value && index < OTP_LEN - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) refs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft'  && index > 0)           refs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LEN - 1) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN);
    const next   = [...digits];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LEN - 1);
    refs.current[focusIdx]?.focus();
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length < OTP_LEN) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.verifyOtp({ email, otp });
      if (data.success) {
        setVerified(true);
        saveSession(data.data);
        toast.success('Email verified successfully!');
        setTimeout(() => navigate(getDashboardPath(data.data.role), { replace: true }), 1600);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Please try again.';
      setError(msg);
      // Shake digits on error
      setDigits(Array(OTP_LEN).fill(''));
      setTimeout(() => refs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError('');
    try {
      await authApi.resendOtp(email);
      toast.success('A new OTP has been sent to your email.');
      setDigits(Array(OTP_LEN).fill(''));
      setCountdown(RESEND_DELAY);
      setTimeout(() => refs.current[0]?.focus(), 50);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  // Success screen
  if (verified) {
    return (
      <AuthLayout>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ width:88, height:88, borderRadius:'50%', bgcolor:'success.light', display:'inline-flex', alignItems:'center', justifyContent:'center', mb:3 }}>
            <CheckCircleRounded sx={{ fontSize:52, color:'success.main' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight:700, mb:1 }}>Verified!</Typography>
          <Typography variant="body2" sx={{ color:'text.secondary', mb:3 }}>Redirecting to your dashboard…</Typography>
          <CircularProgress size={28} />
        </Box>
      </AuthLayout>
    );
  }

  const maskedEmail = email
    ? email.replace(/(.{2})[^@]*(@.*)/, '$1***$2')
    : '';

  return (
    <AuthLayout>
      <Paper
        elevation={0}
        sx={{
          width: '100%', maxWidth: 420,
          p: { xs: 3, sm: 4.5 },
          border: '1px solid', borderColor: 'divider',
          boxShadow: '0 8px 40px rgba(21,101,192,0.10)',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <Box sx={{ width:72, height:72, borderRadius:3.5, background:'linear-gradient(135deg,#1565C0,#0D47A1)', display:'inline-flex', alignItems:'center', justifyContent:'center', mb:3, boxShadow:'0 8px 28px rgba(21,101,192,0.28)' }}>
          <EmailRounded sx={{ color:'white', fontSize:36 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight:700, mb:1 }}>Verify Your Email</Typography>
        <Typography variant="body2" sx={{ color:'text.secondary', mb:0.5 }}>
          We sent a 6-digit code to
        </Typography>
        <Typography variant="subtitle2" sx={{ color:'primary.main', fontWeight:700, mb:3 }}>
          {maskedEmail}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb:2.5, textAlign:'left' }}>{error}</Alert>
        )}

        {/* OTP Boxes */}
        <Box
          sx={{ display:'flex', gap:{ xs:1, sm:1.5 }, justifyContent:'center', mb:3 }}
          onPaste={handlePaste}
        >
          {digits.map((digit, i) => (
            <Box
              key={i}
              component="input"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              ref={(el) => (refs.current[i] = el)}
              sx={{
                width: { xs: 44, sm: 52 },
                height: { xs: 52, sm: 60 },
                textAlign: 'center',
                fontSize: '1.6rem',
                fontWeight: 800,
                fontFamily: '"JetBrains Mono", "Courier New", monospace',
                letterSpacing: '2px',
                border: '2px solid',
                borderColor: digit ? 'primary.main' : 'divider',
                borderRadius: '10px',
                backgroundColor: digit ? '#EFF4FF' : '#F8FAFF',
                color: 'primary.main',
                outline: 'none',
                cursor: 'text',
                transition: 'all 0.15s ease',
                '&:focus': {
                  borderColor: 'primary.main',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 0 0 3px rgba(21,101,192,0.12)',
                },
              }}
            />
          ))}
        </Box>

        <Button
          variant="contained" fullWidth size="large"
          onClick={handleVerify}
          disabled={loading || digits.join('').length < OTP_LEN}
          sx={{ mb: 2.5 }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Verify Email'}
        </Button>

        {/* Resend */}
        <Typography variant="body2" sx={{ color:'text.secondary' }}>
          Didn't receive it?{' '}
          <Box
            component="span"
            onClick={countdown === 0 ? handleResend : undefined}
            sx={{
              fontWeight: 700,
              color: countdown === 0 ? 'primary.main' : 'text.disabled',
              cursor: countdown === 0 ? 'pointer' : 'default',
              '&:hover': countdown === 0 ? { textDecoration: 'underline' } : {},
            }}
          >
            {resending
              ? <CircularProgress size={12} sx={{ verticalAlign: 'middle' }} />
              : countdown > 0
                ? `Resend in ${countdown}s`
                : 'Resend OTP'}
          </Box>
        </Typography>

        <Box sx={{ mt:3, pt:2.5, borderTop:'1px solid', borderColor:'divider', display:'flex', alignItems:'center', justifyContent:'center', gap:1 }}>
          <SchoolRounded sx={{ color:'primary.main', fontSize:15 }} />
          <Typography variant="caption" sx={{ color:'text.secondary' }}>
            SmartCampus — Secure Email Verification
          </Typography>
        </Box>
      </Paper>
    </AuthLayout>
  );
}
