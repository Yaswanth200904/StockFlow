import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '@/services/authService';
import { setUnauthorizedHandler } from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const clearSession = useCallback(() => setUser(null), []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    authService.me()
      .then((result) => {
        setAuthError('');
        setUser(result.user);
      })
      .catch((error) => {
        setAuthError(error.status === 401 ? '' : error.message);
        setUser(null);
      })
      .finally(() => setLoading(false));
    return () => setUnauthorizedHandler(() => {});
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const result = await authService.login({ email, password });
    setAuthError('');
    setUser(result.user);
  }, []);

  const signup = useCallback(async (payload) => {
    const result = await authService.signup(payload);
    setAuthError('');
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(() => ({ user, loading, authError, login, signup, logout }), [user, loading, authError, login, signup, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
