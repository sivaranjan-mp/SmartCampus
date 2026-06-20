import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);
const TOKEN_KEY = 'sc_token';
const USER_KEY  = 'sc_user';

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const isAuthenticated = Boolean(token && user?.isVerified);

  const saveSession = useCallback((authResponse) => {
    const { accessToken, ...userInfo } = authResponse;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY,  JSON.stringify(userInfo));
    setToken(accessToken);
    setUser(userInfo);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await authApi.getProfile();
      if (data.success) {
        const updated = { ...user, ...data.data };
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
        setUser(updated);
      }
    } catch { logout(); }
  }, [token, user, logout]);

  const value = useMemo(() => ({
    user, token, isAuthenticated,
    saveSession, logout, refreshProfile,
  }), [user, token, isAuthenticated, saveSession, logout, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
