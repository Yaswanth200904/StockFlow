import { api } from './api';

export const get = () => api('/settings');
export const update = (defaultLowStockThreshold) => api('/settings', {
  method: 'PUT',
  body: JSON.stringify({ defaultLowStockThreshold }),
});
