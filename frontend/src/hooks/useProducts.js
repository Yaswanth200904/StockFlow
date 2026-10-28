import { useCallback, useEffect, useRef, useState } from 'react';
import * as productService from '@/services/productService';
import * as settingsService from '@/services/settingsService';
import { errMsg } from '@/services/api';

export default function useProducts(search = '') {
  const [products, setProducts] = useState([]);
  const [defaultThreshold, setDefaultThreshold] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const normalizedSearch = search.trim();

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    try {
      const [list, settings] = await Promise.all([
        productService.list(normalizedSearch),
        settingsService.get(),
      ]);
      if (currentRequest !== requestId.current) return;
      setProducts(list);
      setDefaultThreshold(settings.defaultLowStockThreshold);
      setError('');
    } catch (loadError) {
      if (currentRequest !== requestId.current) return;
      setError(errMsg(loadError));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [normalizedSearch]);

  useEffect(() => {
    const timer = setTimeout(load, normalizedSearch ? 200 : 0);
    return () => {
      clearTimeout(timer);
      requestId.current += 1;
    };
  }, [load, normalizedSearch]);
  return { products, defaultThreshold, loading, error, reload: load };
}
