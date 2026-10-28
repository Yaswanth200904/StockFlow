import { api } from './api';

export const list = (search = '') => api(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const get = (id) => api(`/products/${encodeURIComponent(id)}`);
export const create = (product) => api('/products', { method: 'POST', body: JSON.stringify(product) });
export const update = (id, product) => api(`/products/${encodeURIComponent(id)}`, {
  method: 'PUT',
  body: JSON.stringify(product),
});
export const adjustStock = (id, adjustment) => api(`/products/${encodeURIComponent(id)}/adjust-stock`, {
  method: 'PUT',
  body: JSON.stringify(adjustment),
});
export const remove = (id) => api(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
