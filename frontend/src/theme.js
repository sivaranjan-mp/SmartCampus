import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: '#1565C0', light: '#5E92F3', dark: '#003C8F', contrastText: '#FFFFFF' },
    secondary:  { main: '#0097A7', light: '#56C8D8', dark: '#006978', contrastText: '#FFFFFF' },
    error:      { main: '#C62828', light: '#FFCDD2', dark: '#B71C1C' },
    warning:    { main: '#F57C00', light: '#FFE0B2', dark: '#E65100' },
    success:    { main: '#2E7D32', light: '#C8E6C9', dark: '#1B5E20' },
    info:       { main: '#0277BD', light: '#B3E5FC', dark: '#01579B' },
    background: { default: '#F0F4FF', paper: '#FFFFFF' },
    text:       { primary: '#0D1B2A', secondary: '#546E7A', disabled: '#8A9BBF' },
    divider:    '#E3EAF4',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-1px' },
    h2: { fontWeight: 800, letterSpacing: '-0.5px' },
    h3: { fontWeight: 700, letterSpacing: '-0.25px' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 600, letterSpacing: '0.2px' },
    body1: { fontWeight: 400, lineHeight: 1.7 },
    body2: { fontWeight: 400, lineHeight: 1.6 },
    caption: { fontWeight: 500, letterSpacing: '0.3px' },
    overline: { fontWeight: 700, letterSpacing: '1.2px' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.4px' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10, boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 16px rgba(21,101,192,0.22)' },
        },
        sizeLarge:    { padding: '12px 32px', fontSize: '0.9rem' },
        sizeMedium:   { padding: '9px 22px', fontSize: '0.875rem' },
        sizeSmall:    { padding: '5px 14px', fontSize: '0.8rem' },
        containedPrimary: {
          background: 'linear-gradient(135deg,#1565C0 0%,#0D47A1 100%)',
          '&:hover': { background: 'linear-gradient(135deg,#1976D2 0%,#1565C0 100%)' },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#F8FAFF',
            '& fieldset': { borderColor: '#C8D4E8' },
            '&:hover fieldset': { borderColor: '#1565C0' },
            '&.Mui-focused fieldset': { borderColor: '#1565C0', borderWidth: 2 },
            '&.Mui-focused': { backgroundColor: '#FFFFFF' },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#1565C0' },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 10, backgroundColor: '#F8FAFF' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1565C0', borderWidth: 2 },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 2px 12px rgba(21,101,192,0.07)' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
        elevation1: { boxShadow: '0 2px 12px rgba(21,101,192,0.07)' },
        elevation2: { boxShadow: '0 4px 20px rgba(21,101,192,0.09)' },
        elevation3: { boxShadow: '0 8px 32px rgba(21,101,192,0.12)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 600, fontSize: '0.72rem' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          borderLeft: '3px solid',
          '&.MuiAlert-standardError':   { borderLeftColor: '#C62828' },
          '&.MuiAlert-standardWarning': { borderLeftColor: '#F57C00' },
          '&.MuiAlert-standardSuccess': { borderLeftColor: '#2E7D32' },
          '&.MuiAlert-standardInfo':    { borderLeftColor: '#0277BD' },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: { fontSize: '0.8rem', fontWeight: 500 },
        '&.Mui-active': { fontWeight: 700 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 6 },
      },
    },
  },
});

export default theme;
