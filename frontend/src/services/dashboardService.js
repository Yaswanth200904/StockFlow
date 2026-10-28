import { api } from './api';

export const getSummary = () => api('/dashboard/summary');
export const getLowStock = () => api('/dashboard/low-stock');
