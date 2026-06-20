export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX    = /^[0-9]{10}$/;
export const REGISTER_NUMBER_REGEX = /^(\d{2})([A-Z]{2,6})(\d{2,4})$/;

export const validateRegisterNumberFormat = (rn) => {
  if (!rn || !rn.trim()) return 'Register number is required.';
  const normalized = rn.trim().toUpperCase();
  if (normalized.length < 7 || normalized.length > 12) return 'Must be 7–12 characters (e.g. 22CSE001).';
  if (!REGISTER_NUMBER_REGEX.test(normalized)) return 'Invalid format. Expected: YY + DEPT + SEQ (e.g. 22CSE001).';
  return null;
};

export const validatePassword = (pw) => {
  if (!pw) return 'Password is required.';
  if (pw.length < 8) return 'Minimum 8 characters.';
  if (!PASSWORD_REGEX.test(pw)) return 'Must contain uppercase, lowercase, number and special character.';
  return null;
};

export const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[@$!%*?&]/.test(pw)) score++;
  const levels = [
    { label: '', color: '' },
    { label: 'Weak',      color: '#C62828' },
    { label: 'Fair',      color: '#F57C00' },
    { label: 'Good',      color: '#0277BD' },
    { label: 'Strong',    color: '#2E7D32' },
    { label: 'Very Strong', color: '#1B5E20' },
  ];
  return { score, ...levels[score] };
};
