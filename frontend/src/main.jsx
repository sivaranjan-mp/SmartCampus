import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import App from './App';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '0.875rem',
                fontWeight: 500,
                borderRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              },
              success: { style: { background:'#F1F8E9', color:'#1B5E20', border:'1px solid #C8E6C9' }, iconTheme: { primary:'#2E7D32', secondary:'#F1F8E9' } },
              error:   { style: { background:'#FFF5F5', color:'#7F1D1D', border:'1px solid #FFCDD2' }, iconTheme: { primary:'#C62828', secondary:'#FFF5F5' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
