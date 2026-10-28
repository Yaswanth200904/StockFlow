import { api } from './api';

export const signup = (payload) => api('/auth/signup', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const login = (payload) => api('/auth/login', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const me = () => api('/auth/me');

export const logout = () => api('/auth/logout', { method: 'POST' });
